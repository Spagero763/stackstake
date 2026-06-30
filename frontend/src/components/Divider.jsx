// Horizontal divider with an optional centered label.
export default function Divider({ label }) {
  if (!label) return <hr className="divider" />
  return (
    <div className="divider-labeled">
      <span className="divider-line" />
      <span className="divider-text">{label}</span>
      <span className="divider-line" />
    </div>
  )
}
