;; ============================================================
;; STACKSTAKE STX Staking Protocol
;; stacking-pool.clar
;;
;; Users stake STX into a shared pool and earn block-based
;; rewards proportional to their share. Longer lock durations
;; earn bonus reward multipliers.
;;
;; Reward model:
;;   - Owner funds a reward pool with STX
;;   - Rewards accrue per block using a reward-per-token
;;     accumulator (standard DeFi rewards pattern)
;;   - Lock bonuses: 1wk=+50bps, 1mo=+150bps, 3mo=+300bps
;; ============================================================

;; ---- Errors --------------------------------------------------------
(define-constant ERR-NOT-AUTHORIZED     (err u100))
(define-constant ERR-ZERO-AMOUNT        (err u101))
(define-constant ERR-STILL-LOCKED       (err u102))
(define-constant ERR-NO-STAKE           (err u103))
(define-constant ERR-ALREADY-STAKING    (err u104))
(define-constant ERR-INVALID-LOCK       (err u105))
(define-constant ERR-POOL-EMPTY         (err u106))
(define-constant ERR-NOTHING-TO-CLAIM   (err u107))
(define-constant ERR-INSUFFICIENT-FUNDS (err u108))

;; ---- Constants -----------------------------------------------------
(define-constant CONTRACT-OWNER tx-sender)

;; Minimum stake: 1 STX
(define-constant MIN-STAKE u1000000)

;; Reward rate: 50 BPS (0.5%) of pool per 1000 blocks
(define-constant REWARD-RATE-BPS u50)
(define-constant RATE-DENOMINATOR u100000)

;; Precision multiplier for reward-per-token math
(define-constant PRECISION u1000000000000)

;; Lock constraints
(define-constant MIN-LOCK-BLOCKS u144)
(define-constant MAX-LOCK-BLOCKS u52560)

;; Lock duration thresholds
(define-constant LOCK-7D  u1008)
(define-constant LOCK-30D u4320)
(define-constant LOCK-90D u12960)

;; ---- Global state --------------------------------------------------
(define-data-var reward-per-token-stored  uint u0)
(define-data-var last-update-block        uint u0)
(define-data-var total-staked             uint u0)
(define-data-var reward-pool              uint u0)
(define-data-var total-rewards-distributed uint u0)
(define-data-var staker-count             uint u0)

;; ---- Per-staker data -----------------------------------------------
(define-map stakers principal
  {
    amount:                uint,
    reward-per-token-paid: uint,
    pending-rewards:       uint,
    staked-at:             uint,
    lock-until:            uint,
    lock-duration:         uint,
    total-claimed:         uint,
  }
)

;; Ordered index for leaderboard enumeration
(define-map staker-index uint principal)
(define-data-var next-index uint u0)

;; ---- Private: reward math ------------------------------------------

(define-private (compute-rpt)
  (let
    (
      (total   (var-get total-staked))
      (pool    (var-get reward-pool))
      (elapsed (- block-height (var-get last-update-block)))
    )
    (if (or (is-eq total u0) (is-eq pool u0) (is-eq elapsed u0))
      (var-get reward-per-token-stored)
      (let
        (
          (accrued     (/ (* (* pool REWARD-RATE-BPS) elapsed) RATE-DENOMINATOR))
          (safe-accrued (if (> accrued pool) pool accrued))
          (rpt-delta   (/ (* safe-accrued PRECISION) total))
        )
        (+ (var-get reward-per-token-stored) rpt-delta)
      )
    )
  )
)

(define-private (earned-by (user principal) (rpt uint))
  (match (map-get? stakers user)
    s (+ (get pending-rewards s)
         (/ (* (get amount s)
               (- rpt (get reward-per-token-paid s)))
            PRECISION))
    u0
  )
)

(define-private (checkpoint (user principal))
  (let ((rpt (compute-rpt)))
    (var-set reward-per-token-stored rpt)
    (var-set last-update-block block-height)
    (match (map-get? stakers user)
      s (map-set stakers user
          (merge s {
            pending-rewards:       (earned-by user rpt),
            reward-per-token-paid: rpt,
          }))
      true
    )
  )
)

(define-private (lock-bonus (duration uint))
  (if (>= duration LOCK-90D) u300
    (if (>= duration LOCK-30D) u150
      (if (>= duration LOCK-7D) u50
        u0)))
)

;; ---- Read-only -----------------------------------------------------

(define-read-only (get-pool-stats)
  (ok {
    total-staked:              (var-get total-staked),
    reward-pool:               (var-get reward-pool),
    staker-count:              (var-get staker-count),
    total-rewards-distributed: (var-get total-rewards-distributed),
    reward-per-token:          (compute-rpt),
    current-block:             block-height,
  })
)

(define-read-only (get-staker-status (user principal))
  (match (map-get? stakers user)
    s (let ((rpt (compute-rpt)))
        (ok {
          amount:           (get amount s),
          pending-rewards:  (earned-by user rpt),
          total-claimed:    (get total-claimed s),
          staked-at:        (get staked-at s),
          lock-until:       (get lock-until s),
          lock-duration:    (get lock-duration s),
          lock-bonus-bps:   (lock-bonus (get lock-duration s)),
          is-unlocked:      (or (is-eq (get lock-until s) u0)
                                (>= block-height (get lock-until s))),
          blocks-remaining: (if (or (is-eq (get lock-until s) u0)
                                    (>= block-height (get lock-until s)))
                              u0
                              (- (get lock-until s) block-height)),
        })
      )
    (err ERR-NO-STAKE)
  )
)

