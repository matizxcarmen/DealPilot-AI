'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  Send,
  User,
  Phone,
  MapPin,
  CalendarCheck,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Property, ViewingRequest } from '@/lib/types'

interface ViewingAgentProps {
  property: Property
  existingRequest: ViewingRequest | null
  onComplete: (result: ViewingRequest) => void
}

type AgentStatus = 'idle' | 'running' | 'complete'

interface AgentStep {
  text: string
  status: 'pending' | 'running' | 'complete'
}

const timeOptions = [
  { value: 'morning', label: 'Morning', desc: '9am - 12pm' },
  { value: 'afternoon', label: 'Afternoon', desc: '12pm - 5pm' },
  { value: 'evening', label: 'Evening', desc: '5pm - 7pm' },
  { value: 'flexible', label: 'Flexible', desc: 'Any time' },
]

export function ViewingAgent({ property, existingRequest, onComplete }: ViewingAgentProps) {
  const [status, setStatus] = useState<AgentStatus>(existingRequest ? 'complete' : 'idle')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>('flexible')
  const [steps, setSteps] = useState<AgentStep[]>([])
  const [result, setResult] = useState<ViewingRequest | null>(existingRequest)

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return {
      value: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      dayName: date.toLocaleDateString('en-GB', { weekday: 'long' }),
    }
  })

  const toggleDate = (date: string) => {
    setSelectedDates(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date) 
        : prev.length < 3 
          ? [...prev, date] 
          : prev
    )
  }

  const handleRun = async () => {
    if (selectedDates.length === 0) return
    
    setStatus('running')
    setSteps([
      { text: 'Analyzing realtor availability patterns', status: 'pending' },
      { text: 'Cross-referencing with market viewing trends', status: 'pending' },
      { text: 'Preparing professional viewing request', status: 'pending' },
      { text: `Reaching out to ${property.realtorName || 'listing agent'}`, status: 'pending' },
      { text: 'Viewing request submitted', status: 'pending' },
    ])

    try {
      const response = await fetch('/api/agents/viewing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress: property.address,
          realtorName: property.realtorName,
          realtorPhone: property.realtorPhone,
          preferredDates: selectedDates,
          preferredTime: selectedTime,
          listingUrl: property.listingUrl,
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

          if (eventType === 'step') {
            const stepIndex = ['analyzing', 'calendar', 'preparing', 'contacting', 'sent'].indexOf(data.step)
            if (stepIndex >= 0) {
              setSteps(prev => prev.map((s, i) => ({
                ...s,
                status: i < stepIndex ? 'complete' : i === stepIndex ? 'running' : 'pending'
              })))
              await new Promise(r => setTimeout(r, 300))
              setSteps(prev => prev.map((s, i) => ({
                ...s,
                status: i <= stepIndex ? 'complete' : 'pending'
              })))
            }
          }

          if (eventType === 'complete') {
            setResult(data)
            onComplete(data)
            setStatus('complete')
          }
        }
      }
    } catch (error) {
      console.error('Viewing agent error:', error)
      setStatus('idle')
    }
  }

  if (status === 'complete' && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Viewing Request Sent</h3>
            <p className="text-sm text-muted-foreground">
              The agent has submitted your viewing request
            </p>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className="rounded-xl border border-success/30 bg-success/5 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-success" />
              <span className="font-medium text-foreground">Viewing Scheduled</span>
            </div>
            <span className="rounded-full bg-success/20 px-2.5 py-1 text-xs font-medium text-success">
              {result.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{result.propertyAddress}</span>
            </div>
            {result.realtorName && (
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{result.realtorName}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                Requested: {result.preferredDates.map(d => 
                  new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
                ).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground capitalize">{result.preferredTime} viewing preferred</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Expected confirmation: {(result as any).estimatedConfirmation || '24-48 hours'}
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Message Sent</p>
          <p className="whitespace-pre-line text-xs text-foreground/80">
            {result.message?.slice(0, 400)}...
          </p>
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
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
          <Calendar className="h-5 w-5 text-info" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-foreground">Schedule Viewing</h3>
          <p className="text-sm text-muted-foreground">
            Let the AI agent arrange a property viewing for you
          </p>
        </div>
      </div>

      {status === 'idle' && (
        <>
          {/* Property Info */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">{property.address}</span>
            </div>
            {property.realtorName && (
              <div className="mt-2 flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Agent: <span className="text-foreground">{property.realtorName}</span>
                </span>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Preferred Dates <span className="text-muted-foreground">(select up to 3)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.value}
                  onClick={() => toggleDate(date.value)}
                  className={`rounded-lg border p-2.5 text-center transition-all ${
                    selectedDates.includes(date.value)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-medium">{date.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Time Preference */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Time Preference
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTime(option.value as typeof selectedTime)}
                  className={`rounded-lg border p-2.5 text-center transition-all ${
                    selectedTime === option.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  <p className="text-xs font-medium">{option.label}</p>
                  <p className="text-[10px] text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Run Button */}
          <Button
            onClick={handleRun}
            disabled={selectedDates.length === 0}
            className="w-full gap-2"
            size="lg"
          >
            <Send className="h-4 w-4" />
            Request Viewing
          </Button>
        </>
      )}

      {status === 'running' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-medium">Viewing Agent Working...</span>
          </div>
          
          <div className="space-y-2 rounded-lg bg-secondary/30 p-4">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                {step.status === 'pending' && (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {step.status === 'complete' && (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
                <span className={step.status === 'complete' ? 'text-muted-foreground' : 'text-foreground'}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
