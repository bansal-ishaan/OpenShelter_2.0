"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Code, Users } from "lucide-react"

export default function JoinSection() {
  const roles = [
    {
      icon: <Building className="h-10 w-10 text-primary" />,
      title: "For NGOs",
      description: "Partner with us to issue secure credentials and improve aid distribution efficiency.",
      action: "Partner With Us",
    },
    {
      icon: <Code className="h-10 w-10 text-primary" />,
      title: "For Developers",
      description: "Contribute to our open-source protocol and help build the future of digital identity.",
      action: "Contribute",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "For Refugees (Beta)",
      description: "Join our beta program to test and help improve the platform for future users.",
      action: "Join Waitlist",
    },
  ]

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Join the Movement</h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            Be part of the solution that's bringing digital identity and financial inclusion to millions of displaced
            people worldwide.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-none bg-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="rounded-full p-3 bg-primary/10 mb-4">{role.icon}</div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <p className="text-muted-foreground mb-6">{role.description}</p>
                  <Link href="/get-started" className="mt-auto">
                    <Button>{role.action}</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
