import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

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
    const existingEntry = await sql`
      SELECT id FROM waitlist WHERE LOWER(email) = LOWER(${email})
    `
    
    if (existingEntry.length > 0) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Insert new entry
    await sql`
      INSERT INTO waitlist (first_name, last_name, email, phone, message)
      VALUES (${firstName.trim()}, ${lastName.trim()}, ${email.toLowerCase().trim()}, ${phone?.trim() || null}, ${queries?.trim() || null})
    `

    // Get total count for position
    const countResult = await sql`SELECT COUNT(*) as count FROM waitlist`
    const position = Number(countResult[0]?.count || 1)

    return NextResponse.json({
      success: true,
      message: 'Successfully joined the waitlist!',
      position,
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
  try {
    const result = await sql`SELECT COUNT(*) as count FROM waitlist`
    return NextResponse.json({
      count: Number(result[0]?.count || 0),
    })
  } catch (error) {
    console.error('[Waitlist] Error fetching count:', error)
    return NextResponse.json({ count: 0 })
  }
}
