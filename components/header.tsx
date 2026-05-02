'use client'

import { motion } from 'framer-motion'
import { Sparkles, Bot, Rocket } from 'lucide-react'
import Link from 'next/link'

interface HeaderProps {
  onAgentsClick?: () => void
}

export function Header({ onAgentsClick }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-md"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">
          DealPilot<span className="text-primary">AI</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Agent Status */}
        <button
          onClick={onAgentsClick}
          className="mr-1 hidden items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 transition-all hover:border-primary/50 hover:bg-primary/20 hover:shadow-md hover:shadow-primary/10 sm:flex"
        >
          <Bot className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">4 Agents Ready</span>
        </button>

        <Link
          href="/waitlist"
          className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-primary to-indigo-500 px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <Rocket className="h-3.5 w-3.5" />
          <span>Join Waitlist</span>
        </Link>
      </div>
    </motion.header>
  )
}
