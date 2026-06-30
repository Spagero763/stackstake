// Shimmering placeholder block shown while data loads.
export default function Skeleton({ width = '100%', height = 16, radius = 6 }) {
  return (
    <span
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
