import { Link } from 'react-router-dom'
import NetworkBadge from './NetworkBadge'

// App footer with links and the active network.
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <span>StackStake</span>
        <NetworkBadge />
      </div>
      <nav className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/faq">FAQ</Link>
        <a href="https://github.com/Spagero763/stackstake" target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="https://explorer.hiro.so" target="_blank" rel="noreferrer">
          Explorer
        </a>
      </nav>
    </footer>
  )
}
