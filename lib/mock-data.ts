import type { Property, HiddenOpportunity, InvestmentVerdict, FinancialOverview, AIActivityStep } from './types'

export const mockProperty: Property = {
  id: 'prop-001',
  address: '47 Ashworth Road, Maida Vale',
  postcode: 'W9 1JY',
  askingPrice: 875000,
  bedrooms: 3,
  bathrooms: 1,
  propertyType: 'Victorian Terrace',
  squareFeet: 1450,
  imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  estimatedRent: 2800,
  currentRent: 2200,
  yearBuilt: 1892,
  councilTaxBand: 'E',
  epcRating: 'D',
  tenure: 'Freehold',
}

export const mockOpportunities: HiddenOpportunity[] = [
  {
    id: 'opp-001',
    title: 'Loft Conversion Potential',
    type: 'loft_conversion',
    confidence: 94,
    estimatedUplift: 145000,
    explanation: 'Victorian terrace with high pitch roof. Permitted development rights apply. Similar conversions in W9 added 16-18% to property values. Estimated cost £55-65k.',
    icon: 'home',
  },
  {
    id: 'opp-002',
    title: 'Under-Market Rent',
    type: 'rental_uplift',
    confidence: 89,
    estimatedUplift: 7200,
    explanation: 'Current tenant paying £2,200/month. Market analysis shows comparable 3-beds in Maida Vale achieving £2,800-3,000. Immediate rental uplift opportunity upon vacancy.',
    icon: 'trending-up',
  },
  {
    id: 'opp-003',
    title: 'HMO Suitability',
    type: 'hmo',
    confidence: 78,
    estimatedUplift: 185000,
    explanation: 'Property layout supports 4-room HMO conversion. Zone 2 location with strong professional tenant demand. Projected gross yield 8.2% vs current 3.8%.',
    icon: 'users',
  },
  {
    id: 'opp-004',
    title: 'Kitchen Modernization',
    type: 'modernization',
    confidence: 92,
    estimatedUplift: 35000,
    explanation: 'Original 1990s kitchen significantly below area standard. Modern open-plan kitchen typically adds £30-40k in this postcode. EPC rating would improve to C.',
    icon: 'sparkles',
  },
]

export const mockVerdict: InvestmentVerdict = {
  overallScore: 87,
  recommendation: 'strong_buy',
  estimatedPostRenovationValue: 1150000,
  projectedROI: 31.4,
  rationale: 'Exceptional value-add opportunity in prime W9 location. Multiple arbitrage vectors: rental uplift, loft conversion, and modernization. Strong fundamentals with freehold tenure and permitted development rights. Below-market pricing creates immediate equity position.',
  riskLevel: 'low',
}

export const mockFinancials: FinancialOverview = {
  estimatedROI: 31.4,
  projectedUplift: 275000,
  investmentStrategy: 'Value-Add Refurbishment',
  grossYield: 3.84,
  netYield: 2.9,
  cashOnCashReturn: 12.8,
}

export const mockActivitySteps: Omit<AIActivityStep, 'status' | 'timestamp' | 'duration'>[] = [
  {
    id: 'step-001',
    title: 'Extracting Property Data',
    description: 'Parsing listing details, images, and property specifications...',
  },
  {
    id: 'step-002',
    title: 'Analyzing Location Intelligence',
    description: 'Evaluating transport links, amenities, and area demographics...',
  },
  {
    id: 'step-003',
    title: 'Running Comparable Analysis',
    description: 'Identifying recent sales within 0.5 mile radius...',
  },
  {
    id: 'step-004',
    title: 'Assessing Rental Performance',
    description: 'Benchmarking against active lettings in W9...',
  },
  {
    id: 'step-005',
    title: 'Evaluating Development Potential',
    description: 'Checking permitted development rights and planning history...',
  },
  {
    id: 'step-006',
    title: 'Calculating Financial Projections',
    description: 'Modeling ROI scenarios and cash flow analysis...',
  },
  {
    id: 'step-007',
    title: 'Detecting Hidden Opportunities',
    description: 'Applying ML models to identify arbitrage vectors...',
  },
  {
    id: 'step-008',
    title: 'Generating Investment Verdict',
    description: 'Synthesizing analysis into actionable recommendation...',
  },
]

export const aiSummary = `This Victorian terrace in sought-after Maida Vale presents a compelling value-add opportunity. Listed at £875,000 with freehold tenure, the property sits approximately 12% below comparable recent sales. Key upside vectors include a high-confidence loft conversion opportunity, significantly under-market rent, and dated interiors ripe for modernization. The combination of permitted development rights, strong rental demand in Zone 2, and multiple value creation pathways makes this an exceptional investment prospect.`
