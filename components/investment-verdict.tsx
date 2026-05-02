'use client'

import { motion } from 'framer-motion'
import { Shield, TrendingUp, AlertTriangle, XCircle, Award, Target, Percent, FileText } from 'lucide-react'
import type { InvestmentVerdict } from '@/lib/types'

interface InvestmentVerdictProps {
  verdict: InvestmentVerdict | null
}

function getRecommendationConfig(rec: InvestmentVerdict['recommendation']) {
  switch (rec) {
    case 'strong_buy':
      return {
        label: 'STRONG BUY',
        color: 'bg-success text-success-foreground',
        icon: Award,
        borderColor: 'border-success',
        glowColor: 'shadow-success/30',
      }
    case 'buy':
      return {
        label: 'BUY',
        color: 'bg-success/80 text-success-foreground',
        icon: TrendingUp,
        borderColor: 'border-success/80',
        glowColor: 'shadow-success/20',
      }
    case 'neutral':
      return {
        label: 'NEUTRAL',
        color: 'bg-warning text-warning-foreground',
        icon: AlertTriangle,
        borderColor: 'border-warning',
        glowColor: 'shadow-warning/20',
      }
    case 'avoid':
      return {
        label: 'AVOID',
        color: 'bg-destructive text-destructive-foreground',
        icon: XCircle,
        borderColor: 'border-destructive',
        glowColor: 'shadow-destructive/20',
      }
  }
}

function getRiskConfig(risk: InvestmentVerdict['riskLevel']) {
  switch (risk) {
    case 'low':
      return { label: 'Low Risk', color: 'text-success' }
    case 'medium':
      return { label: 'Medium Risk', color: 'text-warning' }
    case 'high':
      return { label: 'High Risk', color: 'text-destructive' }
  }
}

function CircularScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-secondary"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className="text-success"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-muted-foreground">/ 100</span>
      </div>
    </div>
  )
}

export function InvestmentVerdictCard({ verdict }: InvestmentVerdictProps) {
  if (!verdict) {
    return null
  }

  const recConfig = getRecommendationConfig(verdict.recommendation)
  const riskConfig = getRiskConfig(verdict.riskLevel)
  const RecIcon = recConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-hidden rounded-xl border-2 ${recConfig.borderColor} bg-card/80 p-5 backdrop-blur-sm shadow-lg ${recConfig.glowColor}`}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-primary/5"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Investment Verdict
            </span>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${recConfig.color}`}
          >
            <RecIcon className="h-4 w-4" />
            <span className="text-sm font-bold">{recConfig.label}</span>
          </motion.div>
        </div>

        {/* Score and Metrics */}
        <div className="mb-4 flex items-center gap-6">
          <CircularScore score={verdict.overallScore} />

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Post-Reno Value</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                £{verdict.estimatedPostRenovationValue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Projected ROI</span>
              </div>
              <span className="text-sm font-semibold text-success">
                {verdict.projectedROI.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Risk Assessment</span>
              </div>
              <span className={`text-sm font-semibold ${riskConfig.color}`}>
                {riskConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Rationale */}
        <div className="rounded-lg border border-border/50 bg-secondary/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              AI Rationale
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {verdict.rationale}
          </p>
        </div>
      </div>
    </motion.div>
  )
}
