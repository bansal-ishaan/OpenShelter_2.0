"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, Lock, AlertTriangle } from "lucide-react"

export default function ProblemSection() {
  const problems = [
    {
      icon: <UserX className="h-10 w-10 text-red-500" />,
      title: "No Legal Identity",
      description:
        "Refugees are locked out of essential systems without recognized identification, preventing access to healthcare, education, and employment.",
    },
    {
      icon: <Lock className="h-10 w-10 text-amber-500" />,
      title: "No Privacy",
      description:
        "Centralized databases put vulnerable populations at risk, with sensitive personal data susceptible to breaches and misuse.",
    },
    {
      icon: <AlertTriangle className="h-10 w-10 text-orange-500" />,
      title: "No Trust",
      description:
        "NGOs and service providers struggle with cross-border verification, leading to inefficient aid distribution and duplicated efforts.",
    },
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            The Identity Crisis Faced by 100M+ Refugees
          </h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            Without recognized identification, refugees face systemic barriers to rebuilding their lives and accessing
            essential services.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-3"
        >
          {problems.map((problem, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full border-none bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full p-2 bg-background/80 border">{problem.icon}</div>
                  <CardTitle>{problem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 flex justify-center"
        >
          <div className="relative w-full max-w-2xl h-[200px] rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-amber-500/20 to-orange-500/20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full max-w-md">
                <div className="h-2 bg-red-500/50 rounded-full mb-3 animate-pulse"></div>
                <div className="h-2 bg-amber-500/50 rounded-full mb-3 w-5/6 animate-pulse delay-100"></div>
                <div className="h-2 bg-orange-500/50 rounded-full w-4/6 animate-pulse delay-200"></div>
                <div className="mt-8 flex justify-center">
                  <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
