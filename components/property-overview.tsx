'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Bed,
  Bath,
  Square,
  Calendar,
  FileText,
  Zap,
  TrendingUp,
  Target,
  Building,
  MapPin,
  PoundSterling,
  ImageOff,
} from 'lucide-react'
import type { Property, FinancialOverview } from '@/lib/types'
import Image from 'next/image'
import { ContactRealtor } from './contact-realtor'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'

interface PropertyOverviewProps {
  property: Property | null
  financials: FinancialOverview | null
  summary: string
  isLoading: boolean
}

function StatBadge({
  icon: Icon,
  value,
  label,
  unknown = false,
}: {
  icon: React.ElementType
  value: string | number | null
  label: string
  unknown?: boolean
}) {
  const isUnknown = unknown || value === null || value === undefined
  
  return (
    <div className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 ${isUnknown ? 'bg-warning/10 border border-warning/20' : 'bg-secondary/50'}`}>
      <Icon className={`h-3.5 w-3.5 ${isUnknown ? 'text-warning/60' : 'text-muted-foreground'}`} />
      <span className={`text-sm font-medium ${isUnknown ? 'text-warning/80 italic' : 'text-foreground'}`}>
        {isUnknown ? '?' : value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function FinancialMetric({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string
  value: string | number
  suffix?: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-lg font-semibold ${
            highlight ? 'text-success' : 'text-foreground'
          }`}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
      </div>
    </div>
  )
}

export function PropertyOverview({
  property,
  financials,
  summary,
  isLoading,
}: PropertyOverviewProps) {
  const [imageError, setImageError] = useState(false)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  // Reset image state when property changes
  if (property && imageSrc !== property.imageUrl && !imageError) {
    setImageSrc(property.imageUrl)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const displayImage = imageError ? FALLBACK_IMAGE : (property?.imageUrl || FALLBACK_IMAGE)

  if (!property) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">
            Submit a property to begin analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Property Overview
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Property Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg border border-border/50"
        >
          <Image
            src={displayImage}
            alt={property.address}
            fill
            className="object-cover"
            priority
            onError={handleImageError}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          
          {/* Price Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 backdrop-blur-sm">
            <PoundSterling className="h-4 w-4 text-success" />
            <span className="text-lg font-bold text-foreground">
              {property.askingPrice ? property.askingPrice.toLocaleString() : 'Price Unknown'}
            </span>
          </div>

          {/* Type Badge */}
          <div className="absolute right-3 top-3 rounded-full bg-primary/90 px-3 py-1 text-xs font-medium text-primary-foreground">
            {property.propertyType}
          </div>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <h2 className="text-lg font-semibold text-foreground text-balance">
            {property.address}
          </h2>
          <div className="mt-1 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-sm">{property.postcode}</span>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 flex flex-wrap gap-2"
        >
          <StatBadge icon={Bed} value={property.bedrooms} label="beds" />
          <StatBadge icon={Bath} value={property.bathrooms} label="bath" />
          <StatBadge icon={Square} value={property.squareFeet} label="sq ft" />
          <StatBadge icon={Calendar} value={property.yearBuilt} label="" />
          <StatBadge icon={FileText} value={property.epcRating} label="EPC" />
          <StatBadge icon={Zap} value={property.tenure} label="" />
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              AI Summary
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {isLoading ? (
              <span className="cursor-blink">Analyzing property...</span>
            ) : (
              summary
            )}
          </p>
        </motion.div>

        {/* Financial Overview */}
        {financials && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-lg border border-border/50 bg-secondary/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Financial Overview
              </span>
              <span className="rounded-full bg-success/20 px-2 py-0.5 text-xs font-medium text-success">
                {financials.investmentStrategy}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FinancialMetric
                label="Est. ROI"
                value={financials.estimatedROI.toFixed(1)}
                suffix="%"
                highlight
              />
              <FinancialMetric
                label="Projected Uplift"
                value={`£${(financials.projectedUplift / 1000).toFixed(0)}k`}
              />
              <FinancialMetric
                label="Gross Yield"
                value={financials.grossYield.toFixed(2)}
                suffix="%"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-border/30 pt-3">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-xs text-muted-foreground">
                Est. Rent:{' '}
                <span className="font-medium text-foreground">
                  {property.estimatedRent ? `£${property.estimatedRent.toLocaleString()}/mo` : 'Unknown'}
                </span>
              </span>
              {property.currentRent && property.estimatedRent && property.currentRent < property.estimatedRent && (
                <span className="ml-auto rounded-full bg-warning/20 px-2 py-0.5 text-xs text-warning">
                  +£{(property.estimatedRent - property.currentRent).toLocaleString()} upside
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Contact Realtor for Missing Info */}
        {property.unknownFields && property.unknownFields.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4"
          >
            <ContactRealtor
              propertyAddress={property.address}
              listingUrl={property.listingUrl}
              realtorName={property.realtorName}
              realtorPhone={property.realtorPhone}
              unknownFields={property.unknownFields}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
