"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function PartnersSection() {
  const partners = [
    { name: "UNHCR", logo: "/placeholder.svg" },
    { name: "Chainlink", logo: "/placeholder.svg" },
    { name: "Polygon ID", logo: "/placeholder.svg" },
    { name: "Aave", logo: "/placeholder.svg" },
    { name: "Worldcoin", logo: "/placeholder.svg" },
    { name: "USDC", logo: "/placeholder.svg" },
  ]

  const technologies = ["Ethereum", "IPFS", "ZK-SNARKs", "USDC", "Soulbound NFTs", "Polygon ID"]

  return (
    <section className="py-20 bg-muted/30">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Partners & Technology Stack</h2>
          <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
            We're building OPENShelter with industry-leading partners and cutting-edge blockchain technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 mb-16"
        >
          {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="h-16 w-16 bg-background rounded-lg border flex items-center justify-center mb-2">
                <Image src={partner.logo || "/placeholder.svg"} alt={partner.name} width={40} height={40} />
              </div>
              <span className="text-sm font-medium">{partner.name}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {technologies.map((tech, index) => (
            <div key={index} className="px-4 py-2 bg-background rounded-full border text-sm font-medium">
              {tech}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
