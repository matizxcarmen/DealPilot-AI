'use client'

import { motion } from 'framer-motion'
import {
  Home,
  TrendingUp,
  Users,
  Sparkles,
  Layers,
  Building2,
  ChevronRight,
  Lightbulb,
} from 'lucide-react'
import type { HiddenOpportunity } from '@/lib/types'

interface OpportunityCardsProps {
  opportunities: HiddenOpportunity[]
}

const iconMap: Record<string, React.ElementType> = {
  home: Home,
  'trending-up': TrendingUp,
  users: Users,
  sparkles: Sparkles,
  layers: Layers,
  building: Building2,
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const getColor = () => {
    if (confidence >= 90) return 'bg-success/20 text-success border-success/30'
    if (confidence >= 75) return 'bg-info/20 text-info border-info/30'
    return 'bg-warning/20 text-warning border-warning/30'
  }

  return (
    <div className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getColor()}`}>
      {confidence}% confidence
    </div>
  )
}

function OpportunityCard({
  opportunity,
  index,
}: {
  opportunity: HiddenOpportunity
  index: number
}) {
  const Icon = iconMap[opportunity.icon] || Lightbulb

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Gradient accent */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-all group-hover:bg-primary/20" />

      <div className="relative">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {opportunity.title}
              </h3>
              <ConfidenceBadge confidence={opportunity.confidence} />
            </div>
          </div>
        </div>

        {/* Uplift Value */}
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-success">
            +£{(opportunity.estimatedUplift / 1000).toFixed(0)}k
          </span>
          <span className="text-xs text-muted-foreground">est. uplift</span>
        </div>

        {/* Explanation */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {opportunity.explanation}
        </p>

        {/* Action hint */}
        <div className="mt-3 flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <span>View details</span>
          <ChevronRight className="h-3 w-3" />
        </div>
      </div>
    </motion.div>
  )
}

export function OpportunityCards({ opportunities }: OpportunityCardsProps) {
  if (opportunities.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/50">
        <div className="text-center">
          <Lightbulb className="mx-auto h-8 w-8 text-muted-foreground/30" />
          <p className="mt-2 text-xs text-muted-foreground">
            Opportunities will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {opportunities.map((opp, idx) => (
        <OpportunityCard key={opp.id} opportunity={opp} index={idx} />
      ))}
    </div>
  )
}