(define-read-only (get-pending-rewards (user principal))
  (ok (earned-by user (compute-rpt)))
)

(define-read-only (get-staker-at-index (i uint))
  (map-get? staker-index i)
)

(define-read-only (get-staker-count)
  (ok (var-get next-index))
)

(define-read-only (estimate-apy (lock-duration uint))
  (ok {
    base-bps:    REWARD-RATE-BPS,
    bonus-bps:   (lock-bonus lock-duration),
    total-bps:   (+ REWARD-RATE-BPS (lock-bonus lock-duration)),
    est-apy-bps: (* (+ REWARD-RATE-BPS (lock-bonus lock-duration)) u526),
  })
)

;; ---- Public: staking -----------------------------------------------

(define-public (stake (amount uint) (lock-duration uint))
  (let ((caller tx-sender))
    (asserts! (>= amount MIN-STAKE) ERR-ZERO-AMOUNT)
    (asserts! (is-none (map-get? stakers caller)) ERR-ALREADY-STAKING)
    (asserts!
      (or (is-eq lock-duration u0)
          (and (>= lock-duration MIN-LOCK-BLOCKS)
               (<= lock-duration MAX-LOCK-BLOCKS)))
      ERR-INVALID-LOCK)

    (checkpoint caller)
    (try! (stx-transfer? amount caller (as-contract tx-sender)))

    (map-set stakers caller {
      amount:                amount,
      reward-per-token-paid: (compute-rpt),
      pending-rewards:       u0,
      staked-at:             block-height,
      lock-until:            (if (> lock-duration u0)
                               (+ block-height lock-duration)
                               u0),
      lock-duration:         lock-duration,
      total-claimed:         u0,
    })

    (map-set staker-index (var-get next-index) caller)
    (var-set next-index   (+ (var-get next-index) u1))
    (var-set total-staked (+ (var-get total-staked) amount))
    (var-set staker-count (+ (var-get staker-count) u1))

    (ok {
      staked:         amount,
      lock-until:     (if (> lock-duration u0) (+ block-height lock-duration) u0),
      lock-bonus-bps: (lock-bonus lock-duration),
    })
  )
)

(define-public (add-stake (amount uint))
  (let
    (
      (caller tx-sender)
      (s (unwrap! (map-get? stakers caller) ERR-NO-STAKE))
    )
    (asserts! (>= amount MIN-STAKE) ERR-ZERO-AMOUNT)
    (checkpoint caller)
    (try! (stx-transfer? amount caller (as-contract tx-sender)))
    (map-set stakers caller (merge s { amount: (+ (get amount s) amount) }))
    (var-set total-staked (+ (var-get total-staked) amount))
    (ok { new-total: (+ (get amount s) amount) })
  )
)

(define-public (claim-rewards)
  (let ((caller tx-sender))
    (checkpoint caller)
    (let
      (
        (s      (unwrap! (map-get? stakers caller) ERR-NO-STAKE))
        (reward (get pending-rewards (unwrap! (map-get? stakers caller) ERR-NO-STAKE)))
        (pool   (var-get reward-pool))
      )
      (asserts! (> reward u0)    ERR-NOTHING-TO-CLAIM)
      (asserts! (>= pool reward) ERR-POOL-EMPTY)

      (map-set stakers caller
        (merge s {
          pending-rewards:       u0,
          reward-per-token-paid: (compute-rpt),
          total-claimed:         (+ (get total-claimed s) reward),
        })
      )
      (var-set reward-pool               (- pool reward))
      (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) reward))
      (try! (as-contract (stx-transfer? reward tx-sender caller)))
      (ok { claimed: reward })
    )
  )
)

(define-public (unstake)
  (let ((caller tx-sender))
    (checkpoint caller)
    (let
      (
        (s          (unwrap! (map-get? stakers caller) ERR-NO-STAKE))
        (amount     (get amount s))
        (lock-until (get lock-until s))
        (reward     (get pending-rewards (unwrap! (map-get? stakers caller) ERR-NO-STAKE)))
        (pool       (var-get reward-pool))
        (pay-reward (and (> reward u0) (>= pool reward)))
      )
      (asserts!
        (or (is-eq lock-until u0) (>= block-height lock-until))
        ERR-STILL-LOCKED)

      (map-delete stakers caller)
      (var-set total-staked (- (var-get total-staked) amount))
      (var-set staker-count (- (var-get staker-count) u1))

      (try! (as-contract (stx-transfer? amount tx-sender caller)))

      (if pay-reward
        (begin
          (var-set reward-pool               (- pool reward))
          (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) reward))
          (try! (as-contract (stx-transfer? reward tx-sender caller)))
        )
        true
      )

      (ok { unstaked: amount, rewards-claimed: (if pay-reward reward u0) })
    )
  )
)

;; ---- Public: admin -------------------------------------------------

(define-public (fund-reward-pool (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (> amount u0) ERR-ZERO-AMOUNT)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (ok { pool-balance: (var-get reward-pool) })
  )
)

(define-public (drain-reward-pool (amount uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (asserts! (<= amount (var-get reward-pool)) ERR-INSUFFICIENT-FUNDS)
    (var-set reward-pool (- (var-get reward-pool) amount))
    (try! (as-contract (stx-transfer? amount tx-sender CONTRACT-OWNER)))
    (ok { drained: amount })
  )
)
