// Loading state with a spinner and a caption.
export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  )
}
