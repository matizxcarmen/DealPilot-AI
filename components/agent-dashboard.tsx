'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Calendar,
  Search,
  ListChecks,
  Phone,
  Play,
  Pause,
  CheckCircle2,
  Loader2,
  ChevronRight,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ViewingAgent } from './agents/viewing-agent'
import { MarketIntelAgent } from './agents/market-intel-agent'
import { WorkflowAgent } from './agents/workflow-agent'
import type { Property, FinancialOverview, HiddenOpportunity, InvestmentVerdict, AgentType, AgentOrchestrator } from '@/lib/types'

interface AgentDashboardProps {
  property: Property
  financials: FinancialOverview | null
  opportunities: HiddenOpportunity[]
  verdict: InvestmentVerdict | null
  isVisible: boolean
  onClose: () => void
}

const agentConfig = {
  viewing: {
    icon: Calendar,
    title: 'Viewing Agent',
    description: 'Schedule and manage property viewings',
    color: 'text-info',
    bgColor: 'bg-info/10',
    borderColor: 'border-info/30',
  },
  market_intel: {
    icon: Search,
    title: 'Market Intel Agent',
    description: 'Research listings, price history & comparables',
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    borderColor: 'border-chart-3/30',
  },
  workflow: {
    icon: ListChecks,
    title: 'Workflow Agent',
    description: 'Generate actionable next steps',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  contact: {
    icon: Phone,
    title: 'Contact Agent',
    description: 'Reach out to realtors for information',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
  },
}

type ActiveAgent = AgentType | null

export function AgentDashboard({
  property,
  financials,
  opportunities,
  verdict,
  isVisible,
  onClose,
}: AgentDashboardProps) {
  const [activeAgent, setActiveAgent] = useState<ActiveAgent>(null)
  const [orchestrator, setOrchestrator] = useState<AgentOrchestrator>({
    agents: {
      viewing: null,
      market_intel: null,
      workflow: null,
      contact: null,
    },
    viewingRequest: null,
    marketIntel: null,
    dealWorkflow: null,
  })

  const handleAgentComplete = useCallback((agentType: AgentType, result: unknown) => {
    setOrchestrator(prev => ({
      ...prev,
      agents: {
        ...prev.agents,
        [agentType]: {
          id: `task-${agentType}-${Date.now()}`,
          agentType,
          title: agentConfig[agentType].title,
          description: agentConfig[agentType].description,
          status: 'completed',
          progress: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
          result,
        },
      },
      ...(agentType === 'viewing' && { viewingRequest: result }),
      ...(agentType === 'market_intel' && { marketIntel: result }),
      ...(agentType === 'workflow' && { dealWorkflow: result }),
    }))
  }, [])

  const completedAgents = Object.values(orchestrator.agents).filter(a => a?.status === 'completed').length

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative mx-4 flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Agent Dashboard</h2>
                  <p className="text-sm text-muted-foreground">
                    {property.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-foreground">
                    {completedAgents}/4 Agents Complete
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {/* Agent Selection Panel */}
              <div className="w-72 shrink-0 border-r border-border bg-secondary/20 p-4">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Available Agents</h3>
                <div className="space-y-2">
                  {(Object.keys(agentConfig) as AgentType[]).map((type) => {
                    const config = agentConfig[type]
                    const task = orchestrator.agents[type]
                    const isActive = activeAgent === type
                    const isComplete = task?.status === 'completed'

                    return (
                      <motion.button
                        key={type}
                        onClick={() => setActiveAgent(type)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                          isActive
                            ? `${config.borderColor} ${config.bgColor}`
                            : 'border-transparent hover:bg-secondary/50'
                        }`}
                      >
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgColor}`}>
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4 text-success" />
                          ) : (
                            <config.icon className={`h-4 w-4 ${config.color}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {config.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {isComplete ? 'Completed' : config.description}
                          </p>
                        </div>
                        <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
                      </motion.button>
                    )
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-6 space-y-3 border-t border-border pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Deal Summary</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Asking Price</span>
                      <span className="font-medium text-foreground">
                        {property.askingPrice ? `£${property.askingPrice.toLocaleString()}` : 'Unknown'}
                      </span>
                    </div>
                    {verdict && (
                      <>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">AI Score</span>
                          <span className="font-medium text-primary">{verdict.overallScore}/100</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Recommendation</span>
                          <span className={`font-medium ${
                            verdict.recommendation === 'strong_buy' ? 'text-success' :
                            verdict.recommendation === 'buy' ? 'text-primary' :
                            verdict.recommendation === 'neutral' ? 'text-warning' : 'text-destructive'
                          }`}>
                            {verdict.recommendation.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Agent Detail Panel */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                  {!activeAgent && (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex h-full flex-col items-center justify-center text-center"
                    >
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                        <Bot className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-2 text-lg font-medium text-foreground">Select an Agent</h3>
                      <p className="max-w-sm text-sm text-muted-foreground">
                        Choose an AI agent from the left panel to automate tasks like scheduling viewings, 
                        researching market data, or generating your deal workflow.
                      </p>
                    </motion.div>
                  )}

                  {activeAgent === 'viewing' && (
                    <ViewingAgent
                      key="viewing"
                      property={property}
                      existingRequest={orchestrator.viewingRequest}
                      onComplete={(result) => handleAgentComplete('viewing', result)}
                    />
                  )}

                  {activeAgent === 'market_intel' && (
                    <MarketIntelAgent
                      key="market_intel"
                      property={property}
                      existingReport={orchestrator.marketIntel}
                      onComplete={(result) => handleAgentComplete('market_intel', result)}
                    />
                  )}

                  {activeAgent === 'workflow' && (
                    <WorkflowAgent
                      key="workflow"
                      property={property}
                      financials={financials}
                      opportunities={opportunities}
                      verdict={verdict}
                      existingWorkflow={orchestrator.dealWorkflow}
                      onComplete={(result) => handleAgentComplete('workflow', result)}
                    />
                  )}

                  {activeAgent === 'contact' && (
                    <motion.div
                      key="contact"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                          <Phone className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-foreground">Contact Agent</h3>
                          <p className="text-sm text-muted-foreground">
                            Reach out to the listing agent for additional information
                          </p>
                        </div>
                      </div>

                      <div className="rounded-lg border border-border bg-secondary/30 p-4">
                        <p className="text-sm text-muted-foreground">
                          This agent has been integrated into the Property Overview panel. 
                          When information is missing from the listing, the Contact Agent will 
                          automatically appear with the option to reach out to the realtor.
                        </p>
                        {property.realtorName && (
                          <div className="mt-4 flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Detected Agent:</span>
                            <span className="font-medium text-foreground">{property.realtorName}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
