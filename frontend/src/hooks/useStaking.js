import { useState, useEffect, useCallback } from 'react'
import { principalCV, uintCV, serializeCV, deserializeCV, cvToValue } from '@stacks/transactions'
import { DEPLOYER_ADDRESS, CONTRACT_NAME, NETWORK } from '../config'

const API = NETWORK === 'mainnet'
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so'

function toHex(bytes) {
  return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fromHex(hex) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex
  return Uint8Array.from(h.match(/.{1,2}/g).map(b => parseInt(b, 16)))
}

async function readOnly(fnName, args, sender) {
  const res = await fetch(
    `${API}/v2/contracts/call-read/${DEPLOYER_ADDRESS}/${CONTRACT_NAME}/${fnName}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: sender || DEPLOYER_ADDRESS,
        arguments: args.map(a => toHex(serializeCV(a))),
      }),
    }
  )
  const data = await res.json()
  if (!data.okay) throw new Error(data.cause || 'failed')
  return cvToValue(deserializeCV(fromHex(data.result)), true)
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
    } catch (e) { console.error('staker-status', e); setStakerStatus(null) }
  }, [stxAddress])

  const fetchPendingRewards = useCallback(async () => {
    if (!stxAddress) { setPendingRewards(null); return }
    try {
      const res = await readOnly('get-pending-rewards', [principalCV(stxAddress)], stxAddress)
      setPendingRewards(res?.value ?? '0')
    } catch (e) { console.error('pending-rewards', e); setPendingRewards(null) }
  }, [stxAddress])

  const fetchPoolStats = useCallback(async () => {
    try {
      const res = await readOnly('get-pool-stats', [], DEPLOYER_ADDRESS)
      setPoolStats(res?.value ?? res)
    } catch (e) { console.error('pool-stats', e) }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const countRes = await readOnly('get-staker-count', [], DEPLOYER_ADDRESS)
      const count = Number(countRes?.value ?? 0)
      if (count === 0) { setLeaderboard([]); return }
      const entries = []
      for (let i = 0; i < Math.min(count, 50); i++) {
        try {
          const addrRes = await readOnly('get-staker-at-index', [uintCV(i)], DEPLOYER_ADDRESS)
          const addr = addrRes?.value
          if (!addr) continue
          const statusRes = await readOnly('get-staker-status', [principalCV(addr)], addr)
          if (statusRes?.value) entries.push({ address: addr, ...statusRes.value })
        } catch {}
      }
      entries.sort((a, b) => Number(b.amount?.value ?? 0) - Number(a.amount?.value ?? 0))
      setLeaderboard(entries)
    } catch (e) { console.error('leaderboard', e) }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchStakerStatus(), fetchPendingRewards(), fetchPoolStats(), fetchLeaderboard()])
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
