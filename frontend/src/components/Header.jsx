import { Link, useLocation } from 'react-router-dom'
import { EXPLORER_ADDR, NETWORK } from '../config'
import { fmtAddr } from '../lib/format'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/stake', label: 'Stake' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/faq', label: 'FAQ' },
]

// Top navigation bar with wallet connect / disconnect.
export default function Header({
  stxAddress,
  isConnected,
  isConnecting,
  connect,
  disconnect,
}) {
  const loc = useLocation()
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-hex">⬡</span>
        <span className="logo-name">StackStake</span>
        <span className="logo-tag">{NETWORK}</span>
      </Link>
      <nav className="nav">
        {NAV_LINKS.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={`nav-link ${loc.pathname === n.to ? 'active' : ''}`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="header-right">
        {isConnected ? (
          <div className="wallet-info">
            <a
              href={EXPLORER_ADDR(stxAddress)}
              target="_blank"
              rel="noreferrer"
              className="addr-link"
            >
              {fmtAddr(stxAddress)}
            </a>
            <button className="btn-disconnect" onClick={disconnect}>
              ✕
            </button>
          </div>
        ) : (
          <button
            className="btn-connect"
            onClick={connect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting…' : 'Connect Wallet'}
          </button>
        )}
      </div>
    </header>
  )
}
