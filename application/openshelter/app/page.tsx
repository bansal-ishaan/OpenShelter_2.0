import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import ProblemSection from "@/components/problem-section"
import SolutionSection from "@/components/solution-section"
import HowItWorks from "@/components/how-it-works"
import DemoSection from "@/components/demo-section"
import PartnersSection from "@/components/partners-section"
import JoinSection from "@/components/join-section"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <DemoSection />
      <PartnersSection />
      <JoinSection />
      <Footer />
    </main>
  )
}
