// Validation helpers for the stake form.
import { USTX } from '../config'

// Minimum stake enforced by the contract: 1 STX.
export const MIN_STAKE_STX = 1

// Validate a stake amount entered in STX against an optional balance.
// Returns { valid, error } so the form can show inline feedback.
export function validateStakeAmount(input, balanceUstx = null) {
  if (input === '' || input === null || input === undefined) {
    return { valid: false, error: 'Enter an amount' }
  }

  const amount = Number(input)
  if (Number.isNaN(amount)) {
    return { valid: false, error: 'Not a number' }
  }
  if (amount <= 0) {
    return { valid: false, error: 'Amount must be positive' }
  }
  if (amount < MIN_STAKE_STX) {
    return { valid: false, error: `Minimum stake is ${MIN_STAKE_STX} STX` }
  }
  if (balanceUstx !== null && amount * USTX > Number(balanceUstx)) {
    return { valid: false, error: 'Insufficient balance' }
  }

  return { valid: true, error: null }
}
