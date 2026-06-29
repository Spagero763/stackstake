import { useParams } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import { EXPLORER_ADDR } from '../config'
import { fmt, fmtAddr, blocksToTime } from '../lib/format'
import { field, isUnlocked, blocksRemaining } from '../lib/fields'

// Shareable, read-only view of a single staker's position.
export default function PositionPage({ leaderboard }) {
  const { address } = useParams()
  const staker = leaderboard.find((s) => s.address === address)
  const rank = leaderboard.findIndex((s) => s.address === address) + 1
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
          <EmptyState message="No active stake found for this address." />
        ) : (
          <>
            <div className="pos-rank">#{rank} on Leaderboard</div>
            <div className="pos-stats">
              <div className="pos-stat">
                <div className="pos-stat-val">{fmt(field(staker, 'amount'))} STX</div>
                <div className="pos-stat-lbl">Staked</div>
              </div>
              <div className="pos-stat">
                <div className="pos-stat-val">{fmt(field(staker, 'total-claimed'))} STX</div>
                <div className="pos-stat-lbl">Claimed</div>
              </div>
              <div className="pos-stat">
                <div className={`pos-stat-val ${isUnlocked(staker) ? 'green' : 'accent'}`}>
                  {isUnlocked(staker)
                    ? '🔓 Unlocked'
                    : `🔒 ${blocksToTime(blocksRemaining(staker))}`}
                </div>
                <div className="pos-stat-lbl">Lock Status</div>
              </div>
            </div>

            <div className="pos-actions">
              <button className="btn-primary" onClick={copyLink}>
                Copy Share Link
              </button>
              <a
                href={EXPLORER_ADDR(address)}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
              >
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
