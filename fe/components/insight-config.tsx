"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SettingsIcon, RefreshCw, User, LogOut } from "lucide-react"
import { BruceHandler, type UserInsight } from 'connector-userid-ts'

interface InsightConfigProps {
  userId: string
  selectedInsightId?: string
  onInsightSelect: (insightId: string) => void
  onLogout: () => void
}

export function InsightConfig({ userId, selectedInsightId, onInsightSelect, onLogout }: InsightConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [insights, setInsights] = useState<UserInsight[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Initialize Bruce Handler with the correct dataUrl
  const bruceHandler = new BruceHandler({
    userId: userId,
    dataUrl: 'datads.iosense.io',
    onPrem: false
  })

  const fetchInsights = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      console.log('Fetching insights for userId:', userId, 'from:', 'https://datads.iosense.io')
      
      const userInsights = await bruceHandler.fetchUserInsights({
        pagination: { page: 1, count: 100 }, // Get up to 100 insights
        sort: { createdAt: -1 } // Sort by newest first
      })
      
      console.log('Fetched insights:', userInsights)
      setInsights(userInsights)
      
      if (userInsights.length === 0) {
        setError('No insights found for this user')
      }
    } catch (err) {
      console.error('Error fetching insights:', err)
      setError(`Failed to fetch insights: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && insights.length === 0) {
      fetchInsights()
    }
  }, [isOpen])

  const handleInsightSelect = (insightId: string) => {
    onInsightSelect(insightId)
    const selectedInsight = insights.find(insight => insight.insightID === insightId)
    console.log('Selected Insight:', {
      id: insightId,
      name: selectedInsight?.insightName,
      source: selectedInsight?.source,
      insight: selectedInsight
    })
    // You can add additional logic here to handle the selected insight
    // For example, store it in a global state or local storage
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpenConfiguration = () => {
    setIsOpen(true)
  }

  if (!isOpen) {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <Button
          onClick={handleOpenConfiguration}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <SettingsIcon className="h-4 w-4" />
          Configuration
        </Button>
        <Button
          onClick={onLogout}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Insight ID</label>
            <div className="flex gap-2">
              <Select 
                value={selectedInsightId || ''} 
                onValueChange={handleInsightSelect}
                disabled={isLoading || insights.length === 0}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue 
                    placeholder={
                      isLoading ? "Loading insights..." : 
                      insights.length === 0 ? "No insights available" :
                      "Select an insight"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {insights.map((insight) => (
                    <SelectItem key={insight._id} value={insight.insightID}>
                      {insight.insightName || `Insight ${insight.insightID}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={fetchInsights}
                variant="outline"
                size="sm"
                disabled={isLoading}
                className="px-3"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {selectedInsightId && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              <div className="font-medium">Selected Insight:</div>
              <div className="mt-1">
                <div>ID: {selectedInsightId}</div>
                {(() => {
                  const selected = insights.find(i => i.insightID === selectedInsightId)
                  return selected ? (
                    <>
                      {selected.insightName && <div>Name: {selected.insightName}</div>}
                      <div>Source: {selected.source}</div>
                      {selected.organisation && <div>Organization: {selected.organisation}</div>}
                    </>
                  ) : null
                })()}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 