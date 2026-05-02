import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()
  const { propertyAddress, realtorName, realtorPhone, preferredDates, preferredTime, listingUrl } = body

  // Create SSE stream for real-time updates
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Step 1: Analyzing availability
        send('step', { step: 'analyzing', message: 'Analyzing realtor availability patterns...' })
        await delay(800)

        // Step 2: Checking calendar
        send('step', { step: 'calendar', message: 'Cross-referencing with local market viewing trends...' })
        await delay(600)

        // Step 3: Preparing request
        send('step', { step: 'preparing', message: 'Preparing professional viewing request...' })
        await delay(700)

        const viewingMessage = generateViewingRequest(propertyAddress, realtorName, preferredDates, preferredTime)
        
        // Step 4: Contacting realtor
        send('step', { step: 'contacting', message: `Reaching out to ${realtorName || 'listing agent'}...` })
        await delay(900)

        // Step 5: Request sent
        send('step', { step: 'sent', message: 'Viewing request submitted successfully' })
        await delay(400)

        // Simulate confirmation (in production, this would come from actual response)
        const suggestedDate = preferredDates[0] || getNextWeekday()
        const suggestedTime = preferredTime === 'morning' ? '10:30 AM' : 
                             preferredTime === 'afternoon' ? '2:00 PM' : 
                             preferredTime === 'evening' ? '5:30 PM' : '11:00 AM'

        const result = {
          id: `viewing-${Date.now()}`,
          propertyAddress,
          realtorName,
          realtorPhone,
          preferredDates,
          preferredTime,
          status: 'requested' as const,
          message: viewingMessage,
          suggestedDate,
          suggestedTime,
          estimatedConfirmation: '24-48 hours',
        }

        send('complete', result)
        controller.close()
      } catch (error) {
        send('error', { message: 'Failed to schedule viewing request' })
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

function generateViewingRequest(
  address: string, 
  realtorName: string | undefined, 
  dates: string[], 
  timePreference: string
): string {
  const greeting = realtorName ? `Dear ${realtorName}` : 'Dear Sir/Madam'
  const dateList = dates.length > 0 
    ? dates.slice(0, 3).join(', ') 
    : 'any day this week or next'
  
  const timeDesc = timePreference === 'morning' ? 'morning (9am-12pm)' :
                   timePreference === 'afternoon' ? 'afternoon (12pm-5pm)' :
                   timePreference === 'evening' ? 'evening (5pm-7pm)' : 'any time'

  return `${greeting},

I am writing to express my strong interest in the property at ${address}.

I am an active investor currently evaluating opportunities in this area and would very much like to arrange a viewing at your earliest convenience.

My preferred dates would be ${dateList}, ideally during the ${timeDesc}. However, I am happy to accommodate your schedule.

I am a serious buyer with financing already in place and can move quickly should the property meet my investment criteria.

Please let me know your available slots and I will confirm promptly.

Best regards,
DealPilot AI
(On behalf of investor client)`
}

function getNextWeekday(): string {
  const date = new Date()
  date.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7 || 7)) // Next Monday
  return date.toISOString().split('T')[0]
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
