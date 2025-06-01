"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Coins, Lock } from "lucide-react"

export default function SolutionSection() {
  const solutions = [
    {
      icon: <Shield className="h-10 w-10 text-teal-500" />,
      title: "Soulbound Tokens (SBTs)",
      description:
        "Non-transferable, tamper-proof credentials issued by trusted NGOs that remain permanently linked to an individual's digital identity.",
    },
    {
      icon: <Eye className="h-10 w-10 text-indigo-500" />,
      title: "Zero-Knowledge Proofs (ZKPs)",
      description:
        "Verify identity and credentials without revealing sensitive personal data, maintaining privacy while enabling trust.",
    },
    {
      icon: <Coins className="h-10 w-10 text-emerald-500" />,
      title: "DeFi Microloans",
      description:
        "Build credit history on-chain to access stablecoin loans, enabling financial inclusion and economic opportunity.",
    },
    {
      icon: <Lock className="h-10 w-10 text-violet-500" />,
      title: "Privacy & Sovereignty",
      description:
        "User-owned identity wallet puts control in the hands of refugees, not centralized databases or vulnerable systems.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section id="identity-system" className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Decentralized, Private, and Human-Centric Identity Solution
          </h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            Our blockchain-based platform creates a secure, private, and portable identity system that empowers refugees
            while protecting their data.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {solutions.map((solution, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full border-none bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full p-2 bg-background/80 border">{solution.icon}</div>
                  <CardTitle className="text-base sm:text-lg">{solution.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{solution.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
