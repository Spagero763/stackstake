import { clamp } from '../lib/num'

// Horizontal progress bar driven by a 0..100 percentage.
export default function ProgressBar({ percent = 0, label }) {
  const pct = clamp(Number(percent) || 0, 0, 100)
  return (
    <div className="progress">
      {label && <div className="progress-label">{label}</div>}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
