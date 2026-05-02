import { NextResponse } from 'next/server'
import type { DealWorkflow, WorkflowStep } from '@/lib/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { propertyAddress, askingPrice, investmentStrategy, recommendation, opportunities } = body

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      try {
        // Step 1: Analyzing investment profile
        send('step', { 
          step: 'analyzing', 
          message: 'Analyzing investment profile and strategy...' 
        })
        await delay(700)

        // Step 2: Building workflow
        send('step', { 
          step: 'building', 
          message: 'Building personalized deal workflow...' 
        })
        await delay(900)

        // Step 3: Prioritizing steps
        send('step', { 
          step: 'prioritizing', 
          message: 'Prioritizing action items based on urgency...' 
        })
        await delay(600)

        const steps = generateWorkflowSteps(investmentStrategy, recommendation, opportunities, askingPrice)
        
        // Send steps progressively
        for (let i = 0; i < steps.length; i++) {
          send('step_added', { 
            index: i + 1,
            total: steps.length,
            step: steps[i]
          })
          await delay(300)
        }

        // Step 4: Finalizing
        send('step', { 
          step: 'finalizing', 
          message: 'Finalizing workflow with timelines...' 
        })
        await delay(500)

        const workflow: DealWorkflow = {
          id: `workflow-${Date.now()}`,
          propertyAddress,
          currentPhase: 'research',
          steps,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        send('complete', workflow)
        controller.close()
      } catch (error) {
        send('error', { message: 'Failed to generate workflow' })
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

// Update workflow step status
export async function PATCH(request: Request) {
  const body = await request.json()
  const { stepId, status, notes } = body

  // In production, this would update a database
  return NextResponse.json({
    success: true,
    stepId,
    status,
    notes,
    updatedAt: new Date(),
  })
}

function generateWorkflowSteps(
  strategy: string,
  recommendation: string,
  opportunities: { title: string; type: string }[],
  askingPrice: number
): WorkflowStep[] {
  const steps: WorkflowStep[] = []
  const today = new Date()

  // Research Phase
  steps.push({
    id: `step-${Date.now()}-1`,
    title: 'Complete Market Intelligence Review',
    description: 'Review the market intel report and understand pricing dynamics, comparable sales, and negotiation leverage.',
    category: 'research',
    status: 'pending',
    priority: 'high',
    dueDate: addDays(today, 1),
    assignedAgent: 'market_intel',
  })

  steps.push({
    id: `step-${Date.now()}-2`,
    title: 'Verify Planning Permissions',
    description: 'Check local authority planning portal for any restrictions, Article 4 directions, or conservation area status that might affect development plans.',
    category: 'research',
    status: 'pending',
    priority: 'high',
    dueDate: addDays(today, 2),
    actionUrl: 'https://www.planningportal.co.uk/',
  })

  // Viewing Phase
  steps.push({
    id: `step-${Date.now()}-3`,
    title: 'Schedule Property Viewing',
    description: 'Arrange initial viewing with estate agent. Bring camera, tape measure, and note key structural elements.',
    category: 'viewing',
    status: 'pending',
    priority: 'high',
    dueDate: addDays(today, 3),
    assignedAgent: 'viewing',
  })

  steps.push({
    id: `step-${Date.now()}-4`,
    title: 'Conduct Second Viewing with Builder',
    description: 'If initial viewing positive, arrange second viewing with trusted builder/surveyor to assess renovation scope and costs.',
    category: 'viewing',
    status: 'pending',
    priority: 'medium',
    dueDate: addDays(today, 7),
  })

  // Finance Phase
  steps.push({
    id: `step-${Date.now()}-5`,
    title: 'Confirm Financing Options',
    description: `Review mortgage options for ${formatPrice(askingPrice)} purchase. Consider bridging finance if ${strategy.toLowerCase().includes('refurb') ? 'refurbishment timeline is tight' : 'quick completion needed'}.`,
    category: 'finance',
    status: 'pending',
    priority: 'high',
    dueDate: addDays(today, 5),
  })

  steps.push({
    id: `step-${Date.now()}-6`,
    title: 'Prepare Renovation Budget',
    description: `Based on identified opportunities (${opportunities.slice(0, 2).map(o => o.title.toLowerCase()).join(', ')}), create detailed cost breakdown with 15% contingency.`,
    category: 'finance',
    status: 'pending',
    priority: 'medium',
    dueDate: addDays(today, 10),
  })

  // Negotiation Phase
  if (recommendation === 'strong_buy' || recommendation === 'buy') {
    steps.push({
      id: `step-${Date.now()}-7`,
      title: 'Prepare Initial Offer',
      description: 'Based on market intel and viewing findings, prepare written offer with justification. Consider starting 5-10% below asking.',
      category: 'negotiation',
      status: 'pending',
      priority: 'high',
      dueDate: addDays(today, 8),
    })

    steps.push({
      id: `step-${Date.now()}-8`,
      title: 'Negotiate Terms',
      description: 'If initial offer countered, reassess based on days on market data and comparable sales. Be prepared to walk away at maximum price.',
      category: 'negotiation',
      status: 'pending',
      priority: 'medium',
      dueDate: addDays(today, 12),
    })
  }

  // Legal Phase
  steps.push({
    id: `step-${Date.now()}-9`,
    title: 'Instruct Solicitor',
    description: 'Engage conveyancing solicitor. Request title review, lease analysis (if applicable), and searches. Expect 8-12 weeks for completion.',
    category: 'legal',
    status: 'pending',
    priority: 'medium',
    dueDate: addDays(today, 10),
  })

  steps.push({
    id: `step-${Date.now()}-10`,
    title: 'Commission Survey',
    description: 'Order HomeBuyer Report or Full Building Survey depending on property age and condition. Essential for identifying hidden issues.',
    category: 'legal',
    status: 'pending',
    priority: 'high',
    dueDate: addDays(today, 14),
  })

  // Add opportunity-specific steps
  for (const opp of opportunities.slice(0, 2)) {
    if (opp.type === 'loft_conversion') {
      steps.push({
        id: `step-${Date.now()}-opp-loft`,
        title: 'Research Loft Conversion Requirements',
        description: 'Check if loft conversion falls under permitted development. Contact structural engineer for beam assessment if proceeding.',
        category: 'research',
        status: 'pending',
        priority: 'low',
        dueDate: addDays(today, 20),
      })
    }
    if (opp.type === 'hmo') {
      steps.push({
        id: `step-${Date.now()}-opp-hmo`,
        title: 'Check HMO Licensing Requirements',
        description: 'Review local authority HMO licensing rules. Check if Article 4 direction applies. Budget for license fees and compliance works.',
        category: 'legal',
        status: 'pending',
        priority: 'low',
        dueDate: addDays(today, 15),
      })
    }
  }

  return steps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}

function addDays(date: Date, days: number): string {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result.toISOString().split('T')[0]
}

function formatPrice(price: number): string {
  return `£${price.toLocaleString()}`
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
