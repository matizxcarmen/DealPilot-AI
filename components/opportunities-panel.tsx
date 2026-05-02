'use client'

import { motion } from 'framer-motion'
import { Lightbulb, TrendingUp } from 'lucide-react'
import { OpportunityCards } from './opportunity-cards'
import { InvestmentVerdictCard } from './investment-verdict'
import type { HiddenOpportunity, InvestmentVerdict } from '@/lib/types'

interface OpportunitiesPanelProps {
  opportunities: HiddenOpportunity[]
  verdict: InvestmentVerdict | null
  isAnalyzing: boolean
}

export function OpportunitiesPanel({
  opportunities,
  verdict,
  isAnalyzing,
}: OpportunitiesPanelProps) {
  const totalUplift = opportunities.reduce((sum, opp) => sum + opp.estimatedUplift, 0)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Hidden Opportunities
          </span>
        </div>
        {opportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1"
          >
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs font-semibold text-success">
              +£{(totalUplift / 1000).toFixed(0)}k potential
            </span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {opportunities.length === 0 && !isAnalyzing ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-border/50 bg-secondary/30">
                <Lightbulb className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">
                AI-detected opportunities will appear here
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Submit a property to begin analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Opportunity Cards */}
            <OpportunityCards opportunities={opportunities} />

            {/* Investment Verdict */}
            {verdict && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InvestmentVerdictCard verdict={verdict} />
              </motion.div>
            )}

            {/* Loading placeholder */}
            {isAnalyzing && opportunities.length > 0 && !verdict && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="opacity-25"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </motion.div>
                  <span className="text-xs">Generating verdict...</span>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
