'use client'

import { useState, useCallback, useRef } from 'react'
import type { AnalysisState, AIActivityStep, Property, HiddenOpportunity, InvestmentVerdict, FinancialOverview } from '@/lib/types'

const initialState: AnalysisState = {
  status: 'idle',
  property: null,
  opportunities: [],
  verdict: null,
  financials: null,
  activityLog: [],
  progress: 0,
}

export interface AnalysisError {
  message: string
  type: 'missing_url' | 'invalid_url' | 'unsupported_platform' | 'not_listing' | 'fetch_error' | 'unknown'
  supportedPlatforms?: string[]
  platform?: string
}

const TOTAL_STEPS = 8

export function useAnalysis() {
  const [state, setState] = useState<AnalysisState>(initialState)
  const [inputUrl, setInputUrl] = useState<string>('')
  const [error, setError] = useState<AnalysisError | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const runAnalysis = useCallback(async (url?: string) => {
    // Abort any existing analysis
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Clear any previous error
    setError(null)

    setState({
      ...initialState,
      status: 'extracting',
    })

    if (url) {
      setInputUrl(url)
    }

    const targetUrl = url || inputUrl

    try {
      // Step 1: Fetch property data from Rightmove via Bright Data
      const scrapeStep: AIActivityStep = {
        id: 'scrape',
        title: 'Connecting to Rightmove',
        description: 'Fetching live listing data via Bright Data...',
        status: 'running',
        timestamp: new Date(),
      }

      setState(prev => ({
        ...prev,
        activityLog: [scrapeStep],
        progress: (0.5 / TOTAL_STEPS) * 100,
      }))

      const scrapeResponse = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
        signal: abortControllerRef.current.signal,
      })

      const scrapeResult = await scrapeResponse.json()

      if (!scrapeResponse.ok) {
        // Handle specific error types from the scrape API
        setError({
          message: scrapeResult.error || 'Failed to fetch property data',
          type: scrapeResult.errorType || 'fetch_error',
          supportedPlatforms: scrapeResult.supportedPlatforms,
          platform: scrapeResult.platform,
        })
        setState(prev => ({
          ...prev,
          status: 'idle',
          activityLog: prev.activityLog.map(s => 
            s.status === 'running' ? { ...s, status: 'error' as const } : s
          ),
        }))
        return
      }
      
      setState(prev => ({
        ...prev,
        activityLog: prev.activityLog.map(s => 
          s.id === 'scrape' 
            ? { ...s, status: 'completed' as const, duration: 1234, description: `Extracted from ${scrapeResult.source}` }
            : s
        ),
        progress: (1 / TOTAL_STEPS) * 100,
      }))

      // Step 2: Run streaming AI analysis
      setState(prev => ({
        ...prev,
        status: 'analyzing',
      }))

      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property: scrapeResult.data }),
        signal: abortControllerRef.current.signal,
      })

      if (!analyzeResponse.ok || !analyzeResponse.body) {
        throw new Error('Analysis stream failed')
      }

      // Process the SSE stream
      const reader = analyzeResponse.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let completedSteps = 1 // Scrape already completed

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventType = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7)
          } else if (line.startsWith('data: ') && eventType) {
            const data = JSON.parse(line.slice(6))
            
            switch (eventType) {
              case 'step':
                handleStepUpdate(data, completedSteps)
                if (data.status === 'completed') {
                  completedSteps++
                }
                break
              case 'property':
                handlePropertyUpdate(data)
                break
              case 'financials':
                handleFinancialsUpdate(data)
                break
              case 'opportunity':
                handleOpportunityUpdate(data)
                break
              case 'verdict':
                handleVerdictUpdate(data)
                break
              case 'complete':
                setState(prev => ({ ...prev, status: 'complete' }))
                break
            }
            eventType = ''
          }
        }
      }

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return // Analysis was cancelled
      }
      console.error('Analysis error:', error)
      setState(prev => ({
        ...prev,
        status: 'idle',
        activityLog: prev.activityLog.map(s => 
          s.status === 'running' ? { ...s, status: 'error' as const } : s
        ),
      }))
    }
  }, [inputUrl])

  const handleStepUpdate = (data: { id: string; status: string; title?: string; description?: string; duration?: number }, completedSteps: number) => {
    setState(prev => {
      const existingStep = prev.activityLog.find(s => s.id === data.id)
      
      if (existingStep) {
        return {
          ...prev,
          activityLog: prev.activityLog.map(s =>
            s.id === data.id
              ? { ...s, status: data.status as AIActivityStep['status'], duration: data.duration }
              : s
          ),
          progress: data.status === 'completed' 
            ? ((completedSteps + 1) / TOTAL_STEPS) * 100 
            : prev.progress,
        }
      } else {
        const newStep: AIActivityStep = {
          id: data.id,
          title: data.title || '',
          description: data.description || '',
          status: data.status as AIActivityStep['status'],
          timestamp: new Date(),
          duration: data.duration,
        }
        return {
          ...prev,
          activityLog: [...prev.activityLog, newStep],
          progress: ((completedSteps + 0.5) / TOTAL_STEPS) * 100,
        }
      }
    })
  }

  const handlePropertyUpdate = (data: Property) => {
    setState(prev => ({ ...prev, property: data }))
  }

  const handleFinancialsUpdate = (data: FinancialOverview) => {
    setState(prev => ({ ...prev, financials: data }))
  }

  const handleOpportunityUpdate = (data: HiddenOpportunity) => {
    setState(prev => ({
      ...prev,
      opportunities: [...prev.opportunities, data],
    }))
  }

  const handleVerdictUpdate = (data: InvestmentVerdict) => {
    setState(prev => ({ ...prev, verdict: data }))
  }

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState(initialState)
    setInputUrl('')
    setError(null)
  }, [])

  return {
    ...state,
    inputUrl,
    error,
    isAnalyzing: state.status === 'extracting' || state.status === 'analyzing',
    runAnalysis,
    reset,
    clearError: () => setError(null),
  }
}
