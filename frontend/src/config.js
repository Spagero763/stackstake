// ============================================================
// CONTRACT CONFIG
// ============================================================
export const DEPLOYER_ADDRESS = 'ST26TQH4FRPTKHQEYE6HZQG98R4CZE6PTJ8J1YYR8'
export const CONTRACT_NAME    = 'stacking-pool'
export const CONTRACT_ID      = `${DEPLOYER_ADDRESS}.${CONTRACT_NAME}`
export const NETWORK          = 'testnet' // 'mainnet' | 'testnet'

export const USTX          = 1_000_000
export const BLOCK_MINUTES = 10

export const LOCK_PRESETS = [
  { label: 'No Lock',   blocks: 0,     days: 0,  bonusBps: 0   },
  { label: '1 Week',    blocks: 1008,  days: 7,  bonusBps: 50  },
  { label: '1 Month',   blocks: 4320,  days: 30, bonusBps: 150 },
  { label: '3 Months',  blocks: 12960, days: 90, bonusBps: 300 },
]

export const EXPLORER_BASE = 'https://explorer.hiro.so'
export const EXPLORER_TX   = (txId) => `${EXPLORER_BASE}/txid/${txId}?chain=${NETWORK}`
export const EXPLORER_ADDR = (addr) => `${EXPLORER_BASE}/address/${addr}?chain=${NETWORK}`
