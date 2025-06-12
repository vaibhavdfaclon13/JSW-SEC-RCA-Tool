"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Download, Filter, Search, Calendar, Clock, X, ChevronDown } from "lucide-react"
import { DiagnosticTable } from "@/components/diagnostic-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { BruceHandler } from 'connector-userid-ts'
import { exportToExcel } from "@/lib/export-utils"
import { useUserId } from "@/hooks/useUserId"
import { UserIdInput } from "@/components/user-id-input"
import { InsightConfig } from "@/components/insight-config"
import { StatusChart } from "@/components/status-chart"
import { QualityKPIChart } from "@/components/quality-kpi-chart"

interface DiagnosticDashboardProps {
  userId: string
  selectedInsightId?: string
}

function DiagnosticDashboard({ userId, selectedInsightId }: DiagnosticDashboardProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchColumns, setSearchColumns] = useState<string[]>(["fault"])
  const [showSearchFilter, setShowSearchFilter] = useState(false)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Set default to 1 month ago
  const [startDate, setStartDate] = useState<Date>(() => {
    const now = new Date()
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    return oneMonthAgo
  })
  const [startTime, setStartTime] = useState<string>("00:00")
  
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [endTime, setEndTime] = useState<string>("23:59")
  
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [realData, setRealData] = useState<any[]>([])

  // Initialize Bruce Handler
  const bruceHandler = selectedInsightId ? new BruceHandler({
    userId: userId,
    dataUrl: 'datads-ext.iosense.io',
    onPrem: false
  }) : null

  // Fetch data for selected insight and time
  const fetchInsightData = async () => {
    if (!selectedInsightId || !bruceHandler) {
      console.log('No insight selected or handler not available')
      return
    }

    setIsLoadingData(true)
    try {
      // Combine start date and time
      const startDateTime = new Date(startDate)
      const [startHours, startMinutes] = startTime.split(':')
      startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0)

      // Combine end date and time
      const endDateTime = new Date(endDate)
      const [endHours, endMinutes] = endTime.split(':')
      endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 59, 999)

      console.log('=== FETCHING INSIGHT DATA ===')
      console.log('Insight ID:', selectedInsightId)
      console.log('User ID:', userId)
      console.log('Start DateTime:', startDateTime.toISOString())
      console.log('End DateTime:', endDateTime.toISOString())
      
      const requestParams = {
        insightId: selectedInsightId,
        filter: {
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
        },
        pagination: { page: 1, count: 100 }
      }
      
      console.log('API Request Params:', JSON.stringify(requestParams, null, 2))
      
      // Fetch insight results from Bruce Handler
      const data = await bruceHandler.fetchInsightResults(requestParams)

      console.log('=== API RESPONSE ===')
      console.log('Total Results:', data.totalCount)
      console.log('Returned Results:', data.results?.length || 0)
      console.log('========================')
      setRealData(data.results || [])
      
    } catch (error) {
      console.error('Error fetching insight data:', error)
      setRealData([])
    } finally {
      setIsLoadingData(false)
    }
  }

  // Fetch data when insight or time changes
  useEffect(() => {
    if (selectedInsightId) {
      fetchInsightData()
    }
  }, [selectedInsightId, startDate, startTime, endDate, endTime])

  // Helper function to get status and color from tags
  const getStatusFromTags = (tags: string[]) => {
    if (!tags || tags.length === 0) return { status: 'Unknown', color: 'gray' }
    
    const tag = tags[0].toLowerCase()
    switch (tag) {
      case 'critical':
        return { status: 'Critical', color: 'red' }
      case 'warning':
        return { status: 'Warning', color: 'orange' }
      case 'normal':
        return { status: 'Normal', color: 'green' }
      case 'high':
        return { status: 'High', color: 'red' }
      case 'low':
        return { status: 'Low', color: 'yellow' }
      default:
        return { status: tag.charAt(0).toUpperCase() + tag.slice(1), color: 'blue' }
    }
  }

  // Helper function to extract key parameters from relevant_parameters
  const getKeyParameters = (result: any) => {
    const relevantParams = result?.result?.FaultsFound_Analysis?.relevant_parameters || []
    if (relevantParams.length === 0) return 'No parameters'
    
    return relevantParams
      .slice(0, 2) // Take first 2 parameters
      .map((param: any) => param.parameter?.split(' - ')[0] || param.parameter || 'Unknown')
      .join(', ')
  }

  // Transform insight results to table format
  const transformedData = useMemo(() => {
    return realData.map((result: any, index: number) => {
      const statusInfo = getStatusFromTags(result.tags || [])
      
      return {
        id: result.insightID || result._id || `result-${index}`,
        name: result.resultName || `Result ${index + 1}`,
        fault: result?.result?.FaultsFound_Analysis?.detected_issue || 'No fault detected',
        status: statusInfo.status,
        statusColor: statusInfo.color,
        lastUpdated: result.invocationTime ? new Date(result.invocationTime).toLocaleString() : 'Unknown',
        keyParameters: getKeyParameters(result),
        // Store the full result data for expansion
        rawData: result
      }
    })
  }, [realData])

  // Only use real transformed data, no fallback to sample data
  const currentData = transformedData

  // Calculate status counts from actual data
  const statusCounts = useMemo(() => {
    const counts: Record<string, { count: number; color: string }> = {}

    currentData.forEach((item) => {
      if (!counts[item.status]) {
        counts[item.status] = { count: 0, color: item.statusColor }
      }
      counts[item.status].count++
    })

    return Object.entries(counts).map(([label, { count, color }]) => ({
      label,
      count,
      color,
    }))
  }, [currentData])

  // Apply filters and search
  useEffect(() => {
    let result = currentData

    // Apply status filters if any are active
    if (activeFilters.length > 0) {
      result = result.filter((item) => activeFilters.includes(item.status))
    }

    // Apply search query if present
    if (searchQuery) {
      result = result.filter((item) => {
        return searchColumns.some((column) => {
          let value: string = ''
          
          // Map search columns to actual item properties
          switch (column) {
            case 'fault':
              value = item.fault || ''
              break
            case 'name':
              value = item.name || ''
              break
            case 'status':
              value = item.status || ''
              break
            case 'keyParameters':
              value = item.keyParameters || ''
              break
            default:
              value = item[column.toLowerCase() as keyof typeof item] as string || ''
          }
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        })
      })
    }

    setFilteredData(result)
    // Reset to first page when filters change
    setCurrentPage(1)
  }, [activeFilters, searchQuery, searchColumns, currentData])

  const toggleStatusFilter = (status: string) => {
    setActiveFilters((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
  }

  const handleExportToExcel = () => {
    exportToExcel(filteredData, "diagnostic_data")
  }

  // Quick preset functions
  const setTimeRange = (startDaysAgo: number, endDaysAgo: number = 0) => {
    const now = new Date()
    const start = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000)
    const end = endDaysAgo === 0 ? now : new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000)
    
    setStartDate(start)
    setStartTime("00:00")
    setEndDate(end)
    setEndTime("23:59")
  }

  const setTimeRangeHours = (hoursAgo: number) => {
    const now = new Date()
    const start = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    
    setStartDate(start)
    setStartTime(`${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`)
    setEndDate(now)
    setEndTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`)
  }

  const setTimeRangeMonths = (monthsAgo: number) => {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, now.getDate())
    
    setStartDate(start)
    setStartTime("00:00")
    setEndDate(now)
    setEndTime("23:59")
  }

  const totalItems = filteredData.length
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const paginatedData = filteredData.slice(startItem - 1, endItem)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-600">Automatic Diagnosis and Recommendation Dashboard</h1>
        </div>
      </header>

      {/* Filters */}
      <div className="p-4 bg-white border-b">
        <div className="flex flex-wrap gap-4 mb-4">
          <Select defaultValue="rawmill">
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rawmill">Raw Mill</SelectItem>
            </SelectContent>
          </Select>

          {/* Simplified Time Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-between font-normal">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">
                    {startDate.toLocaleDateString()} → {endDate.toLocaleDateString()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-4" align="start">
              <div className="space-y-4">
                <h3 className="font-medium text-gray-800">Time Range</h3>
                
                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimeRangeHours(1)}
                    className="text-xs"
                  >
                    Last Hour
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimeRange(0)}
                    className="text-xs"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimeRange(7)}
                    className="text-xs"
                  >
                    Last Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimeRangeMonths(1)}
                    className="text-xs"
                  >
                    Last Month
                  </Button>
                </div>

                {/* Custom Range */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">From</label>
                      <input
                        type="date"
                        value={startDate.toISOString().split('T')[0]}
                        onChange={(e) => setStartDate(new Date(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 block mb-1">To</label>
                      <input
                        type="date"
                        value={endDate.toISOString().split('T')[0]}
                        onChange={(e) => setEndDate(new Date(e.target.value))}
                        className="w-full px-2 py-1 border rounded text-sm"
                      />
                    </div>
                  </div>
                  
                  {selectedInsightId && (
                    <Button 
                      onClick={fetchInsightData} 
                      disabled={isLoadingData}
                      className="w-full"
                      size="sm"
                    >
                      {isLoadingData ? "Loading..." : "Apply"}
                    </Button>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Loading indicator for data fetching */}
          {isLoadingData && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Fetching insight data...
            </div>
          )}

          {/* Show current insight info and results range */}
          {selectedInsightId && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
              <span className="font-medium">Insight:</span>
              <span className="text-blue-700">{selectedInsightId}</span>
              <span>•</span>
              <span className="font-medium">Results:</span>
              <span className="text-blue-700">{transformedData.length}</span>
              <span>•</span>
              <span className="font-medium">Range:</span>
              <span className="text-blue-700">{startDate.toLocaleDateString()} {startTime} → {endDate.toLocaleDateString()} {endTime}</span>
            </div>
          )}
        </div>

        {/* Only show status badges if we have real data */}
        {currentData.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {statusCounts.map((status) => (
              <Badge
                key={status.label}
                variant="outline"
                className={`cursor-pointer ${
                  activeFilters.includes(status.label)
                    ? `bg-${status.color}-500 text-white hover:bg-${status.color}-600`
                    : `bg-${status.color}-50 text-${status.color}-700 hover:bg-${status.color}-100`
                }`}
                onClick={() => toggleStatusFilter(status.label)}
              >
                {status.label} ({status.count})
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Data View - Only show when we have data */}
      {currentData.length > 0 ? (
        <Card className="m-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Diagnostic View</CardTitle>
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 w-full">
              {/* Enhanced Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search faults, assets, or status..."
                  className="pl-10 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                
                {/* Search Filter Dropdown */}
                <Popover open={showSearchFilter} onOpenChange={setShowSearchFilter}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                    >
                      <Filter className="h-4 w-4 text-gray-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Search in:</h4>
                      <div className="space-y-2">
                        {[
                          { key: "fault", label: "Fault Description", checked: searchColumns.includes("fault") },
                          { key: "name", label: "Asset Name", checked: searchColumns.includes("name") },
                          { key: "status", label: "Status", checked: searchColumns.includes("status") },
                          { key: "keyParameters", label: "Parameters", checked: searchColumns.includes("keyParameters") }
                        ].map((column) => (
                          <div key={column.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={column.key}
                              checked={column.checked}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSearchColumns((prev) => [...prev, column.key])
                                } else {
                                  setSearchColumns((prev) => prev.filter((col) => col !== column.key))
                                }
                              }}
                            />
                            <label htmlFor={column.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {column.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {/* Active search columns indicator */}
                      {searchColumns.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-gray-500">
                            Searching in {searchColumns.length} column{searchColumns.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search results indicator */}
              {searchQuery && (
                <div className="text-sm text-gray-500">
                  {filteredData.length} of {currentData.length} results
                </div>
              )}
            </div>
          </div>

          <DiagnosticTable
            data={paginatedData}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
            startItem={startItem}
            endItem={endItem}
            userId={userId}
          />
          </CardContent>
        </Card>
      ) : (
        // Empty state when no data
        <div className="m-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No Data Available</h3>
            <p className="text-sm mb-4">
              {selectedInsightId 
                ? "Select a time range and fetch data to see results" 
                : "Configure an insight and time range to get started"
              }
            </p>
            {!selectedInsightId && (
              <Button 
                variant="outline" 
                onClick={() => {
                  // This will open the configuration modal
                  const configButton = document.querySelector('[data-radix-collection-item]') as HTMLElement;
                  configButton?.click();
                }}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Open Configuration
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto p-4 text-center text-sm text-gray-500">
        <p>© 2024, powered by Facion Labs</p>
      </footer>
    </div>
  )
}

// Main App Component with UserID Management
export default function App() {
  const { userId, selectedInsightId, setUserId, setSelectedInsightId, clearUserId, hasUserId, isLoading, error } = useUserId()

  const handleUserIdSubmit = (newUserId: string) => {
    setUserId(newUserId)
  }

  const handleLogout = () => {
    clearUserId()
  }

  // Show error if there is one
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Application</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show loading while checking for stored user data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  // Show UserID input if no userID is stored
  if (!hasUserId) {
    return <UserIdInput onSubmit={handleUserIdSubmit} />
  }

  // Show main dashboard with configuration when userID is available
  return (
    <>
      <DiagnosticDashboard 
        userId={userId}
        selectedInsightId={selectedInsightId}
      />
      <InsightConfig 
        userId={userId} 
        selectedInsightId={selectedInsightId}
        onInsightSelect={setSelectedInsightId}
        onLogout={handleLogout} 
      />
    </>
  )
}
