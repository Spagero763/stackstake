import { useState, useEffect, useCallback } from 'react'
import { DEPLOYER_ADDRESS, CONTRACT_NAME, NETWORK } from '../config'

const API = NETWORK === 'mainnet'
  ? 'https://api.mainnet.hiro.so'
  : 'https://api.testnet.hiro.so'

const BASE = `${API}/v2/contracts/call-read/${DEPLOYER_ADDRESS}/${CONTRACT_NAME}`

async function callReadOnly(fnName, args, sender) {
  const url = `${BASE}/${fnName}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender: sender || DEPLOYER_ADDRESS, arguments: args }),
  })
  if (!res.ok) throw new Error(`${res.status}`)
  const data = await res.json()
  if (!data.okay) throw new Error(data.cause)
  return data.result
}

function parseHex(hex) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex
  const type = h.slice(0, 2)
  const body = h.slice(2)
  if (type === '07') return { ok: true, value: parseHex('0x' + body) }
  if (type === '08') return { ok: false, value: parseHex('0x' + body) }
  if (type === '01') return BigInt('0x' + body).toString()
  if (type === '03') return true
  if (type === '04') return false
  if (type === '09') return null
  if (type === '0a') return parseHex('0x' + body)
  if (type === '0c') {
    const count = parseInt(body.slice(0, 8), 16)
    let pos = 8
    const obj = {}
    for (let i = 0; i < count; i++) {
      const nameLen = parseInt(body.slice(pos, pos + 2), 16) * 2
      pos += 2
      const name = body.slice(pos, pos + nameLen).match(/.{2}/g)
        .map(b => String.fromCharCode(parseInt(b, 16))).join('')
      pos += nameLen
      const { value, bytesConsumed } = parseHexWithLength('0x' + body.slice(pos))
      obj[name] = value
      pos += bytesConsumed
    }
    return obj
  }
  return hex
}

function parseHexWithLength(hex) {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex
  const type = h.slice(0, 2)
  if (type === '01' || type === '02') return { value: BigInt('0x' + h.slice(2, 34)).toString(), bytesConsumed: 34 }
  if (type === '03') return { value: true, bytesConsumed: 2 }
  if (type === '04') return { value: false, bytesConsumed: 2 }
  if (type === '09') return { value: null, bytesConsumed: 2 }
  if (type === '0a') {
    const inner = parseHexWithLength('0x' + h.slice(2))
    return { value: inner.value, bytesConsumed: 2 + inner.bytesConsumed }
  }
  if (type === '07') {
    const inner = parseHexWithLength('0x' + h.slice(2))
    return { value: inner.value, bytesConsumed: 2 + inner.bytesConsumed }
  }
  if (type === '05') return { value: 'principal', bytesConsumed: 44 }
  if (type === '06') {
    const nameLen = parseInt(h.slice(2, 4), 16) * 2
    const addrLen = 42
    return { value: 'contract', bytesConsumed: 2 + addrLen + 2 + nameLen }
  }
  return { value: hex, bytesConsumed: h.length }
}

let cachedPrincipalHex = null

async function fetchPrincipalHex(stxAddress) {
  if (cachedPrincipalHex) return cachedPrincipalHex
  const countResult = await callReadOnly('get-staker-count', [], DEPLOYER_ADDRESS)
  const count = Number(parseHex(countResult)?.value ?? 0)
  for (let i = 0; i < count; i++) {
    const idxHex = '0x01' + BigInt(i).toString(16).padStart(32, '0')
    const addrResult = await callReadOnly('get-staker-at-index', [idxHex], DEPLOYER_ADDRESS)
    const addrHex = parseHex(addrResult)
    try {
      const statusResult = await callReadOnly('get-staker-status', [addrHex], stxAddress)
      const statusParsed = parseHex(statusResult)
      if (statusParsed?.ok) {
        cachedPrincipalHex = addrHex
        return addrHex
      }
    } catch {}
  }
  return null
}

export function useStaking(stxAddress) {
  const [stakerStatus,   setStakerStatus]   = useState(null)
  const [poolStats,      setPoolStats]       = useState(null)
  const [pendingRewards, setPendingRewards]  = useState(null)
  const [leaderboard,    setLeaderboard]     = useState([])
  const [loading,        setLoading]         = useState(false)
  const [lastUpdated,    setLastUpdated]     = useState(null)

  const fetchPoolStats = useCallback(async () => {
    try {
      const result = await callReadOnly('get-pool-stats', [], DEPLOYER_ADDRESS)
      const parsed = parseHex(result)
      setPoolStats(parsed?.value ?? parsed)
    } catch (e) { console.error('pool-stats', e) }
  }, [])

  const fetchStakerStatus = useCallback(async () => {
    if (!stxAddress) { setStakerStatus(null); return }
    try {
      const principalHex = await fetchPrincipalHex(stxAddress)
      if (!principalHex) { setStakerStatus(null); return }
      const result = await callReadOnly('get-staker-status', [principalHex], stxAddress)
      const parsed = parseHex(result)
      if (parsed?.ok) setStakerStatus(parsed.value)
      else setStakerStatus(null)
    } catch (e) { console.error('staker-status', e); setStakerStatus(null) }
  }, [stxAddress])

  const fetchPendingRewards = useCallback(async () => {
    if (!stxAddress) { setPendingRewards(null); return }
    try {
      const principalHex = await fetchPrincipalHex(stxAddress)
      if (!principalHex) { setPendingRewards(null); return }
      const result = await callReadOnly('get-pending-rewards', [principalHex], stxAddress)
      const parsed = parseHex(result)
      if (parsed?.ok) setPendingRewards(parsed.value)
    } catch (e) { console.error('pending-rewards', e) }
  }, [stxAddress])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const countResult = await callReadOnly('get-staker-count', [], DEPLOYER_ADDRESS)
      const count = Number(parseHex(countResult)?.value ?? 0)
      if (count === 0) { setLeaderboard([]); return }
      const entries = []
      for (let i = 0; i < Math.min(count, 50); i++) {
        try {
          const idxHex = '0x01' + BigInt(i).toString(16).padStart(32, '0')
          const addrResult = await callReadOnly('get-staker-at-index', [idxHex], DEPLOYER_ADDRESS)
          const addrHex = parseHex(addrResult)
          const statusResult = await callReadOnly('get-staker-status', [addrHex], DEPLOYER_ADDRESS)
          const statusParsed = parseHex(statusResult)
          if (statusParsed?.ok) entries.push({ address: addrHex, displayAddress: addrHex.slice(0, 8) + '...' + addrHex.slice(-6), ...statusParsed.value })
        } catch {}
      }
      entries.sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0))
      setLeaderboard(entries)
    } catch (e) { console.error('leaderboard', e) }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchPoolStats(), fetchStakerStatus(), fetchPendingRewards(), fetchLeaderboard()])
    setLastUpdated(new Date())
    setLoading(false)
  }, [fetchPoolStats, fetchStakerStatus, fetchPendingRewards, fetchLeaderboard])

  useEffect(() => {
    cachedPrincipalHex = null
    refetch()
    const id = setInterval(refetch, 30_000)
    return () => clearInterval(id)
  }, [refetch])

  return { stakerStatus, poolStats, pendingRewards, leaderboard, loading, lastUpdated, refetch }
}