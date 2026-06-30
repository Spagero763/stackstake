// Static frequently asked questions.
const FAQS = [
  {
    q: 'How are rewards calculated?',
    a: 'Rewards accrue per block from the funded reward pool and are split across stakers in proportion to their stake using a reward-per-token accumulator.',
  },
  {
    q: 'What do lock durations do?',
    a: 'Locking your stake for a week, a month or three months adds a bonus in basis points. Locks are enforced only on unstake and never block reward claims.',
  },
  {
    q: 'Can I add to my stake later?',
    a: 'Yes. add-stake tops up your position, and your pending rewards are checkpointed first so the new principal does not earn retroactively.',
  },
  {
    q: 'What happens when I unstake?',
    a: 'You receive your principal back plus any claimable rewards in the same transaction, as long as your lock has expired.',
  },
]

export default function Faq() {
  return (
    <div className="page faq">
      <h1>FAQ</h1>
      <div className="faq-list">
        {FAQS.map((item) => (
          <div key={item.q} className="faq-item">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
