'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Sparkles, 
  Rocket, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  Mail,
  User,
  Phone,
  MessageSquare,
  Bot,
  TrendingUp,
  Search,
  Calendar,
  ClipboardList,
  Eye,
  Brain,
  Zap
} from 'lucide-react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
}

export default function WaitlistPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
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

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const agents = [
    { 
      icon: Calendar, 
      name: 'Viewing Agent', 
      desc: 'Automatically contacts estate agents and schedules property viewings on your behalf',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    { 
      icon: Search, 
      name: 'Market Intel Agent', 
      desc: 'Searches across Rightmove, Zoopla, and OnTheMarket to track listing history and price changes',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    { 
      icon: ClipboardList, 
      name: 'Workflow Agent', 
      desc: 'Creates personalized deal workflows with actionable next steps from research to completion',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400'
    },
    { 
      icon: MessageSquare, 
      name: 'Contact Agent', 
      desc: 'Reaches out to realtors to gather missing property information and negotiate on your behalf',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400'
    },
  ]

  const features = [
    { icon: Brain, label: 'AI-Powered Analysis', desc: 'Deep property insights' },
    { icon: TrendingUp, label: 'ROI Detection', desc: 'Hidden opportunity finder' },
    { icon: Eye, label: 'Real-Time Tracking', desc: 'Live market monitoring' },
    { icon: Zap, label: 'Instant Reports', desc: 'Investment verdicts in seconds' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0a0f1a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              DealPilot<span className="text-emerald-400">AI</span>
            </span>
          </Link>
          <Link 
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Info */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
                <Rocket className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Early Access</span>
              </div>

              <h1 className="mb-4 text-4xl font-bold leading-tight text-white lg:text-5xl">
                Join the Waitlist for{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Full Access
                </span>
              </h1>

              <p className="mb-8 text-lg text-slate-400">
                Be among the first to access the complete DealPilot AI platform with our 
                <span className="font-semibold text-white"> Multi-Agent AI System</span>. 
                Get notified when we launch with exclusive early-bird pricing.
              </p>

              {/* AI Agents Section */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-2">
                  <Bot className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">4 Autonomous AI Agents</h3>
                </div>
                <div className="space-y-3">
                  {agents.map((agent, i) => (
                    <motion.div
                      key={agent.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className={`rounded-xl border ${agent.borderColor} ${agent.bgColor} p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg bg-gradient-to-br ${agent.color} p-2`}>
                          <agent.icon className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{agent.name}</p>
                          <p className="text-sm text-slate-400">{agent.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Additional Features */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2"
                  >
                    <feature.icon className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-slate-300">{feature.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form */}
          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-md"
            >
              {isSubmitted ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
                  >
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    You&apos;re on the list!
                  </h3>
                  <p className="mb-6 text-slate-400">
                    Thanks for joining. We&apos;ll notify you as soon as the full platform is ready.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-600"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to App
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
                  <h2 className="mb-6 text-2xl font-bold text-white">
                    Reserve Your Spot
                  </h2>

                  {error && (
                    <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Name Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                          <User className="h-3.5 w-3.5 text-slate-500" />
                          Last Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          placeholder="Smith"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Mail className="h-3.5 w-3.5 text-slate-500" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="john@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        Phone Number
                        <span className="text-slate-500">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                        Questions or Suggestions
                        <span className="text-slate-500">(Optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Any features you'd like to see?"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-5 w-5" />
                          Join the Waitlist
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-center text-xs text-slate-500">
                    We respect your privacy. No spam, ever.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
