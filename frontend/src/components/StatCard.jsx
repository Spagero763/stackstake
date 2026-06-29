// Single metric tile used in the pool stats row.
export default function StatCard({ label, value, loading }) {
  return (
    <div className="stat-card">
      <div className="stat-val">{loading ? '—' : value}</div>
      <div className="stat-lbl">{label}</div>
    </div>
  )
}
