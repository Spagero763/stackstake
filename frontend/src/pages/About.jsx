// Short explainer of what StackStake is.
export default function About() {
  return (
    <div className="page about">
      <h1>About StackStake</h1>
      <p>
        StackStake is an STX staking pool on Stacks, the Bitcoin layer for smart
        contracts. Deposit STX, earn block-based rewards proportional to your
        share, and optionally lock for a bonus.
      </p>
      <p>
        Everything the app shows is read straight from the contract. There is no
        backend and no custody. Your wallet signs every action, and your
        principal is always withdrawable once any lock expires.
      </p>
      <h2>How rewards work</h2>
      <p>
        The owner funds a reward pool. Rewards stream out per block and are
        divided across stakers using a reward-per-token accumulator, the same
        pattern used by established DeFi staking contracts.
      </p>
    </div>
  )
}
