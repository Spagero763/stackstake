import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import { fmt, blocksToTime } from '../lib/format'
import { field, numField, isUnlocked, blocksRemaining } from '../lib/fields'

// Landing page: hero, pool stats, and the connected user's position.
export default function Dashboard({
  stxAddress,
  isConnected,
  connect,
  stakerStatus,
  poolStats,
  pendingRewards,
  loading,
  lastUpdated,
  refetch,
  claimRewards,
  unstake,
  txStatus,
  action,
}) {
  const hasStake = !!stakerStatus
  const unlocked = hasStake && isUnlocked(stakerStatus)
  const blocksLeft = hasStake ? blocksRemaining(stakerStatus) : 0
  const amount = hasStake ? numField(stakerStatus, 'amount') : 0
  const totalClaimed = hasStake ? numField(stakerStatus, 'total-claimed') : 0
  const pending = Number(pendingRewards ?? 0)
  const lockDuration = Number(field(stakerStatus, 'lock-duration', 1)) || 1
  const isClaiming = txStatus === 'pending' && action === 'claim'
  const isUnstaking = txStatus === 'pending' && action === 'unstake'

  const stats = [
    { label: 'Total Staked', value: `${fmt(numField(poolStats, 'total-staked'))} STX` },
    { label: 'Reward Pool', value: `${fmt(numField(poolStats, 'reward-pool'))} STX` },
    { label: 'Stakers', value: numField(poolStats, 'staker-count').toLocaleString() },
    { label: 'Rewards Paid', value: `${fmt(numField(poolStats, 'total-rewards-distributed'))} STX` },
  ]

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-badge">Bitcoin L2 · Live on Testnet</div>
        <h1 className="hero-title">
          Stake STX.
          <br />
          <span className="accent">Earn on-chain.</span>
        </h1>
        <p className="hero-sub">
          Lock your STX, earn block-based rewards, compete on the leaderboard.
        </p>
        {!isConnected && (
          <button className="btn-primary hero-cta" onClick={connect}>
            Connect Wallet to Start
          </button>
        )}
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} loading={loading} />
        ))}
      </div>

      {isConnected && (
        <div className="panel">
          <div className="panel-title">My Position</div>
          {!hasStake ? (
            <EmptyState
              message="You don't have an active stake."
              ctaLabel="Stake Now"
              ctaTo="/stake"
            />
          ) : (
            <div className="position-grid">
              <div className="position-item">
                <div className="position-val">{fmt(amount)} STX</div>
                <div className="position-lbl">Staked</div>
              </div>
              <div className="position-item">
                <div className="position-val accent">{fmt(pending)} STX</div>
                <div className="position-lbl">Pending Rewards</div>
              </div>
              <div className="position-item">
                <div className="position-val">{fmt(totalClaimed)} STX</div>
                <div className="position-lbl">Total Claimed</div>
              </div>
              <div className="position-item">
                <div className={`position-val ${unlocked ? 'green' : ''}`}>
                  {unlocked ? '🔓 Unlocked' : `🔒 ${blocksToTime(blocksLeft)}`}
                </div>
                <div className="position-lbl">Lock Status</div>
              </div>

              {!unlocked && (
                <div className="lock-progress">
                  <div
                    className="lock-progress-fill"
                    style={{
                      width: `${Math.max(
                        2,
                        Math.min(98, ((lockDuration - blocksLeft) / lockDuration) * 100),
                      )}%`,
                    }}
                  />
                </div>
              )}

              <div className="position-actions">
                {pending > 0 && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={claimRewards}
                    disabled={isClaiming}
                  >
                    {isClaiming ? 'Broadcasting…' : `Claim ${fmt(pending)} STX`}
                  </button>
                )}
                {unlocked && (
                  <button
                    className="btn-outline btn-sm"
                    onClick={unstake}
                    disabled={isUnstaking}
                  >
                    {isUnstaking ? 'Broadcasting…' : 'Unstake'}
                  </button>
                )}
                <Link to={`/position/${stxAddress}`} className="btn-ghost btn-sm">
                  Share Position ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {lastUpdated && (
        <div className="last-updated">
          Last updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 30s
          <button className="refresh-btn" onClick={refetch}>
            ↻
          </button>
        </div>
      )}
    </div>
  )
}
