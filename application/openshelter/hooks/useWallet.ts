"use client"

import { useState, useEffect } from "react"
import { web3Service } from "@/lib/web3"

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
  }
}

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    checkConnection()

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        } else {
          setAddress("")
          setIsConnected(false)
        }
      }

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error)
      }
    }
  }

  const connect = async () => {
    setIsLoading(true)
    setError("")

    try {
      const walletAddress = await web3Service.connectWallet()
      setAddress(walletAddress)
      setIsConnected(true)
      return walletAddress
    } catch (error: any) {
      setError(error.message || "Failed to connect wallet")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAddress("")
    setIsConnected(false)
  }

  return {
    isConnected,
    address,
    isLoading,
    error,
    connect,
    disconnect,
  }
}
