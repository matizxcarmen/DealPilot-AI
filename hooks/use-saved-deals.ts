'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SavedDeal, Property, HiddenOpportunity, InvestmentVerdict, FinancialOverview } from '@/lib/types'

const STORAGE_KEY = 'dealpilot-saved-deals'

export function useSavedDeals() {
  const [savedDeals, setSavedDeals] = useState<SavedDeal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const deals = parsed.map((deal: SavedDeal) => ({
          ...deal,
          savedAt: new Date(deal.savedAt),
        }))
        setSavedDeals(deals)
      }
    } catch (error) {
      console.error('Failed to load saved deals:', error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever deals change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDeals))
      } catch (error) {
        console.error('Failed to save deals:', error)
      }
    }
  }, [savedDeals, isLoaded])

  const saveDeal = useCallback((
    property: Property,
    opportunities: HiddenOpportunity[],
    verdict: InvestmentVerdict,
    financials: FinancialOverview
  ) => {
    const newDeal: SavedDeal = {
      id: `deal-${Date.now()}`,
      savedAt: new Date(),
      property,
      opportunities,
      verdict,
      financials,
      isFavorite: false,
    }

    setSavedDeals(prev => {
      // Check if property already saved (by address)
      const exists = prev.some(d => d.property.address === property.address)
      if (exists) {
        // Update existing deal
        return prev.map(d => 
          d.property.address === property.address ? newDeal : d
        )
      }
      return [newDeal, ...prev]
    })

    return newDeal.id
  }, [])

  const removeDeal = useCallback((id: string) => {
    setSavedDeals(prev => prev.filter(d => d.id !== id))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setSavedDeals(prev => prev.map(d => 
      d.id === id ? { ...d, isFavorite: !d.isFavorite } : d
    ))
  }, [])

  const updateNotes = useCallback((id: string, notes: string) => {
    setSavedDeals(prev => prev.map(d => 
      d.id === id ? { ...d, notes } : d
    ))
  }, [])

  const addTag = useCallback((id: string, tag: string) => {
    setSavedDeals(prev => prev.map(d => 
      d.id === id ? { ...d, tags: [...(d.tags || []), tag] } : d
    ))
  }, [])

  const removeTag = useCallback((id: string, tag: string) => {
    setSavedDeals(prev => prev.map(d => 
      d.id === id ? { ...d, tags: (d.tags || []).filter(t => t !== tag) } : d
    ))
  }, [])

  const isDealSaved = useCallback((propertyAddress: string) => {
    return savedDeals.some(d => d.property.address === propertyAddress)
  }, [savedDeals])

  const clearAllDeals = useCallback(() => {
    setSavedDeals([])
  }, [])

  return {
    savedDeals,
    isLoaded,
    saveDeal,
    removeDeal,
    toggleFavorite,
    updateNotes,
    addTag,
    removeTag,
    isDealSaved,
    clearAllDeals,
  }
}
