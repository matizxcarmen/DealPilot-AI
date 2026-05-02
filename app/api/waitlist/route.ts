import { NextResponse } from 'next/server'

interface WaitlistEntry {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  queries?: string
  createdAt: string
}

// In-memory storage (will reset on server restart)
// In production, connect this to a database like Supabase, Neon, or MongoDB
const waitlistEntries: WaitlistEntry[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, queries } = body

    // Validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check for duplicate email
    const existingEntry = waitlistEntries.find(
      (entry) => entry.email.toLowerCase() === email.toLowerCase()
    )
    if (existingEntry) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Create new entry
    const newEntry: WaitlistEntry = {
      id: `wl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      queries: queries?.trim() || undefined,
      createdAt: new Date().toISOString(),
    }

    // Store in memory (replace with database in production)
    waitlistEntries.push(newEntry)

    // Log for demo purposes
    console.log('[Waitlist] New signup:', {
      name: `${newEntry.firstName} ${newEntry.lastName}`,
      email: newEntry.email,
      totalSignups: waitlistEntries.length,
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      position: waitlistEntries.length,
    })
  } catch (error) {
    console.error('[Waitlist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return count only (for displaying waitlist size)
  return NextResponse.json({
    count: waitlistEntries.length,
  })
}
