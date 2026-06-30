import { useState, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useWallet } from './hooks/useWallet'
import { useStaking } from './hooks/useStaking'
import { useContractCall } from './hooks/useContractCall'
import Header from './components/Header'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import StakePage from './pages/StakePage'
import Leaderboard from './pages/Leaderboard'
import PositionPage from './pages/PositionPage'

const SUCCESS_MESSAGES = {
  stake: 'Stake broadcast!',
  'add-stake': 'Added to stake!',
  claim: 'Rewards claimed!',
  unstake: 'Unstake broadcast!',
}

export default function App() {
  const { stxAddress, isConnected, isConnecting, connect, disconnect } = useWallet()
  const {
    stakerStatus,
    poolStats,
    pendingRewards,
    leaderboard,
    loading,
    lastUpdated,
    refetch,
  } = useStaking(stxAddress)
  const [toast, setToast] = useState(null)

  const onSuccess = useCallback(
    (action, txId) => {
      setToast({ msg: SUCCESS_MESSAGES[action] || 'Transaction sent!', txId })
      setTimeout(() => {
        refetch()
        setToast(null)
      }, 6000)
    },
    [refetch],
  )

  const { stake, addStake, claimRewards, unstake, txStatus, action } = useContractCall({
    stxAddress,
    onSuccess,
  })

  const sharedProps = { stxAddress, isConnected, isConnecting, connect, disconnect }
  const stakingProps = {
    stakerStatus,
    poolStats,
    pendingRewards,
    leaderboard,
    loading,
    lastUpdated,
    refetch,
  }
  const callProps = { claimRewards, unstake, stake, addStake, txStatus, action }

  return (
    <div className="app">
      <div className="bg-grid" />
      <div className="bg-glow" />

      <Header {...sharedProps} />

      {toast && <Toast msg={toast.msg} txId={toast.txId} onClose={() => setToast(null)} />}

      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Dashboard {...sharedProps} {...stakingProps} {...callProps} />} />
          <Route
            path="/stake"
            element={
              <StakePage
                {...sharedProps}
                {...stakingProps}
                stake={stake}
                addStake={addStake}
                txStatus={txStatus}
                action={action}
              />
            }
          />
          <Route
            path="/leaderboard"
            element={
              <Leaderboard leaderboard={leaderboard} loading={loading} stxAddress={stxAddress} />
            }
          />
          <Route path="/position/:address" element={<PositionPage leaderboard={leaderboard} />} />
        </Routes>
      </ErrorBoundary>

      <Footer />
    </div>
  )
}
