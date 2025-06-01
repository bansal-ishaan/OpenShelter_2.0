"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Moon,
  Sun,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Plane,
  MapPin,
  Calendar,
  User,
  Shield,
} from "lucide-react"
import Navbar from "@/components/navbar"
import { WalletConnect } from "@/components/wallet-connect"
import { useWallet } from "@/hooks/useWallet"
import { useToast } from "@/hooks/use-toast"
import { web3Service } from "@/lib/web3"

interface VisaApplication {
  id: string
  applicantName: string
  destinationCountry: string
  visaType: string
  applicationDate: string
  status: "pending" | "under-review" | "approved" | "rejected"
  estimatedProcessingTime: string
  documents: string[]
  hasVisaSBT: boolean
}

export default function VisaPage() {
  const { theme, setTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("apply")
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [hasVisaSBT, setHasVisaSBT] = useState(false)
  const [isCheckingVisa, setIsCheckingVisa] = useState(false)
  const { address, isConnected } = useWallet()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    nationality: "",
    passportNumber: "",
    destinationCountry: "",
    visaType: "",
    purposeOfTravel: "",
    plannedDuration: "",
    contactEmail: "",
    contactPhone: "",
  })

  // Sample visa applications data
  const [applications, setApplications] = useState<VisaApplication[]>([
    {
      id: "VA-2024-001",
      applicantName: "John Doe",
      destinationCountry: "Canada",
      visaType: "Refugee Protection",
      applicationDate: "2024-01-15",
      status: "approved",
      estimatedProcessingTime: "6-8 weeks",
      documents: ["passport", "identity-proof", "sponsor-letter"],
      hasVisaSBT: true,
    },
    {
      id: "VA-2024-002",
      applicantName: "John Doe",
      destinationCountry: "Germany",
      visaType: "Humanitarian Visa",
      applicationDate: "2024-02-01",
      status: "under-review",
      estimatedProcessingTime: "4-6 weeks",
      documents: ["passport", "medical-certificate", "background-check"],
      hasVisaSBT: false,
    },
  ])

  useEffect(() => {
    if (address && isConnected) {
      checkVisaStatus()
    }
  }, [address, isConnected])

  const checkVisaStatus = async () => {
    if (!address) return

    setIsCheckingVisa(true)
    try {
      const hasVisa = await web3Service.hasValidVisa(address)
      setHasVisaSBT(hasVisa)
    } catch (error) {
      console.error("Error checking visa status:", error)
    } finally {
      setIsCheckingVisa(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to submit a visa application",
        variant: "destructive",
      })
      return
    }

    try {
      // Create metadata for the visa application
      const metadata = {
        name: formData.fullName,
        destinationCountry: formData.destinationCountry,
        visaType: formData.visaType,
        applicationDate: new Date().toISOString(),
        purpose: formData.purposeOfTravel,
      }

      // In a real application, this would be uploaded to IPFS
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      // Submit to database first
      const response = await fetch("/api/visa-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          walletAddress: address,
          status: "pending",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Add to local state for immediate UI update
        const newApplication: VisaApplication = {
          id: data.applicationId,
          applicantName: formData.fullName,
          destinationCountry: formData.destinationCountry,
          visaType: formData.visaType,
          applicationDate: new Date().toLocaleDateString(),
          status: "pending",
          estimatedProcessingTime: "4-8 weeks",
          documents: ["passport", "identity-proof"],
          hasVisaSBT: false,
        }

        setApplications((prev) => [newApplication, ...prev])
        setApplicationSubmitted(true)

        toast({
          title: "Application Submitted",
          description: "Your visa application has been submitted successfully",
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "under-review":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "under-review":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
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

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Plane className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Visa Services</h1>
          </div>
          <p className="text-muted-foreground mb-8">
            Apply for visas and manage your travel documentation through our secure blockchain platform
          </p>

          {/* Visa SBT Status Card */}
          {isConnected && (
            <Card className="mb-8 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Visa SBT Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isCheckingVisa ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Checking visa status...</span>
                  </div>
                ) : hasVisaSBT ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">You have a valid Visa SBT</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-5 w-5" />
                    <span>No Visa SBT found. Apply for a visa to receive your digital credential.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="apply" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="apply">Apply for Visa</TabsTrigger>
              <TabsTrigger value="status">Application Status</TabsTrigger>
              <TabsTrigger value="documents">Required Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="apply" className="mt-0">
              {applicationSubmitted ? (
                <Card>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-center">Application Submitted!</CardTitle>
                    <CardDescription className="text-center">
                      Your visa application has been successfully submitted for review.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-md p-4 bg-muted/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Applicant Name</p>
                          <p className="font-medium">{formData.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Destination</p>
                          <p className="font-medium">{formData.destinationCountry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Visa Type</p>
                          <p className="font-medium">{formData.visaType}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Processing Time</p>
                          <p className="font-medium">4-8 weeks</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-center text-muted-foreground">
                      We'll review your application and notify you of updates. You can track progress in the Application
                      Status tab.
                    </p>
                    <Button onClick={() => setActiveTab("status")}>Check Application Status</Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Visa Application Form</CardTitle>
                    <CardDescription>
                      Complete the form below to apply for a visa. All information will be securely stored on the
                      blockchain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitApplication} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth">Date of Birth</Label>
                          <Input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nationality">Nationality</Label>
                          <Input
                            id="nationality"
                            name="nationality"
                            placeholder="Enter your nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passportNumber">Passport Number</Label>
                          <Input
                            id="passportNumber"
                            name="passportNumber"
                            placeholder="Enter passport number"
                            value={formData.passportNumber}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="destinationCountry">Destination Country</Label>
                          <Select onValueChange={(value) => handleSelectChange("destinationCountry", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select destination country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="canada">Canada</SelectItem>
                              <SelectItem value="germany">Germany</SelectItem>
                              <SelectItem value="france">France</SelectItem>
                              <SelectItem value="sweden">Sweden</SelectItem>
                              <SelectItem value="norway">Norway</SelectItem>
                              <SelectItem value="australia">Australia</SelectItem>
                              <SelectItem value="new-zealand">New Zealand</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="visaType">Visa Type</Label>
                          <Select onValueChange={(value) => handleSelectChange("visaType", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select visa type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="refugee-protection">Refugee Protection</SelectItem>
                              <SelectItem value="humanitarian">Humanitarian Visa</SelectItem>
                              <SelectItem value="family-reunification">Family Reunification</SelectItem>
                              <SelectItem value="student">Student Visa</SelectItem>
                              <SelectItem value="work">Work Permit</SelectItem>
                              <SelectItem value="transit">Transit Visa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="purposeOfTravel">Purpose of Travel</Label>
                        <textarea
                          id="purposeOfTravel"
                          name="purposeOfTravel"
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Describe the purpose of your travel..."
                          value={formData.purposeOfTravel}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plannedDuration">Planned Duration</Label>
                          <Input
                            id="plannedDuration"
                            name="plannedDuration"
                            placeholder="e.g., 6 months, permanent"
                            value={formData.plannedDuration}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactEmail">Contact Email</Label>
                          <Input
                            id="contactEmail"
                            name="contactEmail"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.contactEmail}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Document Upload</Label>
                        <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground mb-1">Upload required documents</p>
                          <p className="text-xs text-muted-foreground mb-2">Passport, photos, supporting documents</p>
                          <Button variant="outline" size="sm" type="button">
                            Browse Files
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        {!isConnected && (
                          <WalletConnect
                            onConnect={() => {
                              toast({
                                title: "Wallet Connected",
                                description: "You can now submit your visa application",
                              })
                            }}
                          />
                        )}
                        <Button type="submit" className="w-full" disabled={!isConnected}>
                          Submit Visa Application
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="status" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Your Visa Applications</CardTitle>
                  <CardDescription>Track the status of your current and past visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  {applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map((app) => (
                        <div key={app.id} className="border rounded-md overflow-hidden">
                          <div className="bg-muted/50 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">Application #{app.id}</div>
                              <Badge className={getStatusColor(app.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(app.status)}
                                  {app.status.replace("-", " ").toUpperCase()}
                                </div>
                              </Badge>
                              {app.hasVisaSBT && (
                                <Badge variant="outline" className="border-green-500 text-green-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  SBT Issued
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                              <div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Destination:
                                </div>
                                <div className="font-medium">{app.destinationCountry}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  Visa Type:
                                </div>
                                <div className="font-medium">{app.visaType}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Applied:
                                </div>
                                <div className="font-medium">{app.applicationDate}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Processing:
                                </div>
                                <div className="font-medium">{app.estimatedProcessingTime}</div>
                              </div>
                            </div>

                            {app.status === "under-review" && (
                              <div className="mb-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span>Processing Progress</span>
                                  <span>65%</span>
                                </div>
                                <Progress value={65} className="h-2" />
                              </div>
                            )}

                            <div className="flex justify-between items-center">
                              <Button variant="outline" size="sm" className="gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                View Details
                              </Button>
                              {app.status === "approved" && !app.hasVisaSBT && (
                                <Button size="sm" className="gap-1">
                                  <Shield className="h-3.5 w-3.5" />
                                  Claim Visa SBT
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                        <Plane className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-2">No Applications Yet</h3>
                      <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                        You haven't submitted any visa applications yet. Apply for a visa to get started.
                      </p>
                      <Button onClick={() => setActiveTab("apply")}>Apply for Visa</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Required Documents</CardTitle>
                  <CardDescription>Documents needed for different types of visa applications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        General Requirements (All Visa Types)
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Valid passport (minimum 6 months validity)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Recent passport-sized photographs
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Completed visa application form
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Proof of identity (birth certificate, national ID)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Refugee Protection Visa
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          UNHCR refugee status documentation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Country of origin documentation
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Medical examination results
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Police clearance certificate
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Family Reunification
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Proof of family relationship (marriage/birth certificates)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Sponsor's proof of status and income
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Accommodation arrangements
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Financial support documentation
                        </li>
                      </ul>
                    </div>

                    <div className="bg-muted/30 p-4 rounded-md">
                      <h4 className="font-medium mb-2">Digital Document Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        All documents uploaded through OPENShelter are cryptographically verified and stored securely on
                        IPFS. Your Verification SBT ensures the authenticity of your identity documents.
                      </p>
                    </div>
                  </div>
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
