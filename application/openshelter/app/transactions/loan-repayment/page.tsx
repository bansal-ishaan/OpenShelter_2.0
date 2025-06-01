"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Check, CreditCard, DollarSign, Moon, Sun, Wallet } from "lucide-react"
import Navbar from "@/components/navbar"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"
import { web3Service } from "@/lib/web3"

export default function LoanRepayment() {
  const { theme, setTheme } = useTheme()
  const [paymentMethod, setPaymentMethod] = useState("wallet")
  const [paymentAmount, setPaymentAmount] = useState("105.75")
  const [paymentSubmitted, setPaymentSubmitted] = useState(false)
  const { address } = useWallet()
  const { toast } = useToast()

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      const loanId = 1 // Get from selected loan

      // Process payment on blockchain
      const txHash = await web3Service.repayLoan(loanId, Number.parseFloat(paymentAmount))

      // Save payment to database
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: "673d1234567890abcdef1234", // Replace with actual loan ID
          walletAddress: address,
          amount: Number.parseFloat(paymentAmount),
          paymentMethod,
          transactionHash: txHash,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setPaymentSubmitted(true)
        toast({
          title: "Payment Successful",
          description: `Payment of $${paymentAmount} USDC processed successfully`,
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Sample active loans data
  const activeLoans = [
    {
      id: "L-3842",
      amount: 300,
      term: 3,
      monthlyPayment: 105.75,
      remainingPayments: 2,
      nextPaymentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      progress: 33,
    },
    {
      id: "L-4156",
      amount: 500,
      term: 6,
      monthlyPayment: 87.5,
      remainingPayments: 5,
      nextPaymentDue: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      progress: 17,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Loan Repayment</h1>
          <p className="text-muted-foreground mb-8">Make payments on your active loans</p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Active Loans</h2>

              <div className="space-y-6">
                {activeLoans.map((loan) => (
                  <Card key={loan.id} className={loan.id === "L-3842" ? "border-primary/50" : ""}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Loan #{loan.id}</CardTitle>
                        {loan.id === "L-3842" && (
                          <div className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs rounded-full">
                            Payment Due
                          </div>
                        )}
                      </div>
                      <CardDescription>
                        ${loan.amount} USDC over {loan.term} months
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Monthly Payment:</div>
                          <div>${loan.monthlyPayment} USDC</div>
                          <div className="text-muted-foreground">Next Payment Due:</div>
                          <div>{loan.nextPaymentDue}</div>
                          <div className="text-muted-foreground">Remaining Payments:</div>
                          <div>
                            {loan.remainingPayments} of {loan.term}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Repayment Progress</span>
                            <span>{loan.progress}%</span>
                          </div>
                          <Progress value={loan.progress} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {loan.id === "L-3842" ? (
                        <Button className="w-full">Make Payment</Button>
                      ) : (
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Make a Payment</h2>

              {paymentSubmitted ? (
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-center">Payment Successful!</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="mb-2">
                      Your payment of <span className="font-medium">${paymentAmount} USDC</span> has been processed.
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">Transaction ID: 0x71e5...3f8a</p>
                    <div className="border rounded-md p-3 bg-muted/30 text-sm text-left mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-muted-foreground">Loan:</div>
                        <div>Loan #L-3842</div>
                        <div className="text-muted-foreground">Remaining Balance:</div>
                        <div>$105.75 USDC</div>
                        <div className="text-muted-foreground">Next Payment Due:</div>
                        <div>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => setPaymentSubmitted(false)}>
                      Make Another Payment
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Make a payment on your active loan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitPayment} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loan-select">Select Loan</Label>
                        <select
                          id="loan-select"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="L-3842">Loan #L-3842 - $300 USDC</option>
                          <option value="L-4156">Loan #L-4156 - $500 USDC</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment-amount">Payment Amount</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="payment-amount"
                            type="text"
                            className="pl-8"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setPaymentAmount("105.75")}
                          >
                            Pay minimum ($105.75)
                          </button>
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => setPaymentAmount("211.50")}
                          >
                            Pay full balance ($211.50)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <RadioGroup defaultValue="wallet" onValueChange={setPaymentMethod}>
                          <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="wallet" id="wallet" />
                            <Label htmlFor="wallet" className="flex items-center gap-2 cursor-pointer">
                              <Wallet className="h-4 w-4" />
                              Connected Wallet (0x71e5...3f8a)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                              <CreditCard className="h-4 w-4" />
                              Credit/Debit Card
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {paymentMethod === "card" && (
                        <div className="space-y-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input id="card-number" placeholder="1234 5678 9012 3456" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input id="expiry" placeholder="MM/YY" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cvc">CVC</Label>
                              <Input id="cvc" placeholder="123" />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="border rounded-md p-3 bg-muted/30">
                        <h3 className="font-medium mb-2">Payment Summary</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-muted-foreground">Payment Amount:</div>
                          <div>${paymentAmount} USDC</div>
                          <div className="text-muted-foreground">Processing Fee:</div>
                          <div>$0.00 USDC</div>
                          <div className="text-muted-foreground font-medium">Total:</div>
                          <div className="font-medium">${paymentAmount} USDC</div>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Make Payment
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <div className="container py-6 border-t">
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OPENShelter. All rights reserved.
          </p>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="rounded-full"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
