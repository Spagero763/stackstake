import { NETWORK } from '../config'
import Badge from './Badge'

// Show which Stacks network the app is pointed at.
export default function NetworkBadge() {
  const tone = NETWORK === 'mainnet' ? 'success' : 'warning'
  return <Badge tone={tone}>{NETWORK}</Badge>
}
