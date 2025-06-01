"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, ArrowLeft, Upload, LockKeyhole, X } from "lucide-react"
import Navbar from "@/components/navbar"
import { WalletConnect } from "@/components/wallet-connect"
import { useToast } from "@/hooks/use-toast"
import { web3Service } from "@/lib/web3"

export default function GetStarted() {
  const { theme, setTheme } = useTheme()
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    document: "",
    walletAddress: "",
  })

  const { toast } = useToast()

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowVerification(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, document: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      // Create document hash (in real app, this would be the IPFS hash of the uploaded document)
      const documentHash = `0x${Math.random().toString(16).substr(2, 64)}`

      // Register user on blockchain
      const txHash = await web3Service.registerUser(formData.name, formData.email, documentHash, formData.country)

      // Save to database
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          documentHash,
          transactionHash: txHash,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

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

        {showAdminLogin ? (
          showVerification ? (
            <Card className="max-w-md mx-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Document Verification</CardTitle>
                  <CardDescription>Review and verify user documents</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowVerification(false)} className="rounded-full">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>User Information</Label>
                  <div className="border rounded-md p-3 bg-muted/50">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Name:</div>
                      <div>John Doe</div>
                      <div className="text-muted-foreground">Email:</div>
                      <div>john@example.com</div>
                      <div className="text-muted-foreground">Country:</div>
                      <div>United States</div>
                      <div className="text-muted-foreground">Document:</div>
                      <div>Passport</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Document Preview</Label>
                  <div className="border rounded-md p-3 flex items-center justify-center bg-muted/50 h-40">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Upload className="h-8 w-8 mb-2" />
                      <span>Document Image</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Verification Notes</Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Add notes about the verification..."
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setShowVerification(false)}
                  className="hover:bg-red-100 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:hover:border-red-800 transition-colors"
                >
                  Reject
                </Button>
                <Button onClick={() => setShowVerification(false)} className="hover:bg-green-600 transition-colors">
                  Approve
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the admin panel</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-id">Admin ID</Label>
                    <Input id="admin-id" placeholder="Enter your admin ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" placeholder="Enter your password" />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="w-full" onClick={() => setShowAdminLogin(false)}>
                  Back to Registration
                </Button>
              </CardFooter>
            </Card>
          )
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Get Started with OPENShelter</CardTitle>
              <CardDescription>Fill out the form below to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    placeholder="Enter your country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Document Type</Label>
                  <Select onValueChange={handleSelectChange} value={formData.document}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="driving-license">Driving License</SelectItem>
                      <SelectItem value="id-proof">ID Proof</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-upload">Upload Document</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">Drag and drop your document here</p>
                    <p className="text-xs text-muted-foreground">or</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <WalletConnect
                onConnect={(address) => {
                  setFormData((prev) => ({ ...prev, walletAddress: address }))
                  toast({
                    title: "Wallet Connected",
                    description: "You can now submit your registration",
                  })
                }}
              />
              <Button className="w-full" onClick={handleSubmit}>
                Submit
              </Button>
              <Button variant="link" className="w-full text-muted-foreground" onClick={() => setShowAdminLogin(true)}>
                <LockKeyhole className="h-4 w-4 mr-2" />
                Admin Access
              </Button>
            </CardFooter>
          </Card>
        )}
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
