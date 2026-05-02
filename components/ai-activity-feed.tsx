'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, AlertCircle, Zap, Brain, Link2 } from 'lucide-react'
import type { AIActivityStep } from '@/lib/types'

interface AIActivityFeedProps {
  steps: AIActivityStep[]
  isAnalyzing: boolean
  sourceUrl?: string
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function StepIcon({ status }: { status: AIActivityStep['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-success"
        >
          <CheckCircle2 className="h-4 w-4" />
        </motion.div>
      )
    case 'running':
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-primary"
        >
          <Loader2 className="h-4 w-4" />
        </motion.div>
      )
    case 'error':
      return <AlertCircle className="h-4 w-4 text-destructive" />
    default:
      return <Circle className="h-4 w-4 text-muted-foreground/40" />
  }
}

export function AIActivityFeed({ steps, isAnalyzing, sourceUrl }: AIActivityFeedProps) {
  // Extract domain from URL for display
  const displayUrl = sourceUrl ? (() => {
    try {
      const url = new URL(sourceUrl)
      return url.hostname.replace('www.', '')
    } catch {
      return sourceUrl.slice(0, 30)
    }
  })() : null

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">AI Workflow</span>
        </div>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1.5"
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-success"
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs font-medium text-success">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Source URL Badge */}
      {sourceUrl && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2"
        >
          <Link2 className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{displayUrl}</span>
          </span>
        </motion.div>
      )}

      {/* Activity Stream */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative rounded-lg border p-3 transition-all ${
                  step.status === 'running'
                    ? 'border-primary/50 bg-primary/5'
                    : step.status === 'completed'
                    ? 'border-border/30 bg-transparent'
                    : 'border-border/20 bg-transparent'
                }`}
              >
                {/* Running indicator glow */}
                {step.status === 'running' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}

                <div className="relative flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <StepIcon status={step.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm font-medium ${
                          step.status === 'running'
                            ? 'text-foreground'
                            : step.status === 'completed'
                            ? 'text-foreground/80'
                            : 'text-muted-foreground/60'
                        }`}
                      >
                        {step.title}
                      </p>
                      {step.duration && (
                        <span className="shrink-0 text-xs font-mono text-muted-foreground">
                          {formatDuration(step.duration)}
                        </span>
                      )}
                    </div>
                    <p
                      className={`mt-0.5 text-xs ${
                        step.status === 'running'
                          ? 'text-muted-foreground'
                          : 'text-muted-foreground/50'
                      }`}
                    >
                      {step.description}
                      {step.status === 'running' && (
                        <span className="cursor-blink ml-1" />
                      )}
                    </p>
                    {step.status !== 'pending' && (
                      <p className="mt-1 text-[10px] font-mono text-muted-foreground/40">
                        {formatTime(step.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Stats */}
      {steps.some((s) => s.status === 'completed') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border/50 px-4 py-3"
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-primary" />
              <span>
                {steps.filter((s) => s.status === 'completed').length} / {steps.length} steps
              </span>
            </div>
            <span className="font-mono">
              {steps
                .filter((s) => s.duration)
                .reduce((acc, s) => acc + (s.duration || 0), 0) / 1000}
              s total
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
