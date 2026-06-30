import { EXPLORER_ADDR } from '../config'
import { fmtAddr } from '../lib/format'

// Render a shortened address that links to the explorer.
export default function AddressLink({ address, full = false }) {
  if (!address) return null
  return (
    <a
      className="addr-link"
      href={EXPLORER_ADDR(address)}
      target="_blank"
      rel="noreferrer"
    >
      {full ? address : fmtAddr(address)}
    </a>
  )
}
