import { useState } from 'react'
import { LOCK_PRESETS, DEPLOYER_ADDRESS, CONTRACT_NAME } from '../config'
import { estApyPct } from '../lib/format'
import ApyTable from '../components/ApyTable'

// Stake form: new stake with a lock preset, or add to an existing stake.
export default function StakePage({
  isConnected,
  connect,
  stakerStatus,
  stake,
  addStake,
  txStatus,
}) {
  const [amount, setAmount] = useState('')
  const [preset, setPreset] = useState(LOCK_PRESETS[0])
  const hasStake = !!stakerStatus
  const isPending = txStatus === 'pending'
  const validAmount = amount && Number(amount) >= 1

  const handleStake = () => {
    if (!validAmount) return
    stake(Number(amount), preset.blocks)
  }

  const handleAddStake = () => {
    if (!validAmount) return
    addStake(Number(amount))
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="page-title">Stake STX</h2>
        <p className="page-sub">Lock your STX and earn block-based rewards</p>
      </div>

      {!isConnected ? (
        <div className="panel center">
          <p>Connect your wallet to stake</p>
          <button className="btn-primary" onClick={connect}>
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="stake-layout">
          <div className="panel">
            <div className="panel-title">{hasStake ? 'Add to Stake' : 'New Stake'}</div>

            <div className="field">
              <label>Amount (STX)</label>
              <div className="input-wrap">
                <input
                  type="number"
                  min="1"
                  placeholder="100"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input"
                />
                <span className="input-unit">STX</span>
              </div>
              <span className="field-hint">Minimum 1 STX</span>
            </div>

            {!hasStake && (
              <div className="field">
                <label>Lock Duration</label>
                <div className="presets">
                  {LOCK_PRESETS.map((p) => (
                    <button
                      key={p.blocks}
                      className={`preset ${preset.blocks === p.blocks ? 'active' : ''}`}
                      onClick={() => setPreset(p)}
                    >
                      <span className="preset-label">{p.label}</span>
                      {p.bonusBps > 0 && (
                        <span className="preset-bonus">+{p.bonusBps / 100}%</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="field-hint">
                  {preset.blocks > 0
                    ? `~${preset.blocks.toLocaleString()} blocks · ${preset.days} days lock`
                    : 'No lock — withdraw anytime'}
                </div>
              </div>
            )}

            <div className="apy-box">
              <span className="apy-label">Estimated APY</span>
              <span className="apy-val accent">
                {estApyPct(50, preset.bonusBps).toFixed(2)}%
              </span>
            </div>

            <button
              className="btn-primary full"
              onClick={hasStake ? handleAddStake : handleStake}
              disabled={!validAmount || isPending}
            >
              {isPending
                ? '⏳ Broadcasting…'
                : hasStake
                  ? `Add ${amount || '0'} STX to Stake`
                  : `Stake ${amount || '0'} STX${preset.blocks > 0 ? ` for ${preset.label}` : ''}`}
            </button>

            <p className="fine-print">
              Post-condition protected. Your STX goes directly into the smart contract at
              <br />
              <a
                href={`https://explorer.hiro.so/address/${DEPLOYER_ADDRESS}.${CONTRACT_NAME}?chain=testnet`}
                target="_blank"
                rel="noreferrer"
                className="contract-link"
              >
                {DEPLOYER_ADDRESS.slice(0, 8)}…{CONTRACT_NAME}
              </a>
            </p>
          </div>
        </div>
      )}

      <div className="apy-section">
        <h3 className="panel-title">APY by lock</h3>
        <ApyTable />
      </div>
    </div>
  )
}
