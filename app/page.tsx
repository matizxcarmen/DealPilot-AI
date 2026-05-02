'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { LandingPage } from '@/components/landing-page'
import { AIActivityFeed } from '@/components/ai-activity-feed'
import { PropertyOverview } from '@/components/property-overview'
import { OpportunitiesPanel } from '@/components/opportunities-panel'
import { useAnalysis } from '@/hooks/use-analysis'
import { AgentDashboard } from '@/components/agent-dashboard'
import { useMemo } from 'react'
import { Bot, ArrowLeft } from 'lucide-react'

export default function DealPilotPage() {
  const [hasStarted, setHasStarted] = useState(false)
  const [submittedUrl, setSubmittedUrl] = useState('')
  const [showAgentDashboard, setShowAgentDashboard] = useState(false)
  const {
    property,
    opportunities,
    verdict,
    financials,
    activityLog,
    isAnalyzing,
    status,
    error,
    runAnalysis,
    reset,
    clearError,
  } = useAnalysis()

  // Generate dynamic AI summary based on property data
  const aiSummary = useMemo(() => {
    if (!property) return ''
    const opportunityCount = opportunities.length
    const totalUplift = opportunities.reduce((sum, opp) => sum + opp.estimatedUplift, 0)
    const askingPrice = property.askingPrice || 0
    const tenure = property.tenure || 'unknown'
    const belowMarket = financials && askingPrice > 0 ? Math.round(financials.projectedUplift / askingPrice * 100) : 0
    const priceDisplay = askingPrice > 0 ? `£${askingPrice.toLocaleString()}` : 'price TBC'
    const epcRating = property.epcRating || 'C'
    
    return `This ${property.propertyType} in sought-after ${property.postcode} presents a compelling value-add opportunity. Listed at ${priceDisplay} with ${tenure.toLowerCase()} tenure, the property sits approximately ${belowMarket}% below its potential value. ${opportunityCount > 0 ? `Key upside vectors include ${opportunities.slice(0, 2).map(o => o.title.toLowerCase()).join(' and ')}.` : ''} ${financials ? `The combination of ${epcRating >= 'D' ? 'improvement potential' : 'solid fundamentals'}, strong rental demand in Zone 2, and ${opportunityCount} distinct value creation pathway${opportunityCount !== 1 ? 's' : ''} makes this ${verdict?.recommendation === 'strong_buy' ? 'an exceptional' : 'a solid'} investment prospect with potential uplift of £${(totalUplift / 1000).toFixed(0)}k.` : ''}`
  }, [property, opportunities, financials, verdict])

  const handleSubmit = (url: string) => {
    setHasStarted(true)
    setSubmittedUrl(url)
    runAnalysis(url)
  }

  const handleReset = () => {
    setHasStarted(false)
    setSubmittedUrl('')
    reset()
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background scanline">
      <Header />

      <main className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!hasStarted ? (
            <motion.div
              key="input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-1 overflow-auto"
            >
              <LandingPage
                onSubmit={handleSubmit}
                isAnalyzing={isAnalyzing}
                onReset={handleReset}
                error={error}
                onClearError={clearError}
              />
            </motion.div>
          ) : (
            <motion.div
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-1 overflow-hidden"
            >
              {/* Three-panel layout */}
              <div className="flex h-full w-full">
                {/* Left Panel - AI Activity Feed */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="hidden w-80 shrink-0 border-r border-border/50 bg-card/30 lg:block"
                >
                  <AIActivityFeed steps={activityLog} isAnalyzing={isAnalyzing} sourceUrl={submittedUrl} />
                </motion.div>

                {/* Center Panel - Property Overview */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex-1 border-r border-border/50 bg-card/20"
                >
                  <PropertyOverview
                    property={property}
                    financials={financials}
                    summary={aiSummary}
                    isLoading={status === 'extracting'}
                  />
                </motion.div>

                {/* Right Panel - Opportunities */}
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full max-w-md shrink-0 bg-card/30 lg:w-96"
                >
                  <OpportunitiesPanel
                    opportunities={opportunities}
                    verdict={verdict}
                    isAnalyzing={isAnalyzing}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar - Progress & Quick Actions */}
      {hasStarted && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between border-t border-border/50 bg-card/30 px-4 py-2 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            {/* Progress Bar */}
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-xs text-muted-foreground">Progress</span>
              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${status === 'complete' ? 100 : activityLog.filter((s) => s.status === 'completed').length / 8 * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {status === 'complete' ? '100%' : `${Math.round(activityLog.filter((s) => s.status === 'completed').length / 8 * 100)}%`}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              {status === 'complete' ? (
                <span className="flex items-center gap-1.5 text-xs text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Analysis Complete
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-primary">
                  <motion.span
                    className="h-1.5 w-1.5 rounded-full bg-primary"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  Analyzing...
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            {status === 'complete' && property && (
              <>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setShowAgentDashboard(true)}
                  className="relative flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-emerald-500 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                >
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary to-emerald-500 opacity-0"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <Bot className="h-4 w-4" />
                  <span>Launch AI Agents</span>
                  <span className="flex h-5 items-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold">
                    4
                  </span>
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Export Report
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Agent Dashboard Modal */}
      {property && (
        <AgentDashboard
          property={property}
          financials={financials}
          opportunities={opportunities}
          verdict={verdict}
          isVisible={showAgentDashboard}
          onClose={() => setShowAgentDashboard(false)}
        />
      )}
    </div>
  )
}
