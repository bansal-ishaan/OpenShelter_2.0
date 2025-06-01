"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CheckCircle, Wallet, Shield, Eye, Coins } from "lucide-react"

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState("identity")

  return (
    <section className="py-20">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">See OPENShelter in Action</h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            Experience how our platform empowers refugees with secure digital identity and financial access.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="identity">Identity Wallet</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="microloan">Microloan Access</TabsTrigger>
            </TabsList>
            <div className="relative">
              <TabsContent value="identity" className="mt-0">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Wallet className="h-6 w-6 text-primary" />
                          Secure Identity Wallet
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Self-sovereign identity controlled entirely by the user</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Encrypted storage of personal credentials and documents</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Biometric security ensures only you can access your data</span>
                          </li>
                        </ul>
                        <Button className="mt-6">Try Demo Wallet</Button>
                      </div>
                      <div className="bg-background p-4 rounded-lg border">
                        <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden relative">
                          <div className="absolute inset-0 flex flex-col">
                            <div className="bg-primary/10 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <span className="font-medium">OPENShelter Wallet</span>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col">
                              <div className="text-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-xl font-bold">JD</span>
                                </div>
                                <div className="font-medium">John Doe</div>
                                <div className="text-xs text-muted-foreground">ID: 0x71...3e4f</div>
                              </div>
                              <div className="flex-1 space-y-3">
                                <div className="bg-muted/50 p-3 rounded-md flex items-center gap-3">
                                  <Shield className="h-5 w-5 text-green-500" />
                                  <div>
                                    <div className="text-sm font-medium">UNHCR Verification</div>
                                    <div className="text-xs text-muted-foreground">Issued: May 2023</div>
                                  </div>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-md flex items-center gap-3">
                                  <Shield className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <div className="text-sm font-medium">Medical Record</div>
                                    <div className="text-xs text-muted-foreground">Issued: Jun 2023</div>
                                  </div>
                                </div>
                                <div className="bg-muted/50 p-3 rounded-md flex items-center gap-3">
                                  <Shield className="h-5 w-5 text-amber-500" />
                                  <div>
                                    <div className="text-sm font-medium">Education Certificate</div>
                                    <div className="text-xs text-muted-foreground">Issued: Aug 2023</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="verification" className="mt-0">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Eye className="h-6 w-6 text-primary" />
                          Private Verification
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Zero-knowledge proofs verify without revealing personal data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Selective disclosure lets you share only what's needed</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Cryptographic security ensures data integrity</span>
                          </li>
                        </ul>
                        <Button className="mt-6">See Verification Demo</Button>
                      </div>
                      <div className="bg-background p-4 rounded-lg border">
                        <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden relative">
                          <div className="absolute inset-0 flex flex-col">
                            <div className="bg-primary/10 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Eye className="h-5 w-5 text-primary" />
                                <span className="font-medium">Verification Request</span>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col">
                              <div className="text-center mb-6">
                                <div className="h-16 w-16 rounded-full bg-primary/20 mx-auto mb-2 flex items-center justify-center">
                                  <span className="text-xl font-bold">HC</span>
                                </div>
                                <div className="font-medium">Healthcare Provider</div>
                                <div className="text-xs text-muted-foreground">Requesting verification</div>
                              </div>
                              <div className="bg-muted/50 p-4 rounded-md mb-4">
                                <h4 className="font-medium mb-2">Information Requested:</h4>
                                <ul className="space-y-2 text-sm">
                                  <li className="flex items-center justify-between">
                                    <span>Full Name</span>
                                    <span className="text-green-500">✓ Will share</span>
                                  </li>
                                  <li className="flex items-center justify-between">
                                    <span>Date of Birth</span>
                                    <span className="text-green-500">✓ Will share</span>
                                  </li>
                                  <li className="flex items-center justify-between">
                                    <span>Full Medical History</span>
                                    <span className="text-red-500">✗ Will not share</span>
                                  </li>
                                  <li className="flex items-center justify-between">
                                    <span>Vaccination Status</span>
                                    <span className="text-green-500">✓ Will share</span>
                                  </li>
                                </ul>
                              </div>
                              <div className="mt-auto flex gap-3">
                                <Button className="flex-1" variant="outline">
                                  Reject
                                </Button>
                                <Button className="flex-1">Approve</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="microloan" className="mt-0">
                <Card className="border-none bg-gradient-to-br from-background to-muted/50">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                          <Coins className="h-6 w-6 text-primary" />
                          DeFi Microloans
                        </h3>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Build credit history through on-chain activity</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Access stablecoin loans without traditional banking</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span>Transparent terms with no hidden fees or predatory rates</span>
                          </li>
                        </ul>
                        <Button className="mt-6">Explore Loan Options</Button>
                      </div>
                      <div className="bg-background p-4 rounded-lg border">
                        <div className="aspect-[9/16] bg-muted rounded-lg overflow-hidden relative">
                          <div className="absolute inset-0 flex flex-col">
                            <div className="bg-primary/10 p-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-primary" />
                                <span className="font-medium">Microloan Application</span>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="flex-1 p-4 flex flex-col">
                              <div className="mb-6">
                                <h4 className="font-medium mb-2">Loan Details</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">500 USDC</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Term:</span>
                                    <span className="font-medium">6 months</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Interest:</span>
                                    <span className="font-medium">3.5%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Monthly Payment:</span>
                                    <span className="font-medium">85.75 USDC</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-muted/50 p-3 rounded-md mb-4">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm font-medium">Credit Score</span>
                                  <span className="text-sm font-medium text-green-500">Good</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div className="bg-green-500 h-2.5 rounded-full w-3/4"></div>
                                </div>
                              </div>
                              <div className="mt-auto">
                                <Button className="w-full">Apply Now</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  )
}
