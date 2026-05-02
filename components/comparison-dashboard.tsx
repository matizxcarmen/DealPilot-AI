'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Trash2,
  TrendingUp,
  TrendingDown,
  Building2,
  Bed,
  PoundSterling,
  Target,
  Sparkles,
  ChevronRight,
  Scale,
  BarChart3,
  Crown,
  Minus,
} from 'lucide-react'
import type { SavedDeal } from '@/lib/types'
import Image from 'next/image'

interface ComparisonDashboardProps {
  isVisible: boolean
  onClose: () => void
  savedDeals: SavedDeal[]
  onRemoveDeal: (id: string) => void
  onToggleFavorite: (id: string) => void
}

export function ComparisonDashboard({
  isVisible,
  onClose,
  savedDeals,
  onRemoveDeal,
  onToggleFavorite,
}: ComparisonDashboardProps) {
  const [selectedDeals, setSelectedDeals] = useState<string[]>([])
  const [view, setView] = useState<'list' | 'compare'>('list')

  const toggleDealSelection = (id: string) => {
    setSelectedDeals(prev => {
      if (prev.includes(id)) {
        return prev.filter(d => d !== id)
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), id]
      }
      return [...prev, id]
    })
  }

  const dealsToCompare = savedDeals.filter(d => selectedDeals.includes(d.id))

  // Find the best deal based on score
  const bestDeal = dealsToCompare.length > 0
    ? dealsToCompare.reduce((best, deal) => 
        deal.verdict.overallScore > best.verdict.overallScore ? deal : best
      )
    : null

  const getComparisonValue = (deal: SavedDeal, metric: 'price' | 'roi' | 'score' | 'uplift') => {
    switch (metric) {
      case 'price':
        return deal.property.askingPrice || 0
      case 'roi':
        return deal.financials.estimatedROI
      case 'score':
        return deal.verdict.overallScore
      case 'uplift':
        return deal.financials.projectedUplift
    }
  }

  const getBestForMetric = (metric: 'price' | 'roi' | 'score' | 'uplift') => {
    if (dealsToCompare.length === 0) return null
    if (metric === 'price') {
      return dealsToCompare.reduce((best, deal) => 
        (deal.property.askingPrice || Infinity) < (best.property.askingPrice || Infinity) ? deal : best
      ).id
    }
    return dealsToCompare.reduce((best, deal) => 
      getComparisonValue(deal, metric) > getComparisonValue(best, metric) ? deal : best
    ).id
  }

  const formatPrice = (price: number | null) => {
    if (!price) return '?'
    if (price >= 1000000) return `£${(price / 1000000).toFixed(2)}m`
    return `£${(price / 1000).toFixed(0)}k`
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[90vh] w-[95vw] max-w-7xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Investment Portfolio
                <span className="ml-2 text-xs font-normal text-indigo-400">powered by Mubit AI</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                {savedDeals.length} deal{savedDeals.length !== 1 ? 's' : ''} saved · {selectedDeals.length} selected for comparison
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border border-border bg-secondary/30 p-0.5">
              <button
                onClick={() => setView('list')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Deals
              </button>
              <button
                onClick={() => setView('compare')}
                disabled={selectedDeals.length < 2}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  view === 'compare' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                } disabled:opacity-50`}
              >
                Compare ({selectedDeals.length})
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {savedDeals.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full flex-col items-center justify-center gap-4 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">No Saved Deals Yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Analyze a property and click &quot;Save Deal&quot; to add it here
                  </p>
                </div>
              </motion.div>
            ) : view === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {savedDeals.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative overflow-hidden rounded-xl border transition-all ${
                      selectedDeals.includes(deal.id)
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border bg-secondary/20 hover:border-primary/50'
                    }`}
                  >
                    {/* Image */}
                    <div className="relative h-32 w-full">
                      <Image
                        src={deal.property.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'}
                        alt={deal.property.address}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      
                      {/* Score Badge */}
                      <div className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                        deal.verdict.overallScore >= 80 ? 'bg-success text-success-foreground' :
                        deal.verdict.overallScore >= 60 ? 'bg-primary text-primary-foreground' :
                        'bg-warning text-warning-foreground'
                      }`}>
                        {deal.verdict.overallScore}
                      </div>

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(deal.id)
                        }}
                        className="absolute left-2 top-2 rounded-full bg-background/50 p-1.5 backdrop-blur-sm transition-colors hover:bg-background/80"
                      >
                        <Star className={`h-4 w-4 ${deal.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </button>

                      {/* Price */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 backdrop-blur-sm">
                        <PoundSterling className="h-3 w-3 text-success" />
                        <span className="text-sm font-bold text-foreground">
                          {formatPrice(deal.property.askingPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                      <h3 className="truncate text-sm font-medium text-foreground">
                        {deal.property.address}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {deal.property.bedrooms || '?'} bed · {deal.property.propertyType}
                      </p>

                      {/* Metrics */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-secondary/50 px-2 py-1">
                          <span className="text-[10px] text-muted-foreground">ROI</span>
                          <p className="text-sm font-semibold text-success">{deal.financials.estimatedROI.toFixed(1)}%</p>
                        </div>
                        <div className="rounded-md bg-secondary/50 px-2 py-1">
                          <span className="text-[10px] text-muted-foreground">Uplift</span>
                          <p className="text-sm font-semibold text-foreground">{formatPrice(deal.financials.projectedUplift)}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => toggleDealSelection(deal.id)}
                          className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
                            selectedDeals.includes(deal.id)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {selectedDeals.includes(deal.id) ? 'Selected' : 'Compare'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveDeal(deal.id)
                          }}
                          className="rounded-lg bg-destructive/10 p-1.5 text-destructive transition-colors hover:bg-destructive/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="compare"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Comparison Header */}
                <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${dealsToCompare.length}, 1fr)` }}>
                  <div />
                  {dealsToCompare.map((deal) => (
                    <div key={deal.id} className="relative overflow-hidden rounded-xl border border-border bg-secondary/20 p-3">
                      {bestDeal?.id === deal.id && (
                        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                          <Crown className="h-3 w-3" />
                          Best
                        </div>
                      )}
                      <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg">
                        <Image
                          src={deal.property.imageUrl || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80'}
                          alt={deal.property.address}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <h4 className="truncate text-sm font-medium text-foreground">{deal.property.address}</h4>
                      <p className="text-xs text-muted-foreground">{deal.property.postcode}</p>
                    </div>
                  ))}
                </div>

                {/* Comparison Rows */}
                {[
                  { label: 'Asking Price', key: 'price' as const, icon: PoundSterling },
                  { label: 'Investment Score', key: 'score' as const, icon: Target },
                  { label: 'Est. ROI', key: 'roi' as const, icon: TrendingUp },
                  { label: 'Projected Uplift', key: 'uplift' as const, icon: BarChart3 },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="grid items-center gap-4"
                    style={{ gridTemplateColumns: `200px repeat(${dealsToCompare.length}, 1fr)` }}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <row.icon className="h-4 w-4" />
                      {row.label}
                    </div>
                    {dealsToCompare.map((deal) => {
                      const value = getComparisonValue(deal, row.key)
                      const isBest = getBestForMetric(row.key) === deal.id
                      
                      return (
                        <div
                          key={deal.id}
                          className={`rounded-lg p-3 text-center ${
                            isBest ? 'bg-success/10 ring-1 ring-success/30' : 'bg-secondary/30'
                          }`}
                        >
                          <span className={`text-lg font-bold ${isBest ? 'text-success' : 'text-foreground'}`}>
                            {row.key === 'price' ? formatPrice(value) :
                             row.key === 'uplift' ? formatPrice(value) :
                             row.key === 'roi' ? `${value.toFixed(1)}%` :
                             value}
                          </span>
                          {isBest && (
                            <span className="ml-2 text-xs text-success">Best</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}

                {/* Opportunities Comparison */}
                <div
                  className="grid items-start gap-4"
                  style={{ gridTemplateColumns: `200px repeat(${dealsToCompare.length}, 1fr)` }}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4" />
                    Opportunities
                  </div>
                  {dealsToCompare.map((deal) => (
                    <div key={deal.id} className="space-y-1.5">
                      {deal.opportunities.slice(0, 3).map((opp) => (
                        <div key={opp.id} className="flex items-center gap-2 rounded-md bg-secondary/30 px-2 py-1 text-xs">
                          <ChevronRight className="h-3 w-3 text-primary" />
                          <span className="flex-1 truncate text-foreground">{opp.title}</span>
                          <span className="text-success">{formatPrice(opp.estimatedUplift)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Verdict */}
                <div
                  className="grid items-center gap-4"
                  style={{ gridTemplateColumns: `200px repeat(${dealsToCompare.length}, 1fr)` }}
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Verdict
                  </div>
                  {dealsToCompare.map((deal) => (
                    <div key={deal.id} className="text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
                        deal.verdict.recommendation === 'strong_buy' ? 'bg-success/20 text-success' :
                        deal.verdict.recommendation === 'buy' ? 'bg-primary/20 text-primary' :
                        deal.verdict.recommendation === 'neutral' ? 'bg-warning/20 text-warning' :
                        'bg-destructive/20 text-destructive'
                      }`}>
                        {deal.verdict.recommendation === 'strong_buy' && <TrendingUp className="h-4 w-4" />}
                        {deal.verdict.recommendation === 'buy' && <TrendingUp className="h-4 w-4" />}
                        {deal.verdict.recommendation === 'neutral' && <Minus className="h-4 w-4" />}
                        {deal.verdict.recommendation === 'avoid' && <TrendingDown className="h-4 w-4" />}
                        {deal.verdict.recommendation.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
