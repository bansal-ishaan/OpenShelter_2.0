"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Check, DollarSign, FileText, Moon, Sun, Wallet } from "lucide-react"
import Navbar from "@/components/navbar"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"
import { web3Service } from "@/lib/web3"

export default function LoanDisbursement() {
  const { theme, setTheme } = useTheme()
  const [loanAmount, setLoanAmount] = useState(500)
  const [loanTerm, setLoanTerm] = useState("6")
  const [loanPurpose, setLoanPurpose] = useState("")
  const [activeTab, setActiveTab] = useState("apply")
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const { address } = useWallet()
  const { toast } = useToast()

  const handleLoanAmountChange = (value: number[]) => {
    setLoanAmount(value[0])
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
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
      // Submit to blockchain
      const txHash = await web3Service.applyForLoan(loanAmount, Number.parseInt(loanTerm), loanPurpose)

      // Save to database
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
          amount: loanAmount,
          termMonths: Number.parseInt(loanTerm),
          purpose: loanPurpose,
          transactionHash: txHash,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setApplicationSubmitted(true)
        toast({
          title: "Application Submitted",
          description: "Your loan application has been submitted successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Calculate monthly payment (simple calculation for demo)
  const interestRate = 0.035 // 3.5%
  const monthlyPayment = Number.parseFloat(((loanAmount * (1 + interestRate)) / Number.parseInt(loanTerm)).toFixed(2))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Loan Disbursement</h1>
          <p className="text-muted-foreground mb-8">Apply for a microloan or check your existing applications</p>

          <Tabs defaultValue="apply" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="apply">Apply for Loan</TabsTrigger>
              <TabsTrigger value="status">Application Status</TabsTrigger>
            </TabsList>

            <TabsContent value="apply" className="mt-0">
              {applicationSubmitted ? (
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-center">Application Submitted!</CardTitle>
                    <CardDescription className="text-center">
                      Your loan application has been successfully submitted for review.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4 bg-muted/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Loan Amount</p>
                          <p className="font-medium">${loanAmount} USDC</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Term</p>
                          <p className="font-medium">{loanTerm} months</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Interest Rate</p>
                          <p className="font-medium">3.5%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Monthly Payment</p>
                          <p className="font-medium">${monthlyPayment} USDC</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Purpose</p>
                      <p>{loanPurpose}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-center text-muted-foreground">
                      We'll review your application and notify you of the decision within 24-48 hours.
                    </p>
                    <Button onClick={() => setActiveTab("status")}>Check Application Status</Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for a Microloan</CardTitle>
                    <CardDescription>Fill out the form below to apply for a decentralized microloan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-base">Loan Amount</Label>
                          <div className="flex items-center gap-4 mt-6 mb-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <Slider
                              defaultValue={[500]}
                              max={2000}
                              min={100}
                              step={50}
                              onValueChange={handleLoanAmountChange}
                              className="flex-1"
                            />
                            <span className="font-medium w-16 text-right">${loanAmount}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>$100</span>
                            <span>$2000</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="loan-term">Loan Term (months)</Label>
                          <Select defaultValue="6" onValueChange={setLoanTerm}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select term" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 months</SelectItem>
                              <SelectItem value="6">6 months</SelectItem>
                              <SelectItem value="9">9 months</SelectItem>
                              <SelectItem value="12">12 months</SelectItem>
                              <SelectItem value="18">18 months</SelectItem>
                              <SelectItem value="24">24 months</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="loan-purpose">Purpose of Loan</Label>
                          <textarea
                            id="loan-purpose"
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Briefly describe what you'll use the loan for..."
                            value={loanPurpose}
                            onChange={(e) => setLoanPurpose(e.target.value)}
                          />
                        </div>

                        <div className="border rounded-md p-4 bg-muted/30">
                          <h3 className="font-medium mb-2">Loan Summary</h3>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-muted-foreground">Amount:</div>
                            <div className="font-medium">${loanAmount} USDC</div>
                            <div className="text-muted-foreground">Term:</div>
                            <div className="font-medium">{loanTerm} months</div>
                            <div className="text-muted-foreground">Interest Rate:</div>
                            <div className="font-medium">3.5%</div>
                            <div className="text-muted-foreground">Monthly Payment:</div>
                            <div className="font-medium">${monthlyPayment} USDC</div>
                            <div className="text-muted-foreground">Total Repayment:</div>
                            <div className="font-medium">
                              ${(monthlyPayment * Number.parseInt(loanTerm)).toFixed(2)} USDC
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Collateral Requirements</Label>
                        <div className="text-sm text-muted-foreground">
                          <p>This loan is uncollateralized and based on your on-chain reputation score.</p>
                          <p className="mt-1">
                            Your current reputation score:{" "}
                            <span className="text-green-600 dark:text-green-400 font-medium">Good (725)</span>
                          </p>
                        </div>
                      </div>

                      <Button type="submit" className="w-full">
                        Submit Application
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Your Loan Applications</CardTitle>
                  <CardDescription>Track the status of your current and past loan applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {applicationSubmitted ? (
                    <div className="space-y-4">
                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/50 p-3 flex justify-between items-center">
                          <div className="font-medium">Loan #L-{Math.floor(Math.random() * 10000)}</div>
                          <div className="px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 text-xs rounded-full">
                            Pending Review
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="text-muted-foreground">Amount:</div>
                            <div>${loanAmount} USDC</div>
                            <div className="text-muted-foreground">Submitted:</div>
                            <div>{new Date().toLocaleDateString()}</div>
                            <div className="text-muted-foreground">Term:</div>
                            <div>{loanTerm} months</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              View Details
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Est. decision by: {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/50 p-3 flex justify-between items-center">
                          <div className="font-medium">Loan #L-3842</div>
                          <div className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs rounded-full">
                            Approved
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="text-muted-foreground">Amount:</div>
                            <div>$300 USDC</div>
                            <div className="text-muted-foreground">Approved:</div>
                            <div>{new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">Term:</div>
                            <div>3 months</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              View Details
                            </Button>
                            <Button size="sm" className="gap-1">
                              <Wallet className="h-3.5 w-3.5" />
                              Withdraw Funds
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-md overflow-hidden">
                        <div className="bg-muted/50 p-3 flex justify-between items-center">
                          <div className="font-medium">Loan #L-2571</div>
                          <div className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs rounded-full">
                            Declined
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <div className="text-muted-foreground">Amount:</div>
                            <div>$1,500 USDC</div>
                            <div className="text-muted-foreground">Submitted:</div>
                            <div>{new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">Term:</div>
                            <div>18 months</div>
                          </div>
                          <div className="flex justify-between items-center">
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              View Details
                            </Button>
                            <p className="text-xs text-muted-foreground">Reason: Insufficient reputation score</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                        You haven't submitted any loan applications yet. Apply for a loan to get started.
                      </p>
                      <Button onClick={() => setActiveTab("apply")}>Apply for a Loan</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <div className="py-6 border-t">
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
