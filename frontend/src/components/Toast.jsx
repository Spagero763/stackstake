import { EXPLORER_TX } from '../config'

// Transient notification with an optional explorer link to the broadcast tx.
export default function Toast({ msg, txId, onClose }) {
  return (
    <div className="toast" onClick={onClose}>
      <span className="toast-dot" />
      <span>{msg}</span>
      {txId && (
        <a
          href={EXPLORER_TX(txId)}
          target="_blank"
          rel="noreferrer"
          className="toast-link"
        >
          View TX ↗
        </a>
      )}
    </div>
  )
}
