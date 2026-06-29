import { Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'
import { fmt, fmtAddr, blocksToTime } from '../lib/format'
import { field, isUnlocked, blocksRemaining } from '../lib/fields'

const rankBadge = (i) =>
  i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`

// Ranked table of stakers by position size.
export default function Leaderboard({ leaderboard, loading, stxAddress }) {
  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Leaderboard</h2>
        <p className="page-sub">Top stakers by position size</p>
      </div>

      <div className="panel">
        {loading && leaderboard.length === 0 ? (
          <Spinner label="Loading leaderboard…" />
        ) : leaderboard.length === 0 ? (
          <EmptyState
            message="No stakers yet. Be the first!"
            ctaLabel="Stake Now"
            ctaTo="/stake"
          />
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
                const unlocked = isUnlocked(s)
                return (
                  <tr key={s.address} className={isMe ? 'my-row' : ''}>
                    <td className="rank">{rankBadge(i)}</td>
                    <td className="lb-addr">
                      <a
                        href="https://explorer.hiro.so/?chain=testnet"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.displayAddress || fmtAddr(s.address)}
                      </a>
                      {isMe && <span className="you-badge">you</span>}
                    </td>
                    <td className="lb-amount">{fmt(field(s, 'amount'))} STX</td>
                    <td className="lb-lock">{blocksToTime(blocksRemaining(s))}</td>
                    <td className={`lb-status ${unlocked ? 'green' : ''}`}>
                      {unlocked ? '🔓' : '🔒'}
                    </td>
                    <td>
                      <Link to={`/position/${s.address}`} className="view-link">
                        View ↗
                      </Link>
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
