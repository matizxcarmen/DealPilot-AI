'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  Loader2,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactRealtorProps {
  propertyAddress: string
  listingUrl?: string
  realtorName?: string
  realtorPhone?: string
  unknownFields: string[]
}

const fieldDisplayNames: Record<string, string> = {
  askingPrice: 'Asking Price',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  squareFeet: 'Square Footage',
  tenure: 'Tenure',
  epcRating: 'EPC Rating',
  yearBuilt: 'Year Built',
  councilTaxBand: 'Council Tax',
  propertyType: 'Property Type',
  address: 'Full Address',
}

type InquiryStatus = 'idle' | 'preparing' | 'sending' | 'sent' | 'error'

interface AgentStep {
  text: string
  status: 'pending' | 'running' | 'complete'
}

export function ContactRealtor({
  propertyAddress,
  listingUrl,
  realtorName,
  realtorPhone,
  unknownFields,
}: ContactRealtorProps) {
  const [status, setStatus] = useState<InquiryStatus>('idle')
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([])
  const [inquiryMessage, setInquiryMessage] = useState<string>('')

  // Filter to only meaningful unknown fields
  const relevantUnknownFields = unknownFields.filter(
    field => fieldDisplayNames[field]
  )

  if (relevantUnknownFields.length === 0) {
    return null
  }

  const handleContactRealtor = async () => {
    setStatus('preparing')
    
    const steps: AgentStep[] = [
      { text: 'Analyzing realtor contact information', status: 'pending' },
      { text: 'Preparing professional inquiry', status: 'pending' },
      { text: 'Identifying optimal contact method', status: 'pending' },
      { text: realtorName ? `Reaching out to ${realtorName}` : 'Submitting to listing portal', status: 'pending' },
      { text: 'Inquiry sent successfully', status: 'pending' },
    ]
    setAgentSteps(steps)

    // Animate through steps
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400))
      setAgentSteps(prev => 
        prev.map((step, idx) => ({
          ...step,
          status: idx === i ? 'running' : idx < i ? 'complete' : 'pending',
        }))
      )
      
      if (i === 1) setStatus('sending')
      
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300))
      setAgentSteps(prev =>
        prev.map((step, idx) => ({
          ...step,
          status: idx <= i ? 'complete' : 'pending',
        }))
      )
    }

    // Make actual API call
    try {
      const response = await fetch('/api/contact-realtor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyAddress,
          listingUrl,
          realtorName,
          realtorPhone,
          missingFields: relevantUnknownFields,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setStatus('sent')
        setInquiryMessage(data.inquiry.message)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-warning/30 bg-warning/5 p-4"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20">
          <AlertCircle className="h-3.5 w-3.5 text-warning" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Missing Information
        </span>
      </div>

      {/* Unknown fields list */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {relevantUnknownFields.map(field => (
          <span
            key={field}
            className="rounded-full bg-secondary/80 px-2.5 py-1 text-xs text-muted-foreground"
          >
            {fieldDisplayNames[field]}
          </span>
        ))}
      </div>

      {/* Status-based content */}
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Some property details could not be extracted from the listing. 
              Let our AI agent reach out to the realtor to gather this information.
            </p>
            
            <Button
              onClick={handleContactRealtor}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80"
              size="sm"
            >
              <Bot className="h-4 w-4" />
              <span>AI Agent: Contact Realtor</span>
              <Sparkles className="h-3.5 w-3.5" />
            </Button>

            {realtorName && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Agent detected: <span className="text-foreground">{realtorName}</span>
              </p>
            )}
          </motion.div>
        )}

        {(status === 'preparing' || status === 'sending') && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium">AI Agent Working...</span>
            </div>
            
            <div className="space-y-1.5 rounded-md bg-secondary/30 p-3">
              {agentSteps.map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-2 text-xs"
                >
                  {step.status === 'pending' && (
                    <div className="h-3 w-3 rounded-full border border-muted-foreground/30" />
                  )}
                  {step.status === 'running' && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                  {step.status === 'complete' && (
                    <CheckCircle2 className="h-3 w-3 text-success" />
                  )}
                  <span className={step.status === 'complete' ? 'text-muted-foreground' : 'text-foreground'}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {status === 'sent' && (
          <motion.div
            key="sent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">Inquiry Sent Successfully</span>
            </div>

            <div className="rounded-md bg-secondary/30 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Generated Inquiry</span>
              </div>
              <p className="max-h-24 overflow-y-auto text-xs text-foreground/80 whitespace-pre-line">
                {inquiryMessage.slice(0, 300)}...
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md bg-primary/10 px-3 py-2">
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground">Expected response:</span>
                <span className="font-medium text-foreground">24-48 hours</span>
              </div>
            </div>

            {listingUrl && (
              <a
                href={listingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                View Original Listing
              </a>
            )}
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Failed to Send Inquiry</span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Unable to contact the realtor at this time. You can try again or contact them directly.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleContactRealtor}
                variant="outline"
                size="sm"
                className="flex-1 gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Retry
              </Button>
              {realtorPhone && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <a href={`tel:${realtorPhone}`}>
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
