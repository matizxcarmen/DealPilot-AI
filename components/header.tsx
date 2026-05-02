'use client'

import { motion } from 'framer-motion'
import { Sparkles, Bot, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onAgentsClick?: () => void
}

export function Header({ onAgentsClick }: HeaderProps) {
  const scrollToInput = () => {
    const inputSection = document.querySelector('input[type="text"], input[type="url"]')
    if (inputSection) {
      inputSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        (inputSection as HTMLInputElement).focus()
      }, 500)
    }
  }

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

        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Sign In
        </Button>
        <Button
          size="sm"
          onClick={scrollToInput}
          className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Get Started</span>
        </Button>
      </div>
    </motion.header>
  )
}
