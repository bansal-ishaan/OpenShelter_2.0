"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"

interface WalletConnectProps {
  onConnect?: (address: string) => void
}

export function WalletConnect({ onConnect }: WalletConnectProps) {
  const { isConnected, address, isLoading, connect } = useWallet()
  const { toast } = useToast()

  const handleConnect = async () => {
    try {
      const walletAddress = await connect()
      toast({
        title: "Wallet Connected",
        description: `Connected to ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      })
      onConnect?.(walletAddress)
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  if (isConnected) {
    return (
      <Button variant="outline" className="gap-2">
        <Wallet className="h-4 w-4" />
        {address.slice(0, 6)}...{address.slice(-4)}
      </Button>
    )
  }

  return (
    <Button onClick={handleConnect} disabled={isLoading} className="gap-2" variant="outline">
      <Wallet className="h-4 w-4" />
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </Button>
  )
}
