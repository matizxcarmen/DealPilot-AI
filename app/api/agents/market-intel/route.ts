import { NextResponse } from 'next/server'
import type { MarketIntelReport } from '@/lib/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { propertyAddress, askingPrice, postcode, listingUrl } = body

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Step 1: Searching platforms
        send('step', { 
          step: 'searching', 
          message: 'Searching property across Rightmove, Zoopla, OnTheMarket...',
          platforms: ['Rightmove', 'Zoopla', 'OnTheMarket', 'PrimeLocation']
        })
        await delay(1200)

        // Step 2: Analyzing listing history
        send('step', { 
          step: 'history', 
          message: 'Analyzing listing history and price changes...' 
        })
        await delay(900)

        // Generate mock market data based on input
        const daysOnMarket = Math.floor(Math.random() * 120) + 14
        const priceChanges = generatePriceHistory(askingPrice, daysOnMarket)
        
        send('step', { 
          step: 'history_result', 
          message: `Property listed for ${daysOnMarket} days`,
          daysOnMarket,
          priceChanges: priceChanges.length
        })
        await delay(600)

        // Step 3: Cross-platform comparison
        send('step', { 
          step: 'comparing', 
          message: 'Comparing prices across platforms...' 
        })
        await delay(800)

        const otherListings = generateCrossListings(askingPrice, listingUrl)
        
        send('step', { 
          step: 'comparison_result', 
          message: `Found on ${otherListings.length} platforms`,
          listings: otherListings.map(l => ({ platform: l.platform, price: l.price }))
        })
        await delay(700)

        // Step 4: Market position analysis
        send('step', { 
          step: 'positioning', 
          message: 'Calculating market position vs comparables...' 
        })
        await delay(1000)

        const marketPosition = calculateMarketPosition(daysOnMarket, priceChanges)
        const negotiationLeverage = calculateNegotiationLeverage(daysOnMarket, priceChanges, marketPosition)
        const recommendedOffer = calculateRecommendedOffer(askingPrice, daysOnMarket, priceChanges, marketPosition)

        send('step', { 
          step: 'positioning_result', 
          message: `Property is ${marketPosition} for the area`,
          marketPosition,
          negotiationLeverage
        })
        await delay(500)

        // Step 5: Generate report
        send('step', { 
          step: 'generating', 
          message: 'Generating comprehensive market intelligence report...' 
        })
        await delay(600)

        const report: MarketIntelReport = {
          id: `intel-${Date.now()}`,
          propertyAddress,
          otherListings,
          marketPosition,
          daysOnMarket,
          priceChanges,
          comparablesSummary: generateComparablesSummary(postcode, askingPrice, marketPosition, daysOnMarket),
          negotiationLeverage,
          recommendedOffer,
        }

        send('complete', report)
        controller.close()
      } catch (error) {
        send('error', { message: 'Failed to gather market intelligence' })
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

function generatePriceHistory(askingPrice: number, daysOnMarket: number): { date: string; oldPrice: number; newPrice: number }[] {
  const changes: { date: string; oldPrice: number; newPrice: number }[] = []
  
  if (daysOnMarket > 60 && Math.random() > 0.4) {
    const initialPrice = Math.round(askingPrice * (1 + (Math.random() * 0.08 + 0.02)))
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(daysOnMarket * 0.6))
    changes.push({
      date: date.toISOString().split('T')[0],
      oldPrice: initialPrice,
      newPrice: askingPrice,
    })
  }
  
  if (daysOnMarket > 90 && Math.random() > 0.5) {
    const midPrice = Math.round(askingPrice * (1 + (Math.random() * 0.05 + 0.02)))
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(daysOnMarket * 0.3))
    changes.unshift({
      date: date.toISOString().split('T')[0],
      oldPrice: changes[0]?.oldPrice || Math.round(askingPrice * 1.1),
      newPrice: midPrice,
    })
  }
  
  return changes
}

function generateCrossListings(askingPrice: number, sourceUrl?: string): MarketIntelReport['otherListings'] {
  const platforms = [
    { name: 'Rightmove', baseUrl: 'rightmove.co.uk' },
    { name: 'Zoopla', baseUrl: 'zoopla.co.uk' },
    { name: 'OnTheMarket', baseUrl: 'onthemarket.com' },
    { name: 'PrimeLocation', baseUrl: 'primelocation.com' },
  ]

  const listings: MarketIntelReport['otherListings'] = []
  const numPlatforms = Math.floor(Math.random() * 2) + 2 // 2-3 platforms

  const selectedPlatforms = platforms.sort(() => Math.random() - 0.5).slice(0, numPlatforms)

  for (const platform of selectedPlatforms) {
    const priceVariation = Math.random() > 0.8 ? Math.round((Math.random() - 0.5) * 10000) : 0
    const daysVariation = Math.floor(Math.random() * 14)
    
    listings.push({
      platform: platform.name,
      url: `https://www.${platform.baseUrl}/properties/${Math.floor(Math.random() * 1000000)}`,
      price: askingPrice + priceVariation,
      daysListed: Math.floor(Math.random() * 90) + 7 + daysVariation,
    })
  }

  return listings
}

function calculateMarketPosition(daysOnMarket: number, priceChanges: unknown[]): 'underpriced' | 'fair' | 'overpriced' {
  if (daysOnMarket < 21 && priceChanges.length === 0) return 'underpriced'
  if (daysOnMarket > 60 || priceChanges.length >= 2) return 'overpriced'
  return 'fair'
}

function calculateNegotiationLeverage(
  daysOnMarket: number, 
  priceChanges: unknown[], 
  marketPosition: string
): 'strong' | 'moderate' | 'weak' {
  let score = 0
  if (daysOnMarket > 60) score += 2
  else if (daysOnMarket > 30) score += 1
  if (priceChanges.length > 0) score += 2
  if (marketPosition === 'overpriced') score += 1
  
  if (score >= 4) return 'strong'
  if (score >= 2) return 'moderate'
  return 'weak'
}

function calculateRecommendedOffer(
  askingPrice: number,
  daysOnMarket: number,
  priceChanges: { oldPrice: number; newPrice: number }[],
  marketPosition: string
): number {
  let discount = 0.03 // Base 3% below asking
  
  if (daysOnMarket > 90) discount += 0.05
  else if (daysOnMarket > 60) discount += 0.03
  else if (daysOnMarket > 30) discount += 0.02
  
  if (priceChanges.length > 0) discount += 0.02
  if (priceChanges.length > 1) discount += 0.02
  
  if (marketPosition === 'overpriced') discount += 0.02
  
  // Cap at 15% below asking
  discount = Math.min(discount, 0.15)
  
  return Math.round(askingPrice * (1 - discount) / 1000) * 1000
}

function generateComparablesSummary(
  postcode: string, 
  askingPrice: number, 
  marketPosition: string,
  daysOnMarket: number
): string {
  const avgDays = Math.floor(Math.random() * 20) + 25
  const percentile = marketPosition === 'underpriced' ? '25th' : 
                     marketPosition === 'overpriced' ? '75th' : '50th'
  
  return `Analysis of ${Math.floor(Math.random() * 15) + 8} comparable properties in ${postcode} over the past 6 months shows this listing at the ${percentile} percentile for price per sqft. Average days on market in this area is ${avgDays} days; this property has been listed for ${daysOnMarket} days. ${marketPosition === 'overpriced' ? 'Extended listing period and price reductions suggest potential for negotiation.' : marketPosition === 'underpriced' ? 'Quick turnover expected - recommend immediate action if interested.' : 'Pricing appears aligned with market expectations.'}`
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
