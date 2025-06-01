"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { GlobeIcon, Users } from "lucide-react"

export default function HeroSection() {
  const globeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!globeRef.current) return

      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      const moveX = clientX / innerWidth - 0.5
      const moveY = clientY / innerHeight - 0.5

      globeRef.current.style.transform = `translate(${moveX * 20}px, ${moveY * 20}px) rotate(${moveX * 5}deg)`
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-20 md:py-32">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]"></div>
      </div>

      <div className="container relative z-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 mb-4"
              >
                Decentralized Identity Platform
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl mb-4"
              >
                Empowering the Stateless with Identity, Trust, and Financial Freedom
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-muted-foreground text-lg md:text-xl max-w-[600px]"
              >
                A decentralized platform for refugees to regain agency, dignity, and economic power through blockchain
                technology.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  <Users className="h-4 w-4" />
                  Get Involved
                </Button>
              </Link>
              <Link href="#identity-system">
                <Button size="lg" variant="outline" className="gap-2">
                  Explore Identity System
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="relative h-[300px] md:h-[400px] flex items-center justify-center"
          >
            <div ref={globeRef} className="relative w-full h-full transition-transform duration-200 ease-out">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/20 to-indigo-600/20 blur-3xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <GlobeIcon className="h-32 w-32 md:h-48 md:w-48 text-primary/70" />
              </div>
              <div className="absolute h-4 w-4 rounded-full bg-teal-400 top-1/4 left-1/4 animate-pulse"></div>
              <div className="absolute h-3 w-3 rounded-full bg-indigo-500 bottom-1/3 right-1/3 animate-pulse"></div>
              <div className="absolute h-5 w-5 rounded-full bg-primary/50 bottom-1/4 left-1/3 animate-pulse"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
