"use client"
import { createContext, useContext, useState } from 'react'
const WalletContext = createContext()
export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null)
  return (
    <WalletContext.Provider value={{ account, setAccount }}>
      {children}
    </WalletContext.Provider>
  )
}
export const useWallet = () => useContext(WalletContext)