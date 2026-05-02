'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Bot, 
  Calendar, 
  Search, 
  ClipboardList, 
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  Building2,
  Brain,
  Target,
  ChevronRight,
  Briefcase,
} from 'lucide-react'
import { PropertyInput } from './property-input'
import type { AnalysisError } from '@/hooks/use-analysis'

interface LandingPageProps {
  onSubmit: (url: string) => void
  isAnalyzing: boolean
  onReset: () => void
  error?: AnalysisError | null
  onClearError?: () => void
  savedDealsCount?: number
  onOpenSavedDeals?: () => void
}

const agents = [
  {
    id: 'viewing',
    name: 'Viewing Agent',
    description: 'Automatically schedules property viewings with estate agents at your preferred times',
    icon: Calendar,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
  },
  {
    id: 'market',
    name: 'Market Intel Agent',
    description: 'Searches cross-platform listings, tracks days on market, and identifies price reductions',
    icon: Search,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
  {
    id: 'workflow',
    name: 'Workflow Agent',
    description: 'Creates personalized action plans from research through to deal completion',
    icon: ClipboardList,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20',
  },
]

const features = [
  {
    icon: Brain,
    title: 'Hidden Opportunity Detection',
    description: 'AI identifies loft conversions, extensions, rental uplift, and HMO potential',
  },
  {
    icon: Target,
    title: 'Investment Scoring',
    description: 'Get clear buy/avoid recommendations backed by data-driven analysis',
  },
  {
    icon: TrendingUp,
    title: 'ROI Projections',
    description: 'See estimated returns, post-renovation values, and yield calculations',
  },
  {
    icon: Zap,
    title: 'Real-Time Analysis',
    description: 'Watch autonomous AI workflows process deals in seconds, not hours',
  },
]

const platforms = [
  'Rightmove',
  'OnTheMarket',
  'PrimeLocation',
]

export function LandingPage({ onSubmit, isAnalyzing, onReset, error, onClearError, savedDealsCount = 0, onOpenSavedDeals }: LandingPageProps) {
  const inputSectionRef = useRef<HTMLDivElement>(null)

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the input after scrolling
    setTimeout(() => {
      const input = inputSectionRef.current?.querySelector('input')
      input?.focus()
    }, 500)
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center px-4 py-12 md:py-20">
        {/* Background Gradient */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          {/* Badge Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center justify-center gap-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
              <Bot className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Multi-Agent AI System</span>
              <ChevronRight className="h-4 w-4 text-primary/60" />
            </div>
            
            {savedDealsCount > 0 && onOpenSavedDeals && (
              <button
                onClick={onOpenSavedDeals}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 px-4 py-1.5 text-sm font-medium text-indigo-400 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:from-blue-600/20 hover:to-indigo-600/20"
              >
                <Briefcase className="h-4 w-4" />
                <span>My Portfolio</span>
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-500/30 px-1 text-xs font-bold">
                  {savedDealsCount}
                </span>
              </button>
            )}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Detect Hidden
              <span className="relative mx-3 inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  Investment Upside
                </span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-primary/20 -rotate-1" />
              </span>
              <br className="hidden sm:block" />
              in Property Deals
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Autonomous AI agents analyze listings, schedule viewings, research market intel, 
              and create actionable deal workflows — all from a single URL.
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div
            ref={inputSectionRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-10 max-w-xl"
          >
            <PropertyInput
              onSubmit={onSubmit}
              isAnalyzing={isAnalyzing}
              onReset={onReset}
              error={error}
              onClearError={onClearError}
            />

            {/* Supported Platforms */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-muted-foreground">Supports:</span>
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="rounded-md bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {platform}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Agents Section */}
      <section id="agents-section" className="border-t border-border/50 bg-card/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">AI AGENTS</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              Your Autonomous Investment Team
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Three specialized AI agents work in parallel to research, schedule, and plan — 
              so you can focus on making decisions.
            </p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-3">
            {agents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border ${agent.borderColor} ${agent.bgColor} p-6 transition-all hover:border-opacity-40`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${agent.bgColor}`}>
                  <agent.icon className={`h-6 w-6 ${agent.color}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {agent.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {agent.description}
                </p>
                <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  <span>Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">
              What DealPilot Analyzes
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Every listing is processed through our AI engine to surface opportunities 
              that human analysis might miss.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="rounded-xl border border-border/50 bg-card/50 p-5 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1.5 font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-border/50 bg-card/30 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: '< 30s', label: 'Analysis Time' },
              { value: '4', label: 'AI Agents' },
              { value: '10+', label: 'Opportunity Types' },
              { value: '95%', label: 'Accuracy Rate' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Ready to Find Your Next Deal?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Paste any UK property listing URL above and let our AI agents 
            uncover the hidden investment potential.
          </p>
          <button
            onClick={scrollToInput}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" />
            Start Analysis
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">DealPilot AI</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span>Your data is processed securely and never stored</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
