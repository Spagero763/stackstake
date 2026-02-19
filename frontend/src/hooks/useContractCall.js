import { useCallback, useState } from 'react'
import { openContractCall } from '@stacks/connect'
import {
  uintCV,
  PostConditionMode,
} from '@stacks/transactions'
import { StacksTestnet, StacksMainnet } from '@stacks/network'
import { DEPLOYER_ADDRESS, CONTRACT_NAME, NETWORK, USTX } from '../config'

const network = NETWORK === 'mainnet' ? new StacksMainnet() : new StacksTestnet()

export function useContractCall({ stxAddress, onSuccess }) {
  const [txStatus, setTxStatus] = useState(null)
  const [txId,     setTxId]     = useState(null)
  const [action,   setAction]   = useState(null)

  const handleFinish = useCallback((actionName) => (data) => {
    setTxId(data.txId)
    setTxStatus('success')
    onSuccess?.(actionName, data.txId)
  }, [onSuccess])

  const handleCancel = useCallback(() => {
    setTxStatus(null)
    setAction(null)
  }, [])

  const stake = useCallback(async (amountStx, lockDuration) => {
    if (!stxAddress) return
    const amountUstx = Math.floor(Number(amountStx) * USTX)
    setTxStatus('pending')
    setAction('stake')
    try {
      await openContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName:    CONTRACT_NAME,
        functionName:    'stake',
        functionArgs:    [uintCV(amountUstx), uintCV(lockDuration)],
        network,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish: handleFinish('stake'),
        onCancel: handleCancel,
      })
    } catch { setTxStatus('error') }
  }, [stxAddress, handleFinish, handleCancel])

  const addStake = useCallback(async (amountStx) => {
    if (!stxAddress) return
    const amountUstx = Math.floor(Number(amountStx) * USTX)
    setTxStatus('pending')
    setAction('add-stake')
    try {
      await openContractCall({
        contractAddress: DEPLOYER_ADDRESS,
        contractName:    CONTRACT_NAME,
        functionName:    'add-stake',
        functionArgs:    [uintCV(amountUstx)],
        network,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        onFinish: handleFinish('add-stake'),
        onCancel: handleCancel,
      })
    } catch { setTxStatus('error') }
  }, [stxAddress, handleFinish, handleCancel])

  const claimRewards = useCallback(async () => {
    if (!stxAddress) return
    setTxStatus('pending')
    setAction('claim')
    try {
      await openContractCall({
        contractAddress:   DEPLOYER_ADDRESS,
        contractName:      CONTRACT_NAME,
        functionName:      'claim-rewards',
        functionArgs:      [],
        network,
        postConditionMode: PostConditionMode.Allow,
        postConditions:    [],
        onFinish: handleFinish('claim'),
        onCancel: handleCancel,
      })
    } catch { setTxStatus('error') }
  }, [stxAddress, handleFinish, handleCancel])

  const unstake = useCallback(async () => {
    if (!stxAddress) return
    setTxStatus('pending')
    setAction('unstake')
    try {
      await openContractCall({
        contractAddress:   DEPLOYER_ADDRESS,
        contractName:      CONTRACT_NAME,
        functionName:      'unstake',
        functionArgs:      [],
        network,
        postConditionMode: PostConditionMode.Allow,
        postConditions:    [],
        onFinish: handleFinish('unstake'),
        onCancel: handleCancel,
      })
    } catch { setTxStatus('error') }
  }, [stxAddress, handleFinish, handleCancel])

  const reset = useCallback(() => {
    setTxStatus(null)
    setTxId(null)
    setAction(null)
  }, [])

  return { stake, addStake, claimRewards, unstake, txStatus, txId, action, reset }
}