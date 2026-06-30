import { apyTable } from '../lib/apy'

// Show the estimated APY for each lock preset.
export default function ApyTable() {
  const rows = apyTable()
  return (
    <table className="apy-table">
      <thead>
        <tr>
          <th>Lock</th>
          <th>Bonus</th>
          <th>Est. APY</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>+{row.bonusBps} bps</td>
            <td>{row.apyPct.toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
