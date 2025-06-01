import { ethers } from "ethers"
import { CONTRACT_ADDRESSES, CONTRACT_ABIS, CHAIN_CONFIG } from "./contracts"

export class Web3Service {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.Signer | null = null

  async connectWallet(): Promise<string> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask is not installed")
    }

    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      this.provider = new ethers.BrowserProvider(window.ethereum)
      this.signer = await this.provider.getSigner()

      const address = await this.signer.getAddress()

      // Switch to correct network if needed
      await this.switchToCorrectNetwork()

      return address
    } catch (error) {
      console.error("Error connecting wallet:", error)
      throw error
    }
  }

  async switchToCorrectNetwork(): Promise<void> {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}` }],
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${CHAIN_CONFIG.chainId.toString(16)}`,
              chainName: CHAIN_CONFIG.chainName,
              rpcUrls: [CHAIN_CONFIG.rpcUrl],
              blockExplorerUrls: [CHAIN_CONFIG.blockExplorer],
            },
          ],
        })
      }
    }
  }

  getContract(contractName: keyof typeof CONTRACT_ADDRESSES) {
    if (!this.signer) {
      throw new Error("Wallet not connected")
    }

    const address = CONTRACT_ADDRESSES[contractName]
    const abi = CONTRACT_ABIS[contractName]

    return new ethers.Contract(address, abi, this.signer)
  }

  async registerUser(name: string, email: string, documentHash: string, country: string): Promise<string> {
    const contract = this.getContract("USER_REGISTRY")
    const tx = await contract.registerUser(name, email, documentHash, country)
    await tx.wait()
    return tx.hash
  }

  async isUserRegistered(address: string): Promise<boolean> {
    const contract = this.getContract("USER_REGISTRY")
    return await contract.isUserRegistered(address)
  }

  async isUserVerified(address: string): Promise<boolean> {
    const contract = this.getContract("USER_REGISTRY")
    return await contract.isUserVerified(address)
  }

  async applyForLoan(amount: number, termMonths: number, purpose: string): Promise<string> {
    const contract = this.getContract("LOAN_CONTRACT")
    const amountWei = ethers.parseUnits(amount.toString(), 6) // USDC has 6 decimals
    const tx = await contract.applyForLoan(amountWei, termMonths, purpose)
    await tx.wait()
    return tx.hash
  }

  async repayLoan(loanId: number, amount: number): Promise<string> {
    const usdcContract = this.getContract("USDC_TOKEN")
    const loanContract = this.getContract("LOAN_CONTRACT")

    const amountWei = ethers.parseUnits(amount.toString(), 6)

    // First approve the loan contract to spend USDC
    const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.LOAN_CONTRACT, amountWei)
    await approveTx.wait()

    // Then repay the loan
    const repayTx = await loanContract.repayLoan(loanId, amountWei)
    await repayTx.wait()

    return repayTx.hash
  }

  async getReputationScore(address: string): Promise<number> {
    const contract = this.getContract("USER_REGISTRY")
    const score = await contract.getReputationScore(address)
    return Number(score)
  }

  async getUserLoans(address: string): Promise<number[]> {
    const contract = this.getContract("LOAN_CONTRACT")
    const loanIds = await contract.getUserLoans(address)
    return loanIds.map((id: any) => Number(id))
  }

  async getLoanDetails(loanId: number): Promise<any> {
    const contract = this.getContract("LOAN_CONTRACT")
    const details = await contract.getLoanDetails(loanId)
    return {
      amount: Number(ethers.formatUnits(details[0], 6)),
      termMonths: Number(details[1]),
      interestRate: Number(details[2]),
      borrower: details[3],
      status: Number(details[4]),
      remainingBalance: Number(ethers.formatUnits(details[5], 6)),
    }
  }

  async mintVerificationSBT(to: string, tokenURI: string): Promise<string> {
    const contract = this.getContract("VERIFICATION_SBT")
    const tx = await contract.mint(to, tokenURI)
    await tx.wait()
    return tx.hash
  }

  async hasVerificationSBT(address: string): Promise<boolean> {
    const contract = this.getContract("VERIFICATION_SBT")
    return await contract.verify(address)
  }

  async mintVisaSBT(to: string, tokenURI: string): Promise<string> {
    const contract = this.getContract("VISA_SBT")
    const tx = await contract.mint(to, tokenURI)
    await tx.wait()
    return tx.hash
  }

  async hasValidVisa(address: string): Promise<boolean> {
    const contract = this.getContract("VISA_SBT")
    return await contract.hasValidVisa(address)
  }

  async getUSDCBalance(address: string): Promise<number> {
    const contract = this.getContract("USDC_TOKEN")
    const balance = await contract.balanceOf(address)
    return Number(ethers.formatUnits(balance, 6))
  }
}

export const web3Service = new Web3Service()
