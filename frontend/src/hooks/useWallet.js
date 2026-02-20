import { useState, useEffect, useCallback } from 'react'
import { showConnect, disconnect } from '@stacks/connect'
import { StacksTestnet, StacksMainnet } from '@stacks/network'
import { NETWORK } from '../config'

const appDetails = {
  name: 'StackStake',
  icon: window.location.origin + '/logo.png',
}

export function useWallet() {
  const [userData, setUserData]     = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('stackstake-user')
      if (saved) setUserData(JSON.parse(saved))
    } catch {}
  }, [])

  const connect = useCallback(() => {
    setIsConnecting(true)
    showConnect({
      appDetails,
      onFinish: ({ userSession }) => {
        const data = userSession.loadUserData()
        setUserData(data)
        localStorage.setItem('stackstake-user', JSON.stringify(data))
        setIsConnecting(false)
      },
      onCancel: () => setIsConnecting(false),
    })
  }, [])

  const disconnectWallet = useCallback(() => {
    disconnect()
    localStorage.removeItem('stackstake-user')
    setUserData(null)
  }, [])

  const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

  const stxAddress = userData?.profile?.stxAddress?.[
    NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
  ]

  return {
    userData,
    stxAddress,
    network,
    isConnected: !!stxAddress,
    isConnecting,
    connect,
    disconnect: disconnectWallet,
  }
}
