'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link2, Upload, Sparkles, Loader2, X, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AnalysisError } from '@/hooks/use-analysis'

interface PropertyInputProps {
  onSubmit: (input: string) => void
  isAnalyzing: boolean
  onReset: () => void
  error?: AnalysisError | null
  onClearError?: () => void
}

export function PropertyInput({ onSubmit, isAnalyzing, onReset, error, onClearError }: PropertyInputProps) {
  const [url, setUrl] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const handleSubmit = () => {
    if (url.trim() || uploadedFile) {
      onSubmit(url.trim() || uploadedFile || '')
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file.name)
      setUrl('')
    }
  }, [])

  const clearInput = () => {
    setUrl('')
    setUploadedFile(null)
    onReset()
    onClearError?.()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI-Powered Analysis</span>
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
          Discover Hidden Investment Upside
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste a property URL or upload a brochure PDF to begin
        </p>
      </div>

      {/* Input Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-xl border-2 transition-all ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-border/50 bg-card/50'
        }`}
      >
        <AnimatePresence mode="wait">
          {isDragOver ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-32 items-center justify-center"
            >
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-2 text-sm text-primary">Drop PDF here</p>
              </div>
            </motion.div>
          ) : uploadedFile ? (
            <motion.div
              key="uploaded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{uploadedFile}</p>
                  <p className="text-xs text-muted-foreground">PDF ready for analysis</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearInput}
                disabled={isAnalyzing}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="url-input"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste Rightmove, Zoopla, or OnTheMarket URL..."
                className="flex-1 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isAnalyzing}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit()
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-4 overflow-hidden rounded-lg border border-destructive/30 bg-destructive/10 p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {error.type === 'unsupported_platform' && 'Unsupported Website'}
                  {error.type === 'not_listing' && 'Not a Property Listing'}
                  {error.type === 'invalid_url' && 'Invalid URL'}
                  {error.type === 'fetch_error' && 'Connection Error'}
                  {(error.type === 'missing_url' || error.type === 'unknown') && 'Error'}
                </p>
                <p className="mt-1 text-sm text-destructive/80">
                  {error.message}
                </p>
                {error.supportedPlatforms && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {error.supportedPlatforms.map((platform) => (
                      <span
                        key={platform}
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={onClearError}
                className="shrink-0 rounded-md p-1 text-destructive/60 transition-colors hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isAnalyzing || (!url.trim() && !uploadedFile)}
          className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Analyze Property</span>
            </>
          )}
        </Button>

        <label className="cursor-pointer">
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setUploadedFile(file.name)
                setUrl('')
              }
            }}
            disabled={isAnalyzing}
          />
          <div className="flex h-10 items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Upload PDF</span>
          </div>
        </label>
      </div>


    </motion.div>
  )
}
