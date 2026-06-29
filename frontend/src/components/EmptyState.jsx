import { Link } from 'react-router-dom'

// Empty placeholder with an optional call-to-action link.
export default function EmptyState({ message, ctaLabel, ctaTo }) {
  return (
    <div className="empty-state">
      <p>{message}</p>
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
