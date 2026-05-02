'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, CheckCircle2, Mail, User, Phone, MessageSquare } from 'lucide-react'

interface WaitlistModalProps {
  isOpen: boolean
  onClose: () => void
}

interface WaitlistFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  queries: string
}

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [formData, setFormData] = useState<WaitlistFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    queries: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to join waitlist')
      }

      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    // Reset form after animation
    setTimeout(() => {
      setFormData({ firstName: '', lastName: '', email: '', phone: '', queries: '' })
      setIsSuccess(false)
      setError(null)
    }, 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-4"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              {/* Header */}
              <div className="relative border-b border-border/50 bg-gradient-to-r from-primary/10 to-indigo-500/10 px-6 py-5">
                <button
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Join the Waitlist</h2>
                    <p className="text-sm text-muted-foreground">
                      Be first to access the full DealPilot AI platform
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {isSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center py-8 text-center"
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                      <CheckCircle2 className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      You&apos;re on the list!
                    </h3>
                    <p className="mb-6 text-muted-foreground">
                      We&apos;ll notify you as soon as the full platform is ready. Thank you for your interest!
                    </p>
                    <button
                      onClick={handleClose}
                      className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Continue Exploring
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        Phone Number
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    {/* Queries/Suggestions */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        Questions or Suggestions
                        <span className="text-xs text-muted-foreground">(optional)</span>
                      </label>
                      <textarea
                        value={formData.queries}
                        onChange={(e) => setFormData({ ...formData, queries: e.target.value })}
                        rows={3}
                        className="w-full resize-none rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Any features you'd like to see? Questions about the platform?"
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Join Waitlist
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-muted-foreground">
                      By joining, you agree to receive updates about DealPilot AI. 
                      We respect your privacy and won&apos;t spam you.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
