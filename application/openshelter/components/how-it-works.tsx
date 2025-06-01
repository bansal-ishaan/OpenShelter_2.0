"use client"

import { useRef } from "react"
import { motion, useScroll } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Building, Wallet, FileCheck, Award, Coins } from "lucide-react"

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const steps = [
    {
      icon: <Building className="h-8 w-8 text-primary" />,
      title: "NGO Issues SBT",
      description: "Trusted organizations verify identity and issue Soulbound Tokens as digital credentials.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: "Refugee Wallet Stores It",
      description: "Secure, self-sovereign wallet holds credentials that can't be lost, stolen, or destroyed.",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-primary" />,
      title: "ZKP for Verification",
      description: "Zero-knowledge proofs allow selective disclosure without revealing sensitive information.",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Earn Reputation On-Chain",
      description: "Build verifiable history through interactions and responsible usage of services.",
    },
    {
      icon: <Coins className="h-8 w-8 text-primary" />,
      title: "Access Microloans",
      description: "Reputation unlocks DeFi services, enabling financial inclusion and opportunity.",
    },
  ]

  return (
    <section ref={ref} className="py-20 bg-muted/30">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            A seamless process that puts refugees in control of their digital identity while enabling trust and
            opportunity.
          </p>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-[25px] sm:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

          {steps.map((step, index) => {
            const isEven = index % 2 === 0

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex items-center mb-12 ${isEven ? "sm:flex-row" : "sm:flex-row-reverse"}`}
              >
                {/* Circle on timeline */}
                <div className="absolute left-0 sm:left-1/2 w-12 h-12 rounded-full bg-background border-2 border-primary flex items-center justify-center -translate-x-1/2 z-10">
                  {index + 1}
                </div>

                {/* Content */}
                <Card
                  className={`ml-16 sm:ml-0 sm:w-[calc(50%-40px)] p-6 border-none bg-background/80 backdrop-blur-sm ${isEven ? "sm:mr-auto" : "sm:ml-auto"}`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="rounded-full p-2 bg-primary/10">{step.icon}</div>
                    <h3 className="font-bold text-lg">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
