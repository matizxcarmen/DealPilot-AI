'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ListChecks,
  CheckCircle2,
  Loader2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Bot,
  Calendar,
  Wallet,
  Scale,
  Eye,
  Handshake,
  Flag,
  MoreHorizontal,
  Check,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Property, FinancialOverview, HiddenOpportunity, InvestmentVerdict, DealWorkflow, WorkflowStep } from '@/lib/types'

interface WorkflowAgentProps {
  property: Property
  financials: FinancialOverview | null
  opportunities: HiddenOpportunity[]
  verdict: InvestmentVerdict | null
  existingWorkflow: DealWorkflow | null
  onComplete: (result: DealWorkflow) => void
}

type AgentStatus = 'idle' | 'running' | 'complete'

const categoryConfig: Record<WorkflowStep['category'], { icon: typeof ListChecks; color: string; bgColor: string }> = {
  research: { icon: Eye, color: 'text-info', bgColor: 'bg-info/10' },
  finance: { icon: Wallet, color: 'text-chart-3', bgColor: 'bg-chart-3/10' },
  legal: { icon: Scale, color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  viewing: { icon: Calendar, color: 'text-primary', bgColor: 'bg-primary/10' },
  negotiation: { icon: Handshake, color: 'text-warning', bgColor: 'bg-warning/10' },
  completion: { icon: Flag, color: 'text-success', bgColor: 'bg-success/10' },
}

const priorityConfig = {
  high: { color: 'text-destructive', bgColor: 'bg-destructive/10', label: 'High' },
  medium: { color: 'text-warning', bgColor: 'bg-warning/10', label: 'Medium' },
  low: { color: 'text-muted-foreground', bgColor: 'bg-secondary', label: 'Low' },
}

export function WorkflowAgent({
  property,
  financials,
  opportunities,
  verdict,
  existingWorkflow,
  onComplete,
}: WorkflowAgentProps) {
  const [status, setStatus] = useState<AgentStatus>(existingWorkflow ? 'complete' : 'idle')
  const [workflow, setWorkflow] = useState<DealWorkflow | null>(existingWorkflow)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const [stepProgress, setStepProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 })

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const updateStepStatus = async (stepId: string, newStatus: WorkflowStep['status']) => {
    if (!workflow) return

    // Update local state
    setWorkflow(prev => {
      if (!prev) return prev
      return {
        ...prev,
        steps: prev.steps.map(s => 
          s.id === stepId ? { ...s, status: newStatus } : s
        ),
        updatedAt: new Date(),
      }
    })

    // Sync to server
    await fetch('/api/agents/workflow', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepId, status: newStatus }),
    })
  }

  const handleRun = async () => {
    setStatus('running')
    setStepProgress({ current: 0, total: 0 })

    try {
      const response = await fetch('/api/agents/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress: property.address,
          askingPrice: property.askingPrice || 500000,
          investmentStrategy: financials?.investmentStrategy || 'Buy-to-Let',
          recommendation: verdict?.recommendation || 'neutral',
          opportunities: opportunities.map(o => ({ title: o.title, type: o.type })),
        }),
      })

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let buffer = ''

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

          if (eventType === 'step_added') {
            setStepProgress({ current: data.index, total: data.total })
          }

          if (eventType === 'complete') {
            setWorkflow(data)
            onComplete(data)
            setStatus('complete')
          }
        }
      }
    } catch (error) {
      console.error('Workflow agent error:', error)
      setStatus('idle')
    }
  }

  const getStepsByCategory = (steps: WorkflowStep[]) => {
    const categories: Record<string, WorkflowStep[]> = {}
    for (const step of steps) {
      if (!categories[step.category]) {
        categories[step.category] = []
      }
      categories[step.category].push(step)
    }
    return categories
  }

  if (status === 'complete' && workflow) {
    const stepsByCategory = getStepsByCategory(workflow.steps)
    const completedSteps = workflow.steps.filter(s => s.status === 'completed').length
    const totalSteps = workflow.steps.length
    const progress = Math.round((completedSteps / totalSteps) * 100)

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground">Deal Workflow Generated</h3>
              <p className="text-sm text-muted-foreground">
                {totalSteps} action items across {Object.keys(stepsByCategory).length} categories
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{completedSteps}/{totalSteps} complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Steps by Category */}
        <div className="space-y-4">
          {Object.entries(stepsByCategory).map(([category, steps]) => {
            const config = categoryConfig[category as WorkflowStep['category']]
            const completedInCategory = steps.filter(s => s.status === 'completed').length

            return (
              <div key={category} className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.bgColor}`}>
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium capitalize text-foreground">{category}</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedInCategory}/{steps.length} complete
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border">
                  {steps.map((step) => {
                    const priorityCfg = priorityConfig[step.priority]
                    const isExpanded = expandedSteps.has(step.id)

                    return (
                      <div key={step.id} className="p-3">
                        <div className="flex items-start gap-3">
                          {/* Status Toggle */}
                          <button
                            onClick={() => updateStepStatus(
                              step.id, 
                              step.status === 'completed' ? 'pending' : 'completed'
                            )}
                            className="mt-0.5 shrink-0"
                          >
                            {step.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : step.status === 'in_progress' ? (
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`text-sm font-medium ${
                                step.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'
                              }`}>
                                {step.title}
                              </p>
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${priorityCfg.bgColor} ${priorityCfg.color}`}>
                                {priorityCfg.label}
                              </span>
                            </div>

                            {/* Due Date */}
                            {step.dueDate && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Due: {new Date(step.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                              </div>
                            )}

                            {/* Expandable Description */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-2 overflow-hidden"
                                >
                                  <p className="text-xs text-muted-foreground">{step.description}</p>
                                  {step.assignedAgent && (
                                    <div className="mt-2 flex items-center gap-1 text-xs">
                                      <Bot className="h-3 w-3 text-primary" />
                                      <span className="text-primary capitalize">{step.assignedAgent.replace('_', ' ')} Agent</span>
                                    </div>
                                  )}
                                  {step.actionUrl && (
                                    <a
                                      href={step.actionUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      Open Resource
                                    </a>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Expand Toggle */}
                          <button
                            onClick={() => toggleStep(step.id)}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ListChecks className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Workflow Agent</h3>
          <p className="text-sm text-muted-foreground">
            Generate a personalized deal workflow with actionable steps
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <>
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <p className="text-sm text-muted-foreground">
              Based on the AI analysis, this agent will create a customized workflow with 
              prioritized action items covering research, finance, legal, viewing, negotiation, 
              and completion phases.
            </p>
          </div>

          {/* What it will generate */}
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(categoryConfig).slice(0, 6).map(([category, config]) => (
              <div key={category} className="rounded-lg border border-border bg-secondary/20 p-3 text-center">
                <config.icon className={`mx-auto mb-2 h-5 w-5 ${config.color}`} />
                <p className="text-xs font-medium capitalize text-foreground">{category}</p>
              </div>
            ))}
          </div>

          <Button onClick={handleRun} className="w-full gap-2" size="lg">
            <ListChecks className="h-4 w-4" />
            Generate Workflow
          </Button>
        </>
      )}

      {status === 'running' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Workflow Agent Working...</span>
          </div>
          
          <div className="rounded-lg bg-secondary/30 p-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Building workflow steps...</span>
              {stepProgress.total > 0 && (
                <span className="font-medium text-foreground">
                  {stepProgress.current}/{stepProgress.total}
                </span>
              )}
            </div>
            
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ 
                  width: stepProgress.total > 0 
                    ? `${(stepProgress.current / stepProgress.total) * 100}%` 
                    : '30%' 
                }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(categoryConfig).map(([category, config], idx) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${config.bgColor}`}
                >
                  <config.icon className={`h-3 w-3 ${config.color}`} />
                  <span className={`text-xs capitalize ${config.color}`}>{category}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
