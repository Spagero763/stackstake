import { useState, useCallback } from 'react'
import { Routes, Route, Link, useLocation, useParams, useNavigate } from 'react-router-dom'
import { useWallet } from './hooks/useWallet'
import { useStaking } from './hooks/useStaking'
import { useContractCall } from './hooks/useContractCall'
import { LOCK_PRESETS, USTX, BLOCK_MINUTES, EXPLORER_TX, EXPLORER_ADDR, DEPLOYER_ADDRESS, CONTRACT_NAME } from './config'

// ---- Utils ----
const fmt    = (u) => (Number(u ?? 0) / USTX).toLocaleString('en-US', { maximumFractionDigits: 4 })
const fmtAddr= (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : ''
const b2time = (b) => {
  const n = Number(b ?? 0)
  if (n <= 0) return 'Unlocked'
  const m = n * BLOCK_MINUTES
  if (m < 60)   return `~${m}m`
  if (m < 1440) return `~${Math.round(m/60)}h`
  return `~${Math.round(m/1440)}d`
}

// ---- Toast ----
function Toast({ msg, txId, onClose }) {
  return (
    <div className="toast" onClick={onClose}>
      <span className="toast-dot" />
      <span>{msg}</span>
      {txId && (
        <a href={EXPLORER_TX(txId)} target="_blank" rel="noreferrer" className="toast-link">
          View TX ↗
        </a>
      )}
    </div>
  )
}

// ---- Header ----
function Header({ stxAddress, isConnected, isConnecting, connect, disconnect }) {
  const loc = useLocation()
  const nav = [
    { to: '/',            label: 'Dashboard' },
    { to: '/stake',       label: 'Stake'     },
    { to: '/leaderboard', label: 'Leaderboard' },
  ]
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-hex">⬡</span>
        <span className="logo-name">StackStake</span>
        <span className="logo-tag">testnet</span>
      </Link>
      <nav className="nav">
        {nav.map(n => (
          <Link key={n.to} to={n.to} className={`nav-link ${loc.pathname === n.to ? 'active' : ''}`}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        {isConnected ? (
          <div className="wallet-info">
            <a href={EXPLORER_ADDR(stxAddress)} target="_blank" rel="noreferrer" className="addr-link">
              {fmtAddr(stxAddress)}
            </a>
            <button className="btn-disconnect" onClick={disconnect}>✕</button>
          </div>
        ) : (
          <button className="btn-connect" onClick={connect} disabled={isConnecting}>
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  )
}

// ---- Dashboard Page ----
function Dashboard({ stxAddress, isConnected, connect, stakerStatus, poolStats, pendingRewards, loading, lastUpdated, refetch, claimRewards, unstake, txStatus, action }) {
  const hasStake   = !!stakerStatus
  const isUnlocked = hasStake && (stakerStatus['is-unlocked']?.value === true || stakerStatus['is-unlocked'] === true)
  const blocksLeft = hasStake ? Number(stakerStatus['blocks-remaining']?.value ?? stakerStatus['blocks-remaining'] ?? 0) : 0
  const amount     = hasStake ? Number(stakerStatus.amount?.value ?? stakerStatus.amount ?? 0) : 0
  const totalClaimed = hasStake ? Number(stakerStatus['total-claimed']?.value ?? 0) : 0
  const pending    = Number(pendingRewards ?? 0)

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">Bitcoin L2 · Live on Testnet</div>
        <h1 className="hero-title">Stake STX.<br /><span className="accent">Earn on-chain.</span></h1>
        <p className="hero-sub">Lock your STX, earn block-based rewards, compete on the leaderboard.</p>
        {!isConnected && (
          <button className="btn-primary hero-cta" onClick={connect}>Connect Wallet to Start</button>
        )}
      </div>

      {/* Pool stats */}
      <div className="stats-row">
        {[
          { label: 'Total Staked',   val: `${fmt(poolStats?.['total-staked']?.value ?? poolStats?.['total-staked'] ?? 0)} STX` },
          { label: 'Reward Pool',    val: `${fmt(poolStats?.['reward-pool']?.value ?? poolStats?.['reward-pool'] ?? 0)} STX` },
          { label: 'Stakers',        val: Number(poolStats?.['staker-count']?.value ?? poolStats?.['staker-count'] ?? 0).toLocaleString() },
          { label: 'Rewards Paid',   val: `${fmt(poolStats?.['total-rewards-distributed']?.value ?? 0)} STX` },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-val">{loading ? '—' : s.val}</div>
            <div className="stat-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* My position */}
      {isConnected && (
        <div className="panel">
          <div className="panel-title">My Position</div>
          {!hasStake ? (
            <div className="empty-state">
              <p>You don't have an active stake.</p>
              <Link to="/stake" className="btn-primary">Stake Now</Link>
            </div>
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
                <div className={`position-val ${isUnlocked ? 'green' : ''}`}>
                  {isUnlocked ? '🔓 Unlocked' : `🔒 ${b2time(blocksLeft)}`}
                </div>
                <div className="position-lbl">Lock Status</div>
              </div>

              {/* Progress bar */}
              {!isUnlocked && (
                <div className="lock-progress">
                  <div className="lock-progress-fill" style={{
                    width: `${Math.max(2, Math.min(98,
                      ((Number(stakerStatus['lock-duration']?.value ?? 1) - blocksLeft) /
                       Number(stakerStatus['lock-duration']?.value ?? 1)) * 100
                    ))}%`
                  }} />
                </div>
              )}

              <div className="position-actions">
                {pending > 0 && (
                  <button
                    className="btn-primary btn-sm"
                    onClick={claimRewards}
                    disabled={txStatus === 'pending' && action === 'claim'}
                  >
                    {txStatus === 'pending' && action === 'claim' ? 'Broadcasting…' : `Claim ${fmt(pending)} STX`}
                  </button>
                )}
                {isUnlocked && (
                  <button
                    className="btn-outline btn-sm"
                    onClick={unstake}
                    disabled={txStatus === 'pending' && action === 'unstake'}
                  >
                    {txStatus === 'pending' && action === 'unstake' ? 'Broadcasting…' : 'Unstake'}
                  </button>
                )}
                <Link
                  to={`/position/${stxAddress}`}
                  className="btn-ghost btn-sm"
                >
                  Share Position ↗
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <div className="last-updated">
          Last updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 30s
          <button className="refresh-btn" onClick={refetch}>↻</button>
        </div>
      )}
    </div>
  )
}

// ---- Stake Page ----
function StakePage({ stxAddress, isConnected, connect, stakerStatus, stake, addStake, txStatus, action }) {
  const [amount,   setAmount]   = useState('')
  const [preset,   setPreset]   = useState(LOCK_PRESETS[0])
  const hasStake = !!stakerStatus

  const handleStake = () => {
    if (!amount || Number(amount) < 1) return
    stake(Number(amount), preset.blocks)
  }

  const handleAddStake = () => {
    if (!amount || Number(amount) < 1) return
    addStake(Number(amount))
  }

  const isPending = txStatus === 'pending'

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Stake STX</h2>
        <p className="page-sub">Lock your STX and earn block-based rewards</p>
      </div>

      {!isConnected ? (
        <div className="panel center">
          <p>Connect your wallet to stake</p>
          <button className="btn-primary" onClick={connect}>Connect Wallet</button>
        </div>
      ) : (
        <div className="stake-layout">
          {/* Form */}
          <div className="panel">
            <div className="panel-title">{hasStake ? 'Add to Stake' : 'New Stake'}</div>

            <div className="field">
              <label>Amount (STX)</label>
              <div className="input-wrap">
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input"
                />
                <span className="input-unit">STX</span>
              </div>
              <span className="field-hint">Minimum 1 STX</span>
            </div>

            {!hasStake && (
              <div className="field">
                <label>Lock Duration</label>
                <div className="presets">
                  {LOCK_PRESETS.map(p => (
                    <button
                      key={p.blocks}
                      className={`preset ${preset.blocks === p.blocks ? 'active' : ''}`}
                      onClick={() => setPreset(p)}
                    >
                      <span className="preset-label">{p.label}</span>
                      {p.bonusBps > 0 && <span className="preset-bonus">+{p.bonusBps/100}%</span>}
                    </button>
                  ))}
                </div>
                <div className="field-hint">
                  {preset.blocks > 0
                    ? `~${preset.blocks.toLocaleString()} blocks · ${preset.days} days lock`
                    : 'No lock — withdraw anytime'}
                </div>
              </div>
            )}

            {/* APY estimate */}
            <div className="apy-box">
              <span className="apy-label">Estimated APY</span>
              <span className="apy-val accent">
                {((50 + preset.bonusBps) * 526 / 10000).toFixed(2)}%
              </span>
            </div>

            <button
              className="btn-primary full"
              onClick={hasStake ? handleAddStake : handleStake}
              disabled={!amount || Number(amount) < 1 || isPending}
            >
              {isPending
                ? '⏳ Broadcasting…'
                : hasStake
                  ? `Add ${amount || '0'} STX to Stake`
                  : `Stake ${amount || '0'} STX${preset.blocks > 0 ? ` for ${preset.label}` : ''}`}
            </button>

            <p className="fine-print">
              Post-condition protected. Your STX goes directly into the smart contract at<br />
              <a href={`https://explorer.hiro.so/address/${DEPLOYER_ADDRESS}.${CONTRACT_NAME}?chain=testnet`}
                target="_blank" rel="noreferrer" className="contract-link">
                {DEPLOYER_ADDRESS.slice(0,8)}…{CONTRACT_NAME}
              </a>
            </p>
          </div>

          {/* Info panel */}
          <div className="info-panel">
            <div className="info-section">
              <div className="info-title">How Rewards Work</div>
              <p>Rewards accrue every block from the protocol reward pool. The longer you lock, the higher your multiplier.</p>
            </div>
            <div className="bonus-table">
              {LOCK_PRESETS.map(p => (
                <div key={p.blocks} className="bonus-row">
                  <span>{p.label}</span>
                  <span className={p.bonusBps > 0 ? 'accent' : 'muted'}>
                    {p.bonusBps > 0 ? `+${p.bonusBps/100}% bonus` : 'Base rate'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Leaderboard Page ----
function Leaderboard({ leaderboard, loading, stxAddress }) {
  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Leaderboard</h2>
        <p className="page-sub">Top stakers by position size</p>
      </div>

      <div className="panel">
        {loading && leaderboard.length === 0 ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading leaderboard…</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>No stakers yet. Be the first!</p>
            <Link to="/stake" className="btn-primary">Stake Now</Link>
          </div>
        ) : (
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>Staked</th>
                <th>Lock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((s, i) => {
                const isMe = s.address === stxAddress
                const isUnlocked = s['is-unlocked']?.value === true || s['is-unlocked'] === true
                const blocksLeft = Number(s['blocks-remaining']?.value ?? 0)
                return (
                  <tr key={s.address} className={isMe ? 'my-row' : ''}>
                    <td className="rank">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </td>
                    <td className="lb-addr">
                      <a href={`https://explorer.hiro.so/?chain=testnet`} target="_blank" rel="noreferrer">
                        {s.displayAddress || fmtAddr(s.address)}
                      </a>
                      {isMe && <span className="you-badge">you</span>}
                    </td>
                    <td className="lb-amount">{fmt(s.amount?.value ?? s.amount)} STX</td>
                    <td className="lb-lock">{b2time(blocksLeft)}</td>
                    <td className={`lb-status ${isUnlocked ? 'green' : ''}`}>
                      {isUnlocked ? '🔓' : '🔒'}
                    </td>
                    <td>
                      <Link to={`/position/${s.address}`} className="view-link">View ↗</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ---- Position Page (shareable) ----
function PositionPage({ leaderboard }) {
  const { address } = useParams()
  const staker = leaderboard.find(s => s.address === address)
  const rank   = leaderboard.findIndex(s => s.address === address) + 1

  const shareUrl = window.location.href

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    alert('Link copied!')
  }

  return (
    <div className="page">
      <div className="position-card">
        <div className="pos-badge">StackStake Position</div>
        <div className="pos-addr">{fmtAddr(address)}</div>

        {!staker ? (
          <div className="empty-state"><p>No active stake found for this address.</p></div>
        ) : (
          <>
            <div className="pos-rank">#{rank} on Leaderboard</div>
            <div className="pos-stats">
              <div className="pos-stat">
                <div className="pos-stat-val">{fmt(staker.amount?.value ?? staker.amount)} STX</div>
                <div className="pos-stat-lbl">Staked</div>
              </div>
              <div className="pos-stat">
                <div className="pos-stat-val">{fmt(staker['total-claimed']?.value ?? 0)} STX</div>
                <div className="pos-stat-lbl">Claimed</div>
              </div>
              <div className="pos-stat">
                <div className={`pos-stat-val ${(staker['is-unlocked']?.value || staker['is-unlocked']) ? 'green' : 'accent'}`}>
                  {(staker['is-unlocked']?.value || staker['is-unlocked']) ? '🔓 Unlocked' : `🔒 ${b2time(staker['blocks-remaining']?.value ?? 0)}`}
                </div>
                <div className="pos-stat-lbl">Lock Status</div>
              </div>
            </div>

            <div className="pos-actions">
              <button className="btn-primary" onClick={copyLink}>Copy Share Link</button>
              <a href={EXPLORER_ADDR(address)} target="_blank" rel="noreferrer" className="btn-outline">
                View on Explorer ↗
              </a>
            </div>
          </>
        )}
        <div className="pos-footer">Built on Stacks · Secured by Bitcoin</div>
      </div>
    </div>
  )
}

// ---- Root App ----
export default function App() {
  const { stxAddress, isConnected, isConnecting, connect, disconnect, network } = useWallet()
  const { stakerStatus, poolStats, pendingRewards, leaderboard, loading, lastUpdated, refetch } = useStaking(stxAddress)
  const [toast, setToast] = useState(null)

  const onSuccess = useCallback((action, txId) => {
    const msgs = {
      stake:     'Stake broadcast!',
      'add-stake': 'Added to stake!',
      claim:     'Rewards claimed!',
      unstake:   'Unstake broadcast!',
    }
    setToast({ msg: msgs[action] || 'Transaction sent!', txId })
    setTimeout(() => { refetch(); setToast(null) }, 6000)
  }, [refetch])

  const { stake, addStake, claimRewards, unstake, txStatus, action, reset } = useContractCall({ stxAddress, onSuccess })

  const sharedProps = { stxAddress, isConnected, isConnecting, connect, disconnect }
  const stakingProps = { stakerStatus, poolStats, pendingRewards, leaderboard, loading, lastUpdated, refetch }
  const callProps = { claimRewards, unstake, stake, addStake, txStatus, action }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <Header {...sharedProps} />

      {toast && <Toast msg={toast.msg} txId={toast.txId} onClose={() => setToast(null)} />}

      <Routes>
        <Route path="/" element={
          <Dashboard {...sharedProps} {...stakingProps} {...callProps} />
        } />
        <Route path="/stake" element={
          <StakePage {...sharedProps} {...stakingProps} stake={stake} addStake={addStake} txStatus={txStatus} action={action} />
        } />
        <Route path="/leaderboard" element={
          <Leaderboard leaderboard={leaderboard} loading={loading} stxAddress={stxAddress} />
        } />
        <Route path="/position/:address" element={
          <PositionPage leaderboard={leaderboard} />
        } />
      </Routes>
    </div>
  )
}
