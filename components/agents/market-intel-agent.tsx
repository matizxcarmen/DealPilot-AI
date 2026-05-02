'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  CheckCircle2,
  Loader2,
  TrendingUp,
  TrendingDown,
  Clock,
  ExternalLink,
  Target,
  AlertTriangle,
  BarChart3,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Property, MarketIntelReport } from '@/lib/types'

interface MarketIntelAgentProps {
  property: Property
  existingReport: MarketIntelReport | null
  onComplete: (result: MarketIntelReport) => void
}

type AgentStatus = 'idle' | 'running' | 'complete'

interface AgentStep {
  text: string
  status: 'pending' | 'running' | 'complete'
  detail?: string
}

export function MarketIntelAgent({ property, existingReport, onComplete }: MarketIntelAgentProps) {
  const [status, setStatus] = useState<AgentStatus>(existingReport ? 'complete' : 'idle')
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [result, setResult] = useState<MarketIntelReport | null>(existingReport)

  const handleRun = async () => {
    setStatus('running')
    setSteps([
      { text: 'Searching property across platforms', status: 'pending' },
      { text: 'Analyzing listing history', status: 'pending' },
      { text: 'Comparing prices across platforms', status: 'pending' },
      { text: 'Calculating market position', status: 'pending' },
      { text: 'Generating intelligence report', status: 'pending' },
    ])

    try {
      const response = await fetch('/api/agents/market-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress: property.address,
          askingPrice: property.askingPrice || 500000,
          postcode: property.postcode,
          listingUrl: property.listingUrl,
        }),
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let buffer = ''
      let stepIndex = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('event:')) continue
          const eventMatch = line.match(/event: (\w+)\ndata: (.+)/)
          if (!eventMatch) continue

          const [, eventType, dataStr] = eventMatch
          const data = JSON.parse(dataStr)

          if (eventType === 'step') {
            const stepMap: Record<string, number> = {
              searching: 0,
              history: 1,
              history_result: 1,
              comparing: 2,
              comparison_result: 2,
              positioning: 3,
              positioning_result: 3,
              generating: 4,
            }
            const idx = stepMap[data.step]
            if (idx !== undefined) {
              setSteps(prev => prev.map((s, i) => ({
                ...s,
                status: i < idx ? 'complete' : i === idx ? 'running' : 'pending',
                detail: i === idx ? data.message : s.detail,
              })))
            }
          }

          if (eventType === 'complete') {
            setSteps(prev => prev.map(s => ({ ...s, status: 'complete' })))
            setResult(data)
            onComplete(data)
            setStatus('complete')
          }
        }
      }
    } catch (error) {
      console.error('Market intel agent error:', error)
      setStatus('idle')
    }
  }

  if (status === 'complete' && result) {
    const leverageColors = {
      strong: 'text-success bg-success/10 border-success/30',
      moderate: 'text-warning bg-warning/10 border-warning/30',
      weak: 'text-destructive bg-destructive/10 border-destructive/30',
    }

    const positionColors = {
      underpriced: 'text-success',
      fair: 'text-foreground',
      overpriced: 'text-warning',
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Market Intelligence Report</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive analysis complete
            </p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
            <Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{result.daysOnMarket}</p>
            <p className="text-xs text-muted-foreground">Days on Market</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
            <Building2 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">{result.otherListings.length}</p>
            <p className="text-xs text-muted-foreground">Platforms Found</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/30 p-4 text-center">
            {result.priceChanges.length > 0 ? (
              <TrendingDown className="mx-auto mb-2 h-5 w-5 text-success" />
            ) : (
              <TrendingUp className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
            )}
            <p className="text-2xl font-bold text-foreground">{result.priceChanges.length}</p>
            <p className="text-xs text-muted-foreground">Price Reductions</p>
          </div>
        </div>

        {/* Market Position */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Market Position Analysis
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xl font-bold capitalize ${positionColors[result.marketPosition]}`}>
                {result.marketPosition}
              </p>
              <p className="text-xs text-muted-foreground">vs. comparable properties</p>
            </div>
            <div className={`rounded-lg border px-4 py-2 ${leverageColors[result.negotiationLeverage]}`}>
              <p className="text-xs text-muted-foreground">Negotiation Leverage</p>
              <p className="text-sm font-bold capitalize">{result.negotiationLeverage}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{result.comparablesSummary}</p>
        </div>

        {/* Price History */}
        {result.priceChanges.length > 0 && (
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <TrendingDown className="h-4 w-4 text-success" />
              Price History
            </h4>
            <div className="space-y-2">
              {result.priceChanges.map((change, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(change.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground line-through">
                      £{change.oldPrice.toLocaleString()}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-success">
                      £{change.newPrice.toLocaleString()}
                    </span>
                    <span className="text-xs text-success">
                      (-{Math.round((1 - change.newPrice / change.oldPrice) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Platform Listings */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
            <Search className="h-4 w-4 text-info" />
            Cross-Platform Listings
          </h4>
          <div className="space-y-2">
            {result.otherListings.map((listing, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{listing.platform}</span>
                  <span className="text-muted-foreground">
                    {listing.daysListed} days listed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">
                    {listing.price ? `£${listing.price.toLocaleString()}` : 'POA'}
                  </span>
                  <a
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Offer */}
        {result.recommendedOffer && (
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h4 className="text-sm font-medium text-foreground">AI Recommended Offer</h4>
            </div>
            <p className="mt-2 text-3xl font-bold text-primary">
              £{result.recommendedOffer.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {property.askingPrice && (
                <>
                  {Math.round((1 - result.recommendedOffer / property.askingPrice) * 100)}% below asking price of £{property.askingPrice.toLocaleString()}
                </>
              )}
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
          <Search className="h-5 w-5 text-chart-3" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Market Intelligence Agent</h3>
          <p className="text-sm text-muted-foreground">
            Research listings, price history and comparables
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <>
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">
              This agent will search for this property across multiple platforms including Rightmove, 
              Zoopla, OnTheMarket, and PrimeLocation to gather pricing intelligence, listing history, 
              and comparable data.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <Search className="mb-2 h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Cross-Platform Search</p>
              <p className="text-xs text-muted-foreground">Find all active listings</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <Clock className="mb-2 h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Days on Market</p>
              <p className="text-xs text-muted-foreground">Track listing duration</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <TrendingDown className="mb-2 h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Price History</p>
              <p className="text-xs text-muted-foreground">Detect price reductions</p>
            </div>
            <div className="rounded-lg border border-border bg-secondary/20 p-3">
              <Target className="mb-2 h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-foreground">Offer Strategy</p>
              <p className="text-xs text-muted-foreground">AI recommended offer</p>
            </div>
          </div>

          <Button onClick={handleRun} className="w-full gap-2" size="lg">
            <Search className="h-4 w-4" />
            Run Market Intelligence
          </Button>
        </>
      )}

      {status === 'running' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Market Intel Agent Working...</span>
          </div>
          
          <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 text-sm"
              >
                {step.status === 'pending' && (
                  <div className="mt-0.5 h-4 w-4 rounded-full border border-muted-foreground/30" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" />
                )}
                {step.status === 'complete' && (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                )}
                <div>
                  <span className={step.status === 'complete' ? 'text-muted-foreground' : 'text-foreground'}>
                    {step.text}
                  </span>
                  {step.detail && (
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
