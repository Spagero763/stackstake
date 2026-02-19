import { useState, useEffect, useCallback } from 'react'
import { cvToValue, principalCV, uintCV, serializeCV, deserializeCV } from '@stacks/transactions'
import { DEPLOYER_ADDRESS, CONTRACT_NAME, NETWORK } from '../config'

const API = NETWORK === 'mainnet'
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so'

async function readOnly(fnName, args, sender) {
  const body = {
    sender: sender || DEPLOYER_ADDRESS,
    arguments: args.map(a => `0x${Buffer.from(serializeCV(a)).toString('hex')}`),
  }
  const res = await fetch(
    `${API}/v2/contracts/call-read/${DEPLOYER_ADDRESS}/${CONTRACT_NAME}/${fnName}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  const data = await res.json()
  if (!data.okay) throw new Error(data.cause || 'Contract call failed')
  const cv = deserializeCV(Buffer.from(data.result.slice(2), 'hex'))
  return cvToValue(cv, true)
}

export function useStaking(stxAddress) {
  const [stakerStatus,   setStakerStatus]   = useState(null)
  const [poolStats,      setPoolStats]       = useState(null)
  const [pendingRewards, setPendingRewards]  = useState(null)
  const [leaderboard,    setLeaderboard]     = useState([])
  const [loading,        setLoading]         = useState(false)
  const [lastUpdated,    setLastUpdated]     = useState(null)

  const fetchStakerStatus = useCallback(async () => {
    if (!stxAddress) { setStakerStatus(null); return }
    try {
      const res = await readOnly('get-staker-status', [principalCV(stxAddress)], stxAddress)
      setStakerStatus(res?.value ?? null)
    } catch { setStakerStatus(null) }
  }, [stxAddress])

  const fetchPendingRewards = useCallback(async () => {
    if (!stxAddress) { setPendingRewards(null); return }
    try {
      const res = await readOnly('get-pending-rewards', [principalCV(stxAddress)], stxAddress)
      setPendingRewards(res?.value ?? '0')
    } catch { setPendingRewards(null) }
  }, [stxAddress])

  const fetchPoolStats = useCallback(async () => {
    try {
      const res = await readOnly('get-pool-stats', [], DEPLOYER_ADDRESS)
      setPoolStats(res?.value ?? res)
    } catch {}
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const countRes = await readOnly('get-staker-count', [], DEPLOYER_ADDRESS)
      const count = Number(countRes?.value ?? 0)
      if (count === 0) { setLeaderboard([]); return }

      const limit = Math.min(count, 50)
      const entries = []

      for (let i = 0; i < limit; i++) {
        try {
          const addrRes = await readOnly('get-staker-at-index', [uintCV(i)], DEPLOYER_ADDRESS)
          const addr = addrRes?.value
          if (!addr) continue
          const statusRes = await readOnly('get-staker-status', [principalCV(addr)], addr)
          const s = statusRes?.value
          if (s) entries.push({ address: addr, ...s })
        } catch {}
      }

      entries.sort((a, b) => Number(b.amount?.value ?? 0) - Number(a.amount?.value ?? 0))
      setLeaderboard(entries)
    } catch {}
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      fetchStakerStatus(),
      fetchPendingRewards(),
      fetchPoolStats(),
      fetchLeaderboard(),
    ])
    setLastUpdated(new Date())
    setLoading(false)
  }, [fetchStakerStatus, fetchPendingRewards, fetchPoolStats, fetchLeaderboard])

  useEffect(() => {
    refetch()
    const id = setInterval(refetch, 30_000)
    return () => clearInterval(id)
  }, [refetch])

  return { stakerStatus, poolStats, pendingRewards, leaderboard, loading, lastUpdated, refetch }
}