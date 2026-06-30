// Thin wrappers around the Hiro explorer URL builders so components do
// not have to import config directly.
import { EXPLORER_TX, EXPLORER_ADDR, EXPLORER_BASE } from '../config'

export const txUrl = (txId) => EXPLORER_TX(txId)
export const addrUrl = (address) => EXPLORER_ADDR(address)
export const contractUrl = (contractId) => `${EXPLORER_BASE}/txid/${contractId}`

// Shorten a transaction id for display.
export const shortTx = (txId) =>
  txId ? `${txId.slice(0, 6)}…${txId.slice(-4)}` : ''
