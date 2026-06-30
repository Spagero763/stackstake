import { Link } from 'react-router-dom'

// Fallback route for unknown paths.
export default function NotFound() {
  return (
    <div className="page not-found">
      <h1>404</h1>
      <p>This page drifted off chain.</p>
      <Link to="/" className="btn-primary">
        Back to dashboard
      </Link>
    </div>
  )
}
