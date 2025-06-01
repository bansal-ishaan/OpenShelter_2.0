"use client"

import { useState } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { CreditCard, History, Moon, Sun, ChevronDown, Menu, X, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-indigo-600">
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold">OS</div>
            </div>
            <span className="hidden font-bold text-xl sm:inline-block">OPENShelter</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/visa"
            className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
          >
            <CreditCard className="h-4 w-4" />
            <span>Visa</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary"
              >
                <History className="h-4 w-4" />
                <span>Transaction History</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/transactions/loan-disbursement" className="cursor-pointer">
                  Loan Disbursement
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions/previous-borrows" className="cursor-pointer">
                  Previous Borrows
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/transactions/loan-repayment" className="cursor-pointer">
                  Loan Repayment
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="/get-started"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Get Started
          </Link>
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

        {/* Mobile Navigation Toggle */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle menu"
          className="md:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn("pb-4 md:hidden", isOpen ? "block" : "hidden")}>
        <div className="flex flex-col space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link
            href="/visa"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            onClick={() => setIsOpen(false)}
          >
            <CreditCard className="h-4 w-4" />
            <span>Visa</span>
          </Link>
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <History className="h-4 w-4" />
              <span>Transaction History</span>
            </div>
            <div className="mt-2 ml-6 flex flex-col space-y-2">
              <Link
                href="/transactions/loan-disbursement"
                className="text-sm transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Loan Disbursement
              </Link>
              <Link
                href="/transactions/previous-borrows"
                className="text-sm transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Previous Borrows
              </Link>
              <Link
                href="/transactions/loan-repayment"
                className="text-sm transition-colors hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Loan Repayment
              </Link>
            </div>
          </div>
          <Link
            href="/get-started"
            className="flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            onClick={() => setIsOpen(false)}
          >
            Get Started
          </Link>
          <Button
            variant="ghost"
            className="flex items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium"
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark")
              setIsOpen(false)
            }}
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  )
}
