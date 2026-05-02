export interface Property {
  id: string
  address: string
  postcode: string
  askingPrice: number | null
  bedrooms: number | null
  bathrooms: number | null
  propertyType: string
  squareFeet: number | null
  imageUrl: string
  images?: string[]
  estimatedRent: number | null
  currentRent?: number
  yearBuilt: number | null
  councilTaxBand: string | null
  epcRating: string | null
  tenure: string | null
  // Track which fields are unknown/unscraped
  unknownFields?: string[]
  // Realtor contact info if available
  realtorName?: string
  realtorPhone?: string
  realtorEmail?: string
  listingUrl?: string
}

export interface RealtorInquiry {
  propertyAddress: string
  missingFields: string[]
  status: 'pending' | 'sent' | 'responded' | 'failed'
  message?: string
  response?: string
  timestamp: Date
}

// Multi-Agent System Types
export type AgentType = 'viewing' | 'market_intel' | 'workflow' | 'contact'

export type AgentStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error'

export interface AgentTask {
  id: string
  agentType: AgentType
  title: string
  description: string
  status: AgentStatus
  progress: number
  createdAt: Date
  updatedAt: Date
  result?: unknown
  error?: string
}

export interface ViewingRequest {
  id: string
  propertyAddress: string
  realtorName?: string
  realtorPhone?: string
  preferredDates: string[]
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'flexible'
  status: 'pending' | 'requested' | 'confirmed' | 'declined' | 'rescheduled'
  confirmedDate?: string
  confirmedTime?: string
  message?: string
  response?: string
}

export interface MarketIntelReport {
  id: string
  propertyAddress: string
  otherListings: {
    platform: string
    url: string
    price: number | null
    daysListed: number
    priceHistory?: { date: string; price: number }[]
  }[]
  marketPosition: 'underpriced' | 'fair' | 'overpriced'
  daysOnMarket: number
  priceChanges: { date: string; oldPrice: number; newPrice: number }[]
  comparablesSummary: string
  negotiationLeverage: 'strong' | 'moderate' | 'weak'
  recommendedOffer?: number
}

export interface WorkflowStep {
  id: string
  title: string
  description: string
  category: 'research' | 'finance' | 'legal' | 'viewing' | 'negotiation' | 'completion'
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'high' | 'medium' | 'low'
  dueDate?: string
  assignedAgent?: AgentType
  actionUrl?: string
  notes?: string
}

export interface DealWorkflow {
  id: string
  propertyAddress: string
  currentPhase: 'research' | 'due_diligence' | 'negotiation' | 'conveyancing' | 'completion'
  steps: WorkflowStep[]
  createdAt: Date
  updatedAt: Date
}

export interface AgentOrchestrator {
  agents: {
    viewing: AgentTask | null
    market_intel: AgentTask | null
    workflow: AgentTask | null
    contact: AgentTask | null
  }
  viewingRequest: ViewingRequest | null
  marketIntel: MarketIntelReport | null
  dealWorkflow: DealWorkflow | null
}

export interface HiddenOpportunity {
  id: string
  title: string
  type: 'loft_conversion' | 'extension' | 'hmo' | 'rental_uplift' | 'modernization' | 'subdivision'
  confidence: number
  estimatedUplift: number
  explanation: string
  icon: string
}

export interface InvestmentVerdict {
  overallScore: number
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'avoid'
  estimatedPostRenovationValue: number
  projectedROI: number
  rationale: string
  riskLevel: 'low' | 'medium' | 'high'
}

export interface FinancialOverview {
  estimatedROI: number
  projectedUplift: number
  investmentStrategy: string
  grossYield: number
  netYield: number
  cashOnCashReturn: number
}

export interface AIActivityStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  timestamp: Date
  duration?: number
}

export interface AnalysisState {
  status: 'idle' | 'extracting' | 'analyzing' | 'complete'
  property: Property | null
  opportunities: HiddenOpportunity[]
  verdict: InvestmentVerdict | null
  financials: FinancialOverview | null
  activityLog: AIActivityStep[]
  progress: number
}
