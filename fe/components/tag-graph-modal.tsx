import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, Info, Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from 'next/dynamic'

// Remove the dynamic import since we're handling it differently

interface TagGraphModalProps {
  isOpen: boolean
  onClose: () => void
  tag: string
  tagColor: string
  tagDescription: string
  deviceId: string
  sensorIds: string[]
  endTime: string // ISO date string
  userId: string
}

// Function to initialize DataAccess with userId
const initializeDataAccess = (userId: string) => {
  if (typeof window === 'undefined') return null
  
  // Debug DataAccess initialization
  console.log('=== DATAACCESS INITIALIZATION DEBUG ===')
  console.log('Passed userId:', userId)
  console.log('Data URL:', 'datads.iosense.io')
  console.log('DS URL:', 'datads.iosense.io')
  console.log('On Prem:', false)
  
  try {
    const DataAccessClass = require('connector-userid-ts').default
    console.log('DataAccess class loaded:', DataAccessClass)
    
    const dataAccess = new DataAccessClass({
      userId: userId,
      dataUrl: 'datads.iosense.io',
      dsUrl: 'datads.iosense.io',
      onPrem: false,
      tz: 'UTC'
    })
    console.log('DataAccess instance created:', dataAccess)
    console.log('DataAccess methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(dataAccess)))
    console.log('=== END DATAACCESS INITIALIZATION ===')
    return dataAccess
  } catch (error) {
    console.error('Error initializing DataAccess:', error)
    console.log('=== END DATAACCESS INITIALIZATION (ERROR) ===')
    return null
  }
}

export function TagGraphModal({
  isOpen,
  onClose,
  tag,
  tagColor,
  tagDescription,
  deviceId,
  sensorIds,
  endTime,
  userId,
}: TagGraphModalProps) {
  const [activeTab, setActiveTab] = useState<string>(sensorIds[0] || '')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sensorData, setSensorData] = useState<Record<string, Array<{ time: string; value: number }>>>({})
  const [dataAccess, setDataAccess] = useState<any>(null)

  // Initialize DataAccess when component mounts or userId changes
  useEffect(() => {
    console.log('=== TAGMODAL USERID EFFECT ===')
    console.log('Received userId:', userId)
    if (userId) {
      const dataAccessInstance = initializeDataAccess(userId)
      setDataAccess(dataAccessInstance)
      console.log('DataAccess set:', !!dataAccessInstance)
    } else {
      console.log('No userId provided, cannot initialize DataAccess')
    }
    console.log('=== END TAGMODAL USERID EFFECT ===')
  }, [userId])

  useEffect(() => {
    if (isOpen && deviceId && sensorIds.length > 0 && dataAccess) {
      fetchSensorData()
    }
  }, [isOpen, deviceId, sensorIds, endTime, dataAccess])

  const fetchSensorData = async () => {
    console.log('=== FETCHSENSORDATA START ===')
    console.log('Modal Props:', { tag, deviceId, sensorIds, endTime })
    
    setLoading(true)
    setError(null)

    try {
      // Check if dataAccess is available
      if (!dataAccess) {
        console.warn("No dataAccess available, using dummy data")
        const dummyData = generateDummyData(sensorIds, tag);
        setSensorData(dummyData);
        return;
      }
      console.log('DataAccess instance available:', !!dataAccess)

      // Calculate start time (1 day before end time for better debugging)
      const endDate = new Date(endTime)
      const startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000) // Changed to 1 day
      
      console.log('Time Range:')
      console.log('  Start Date:', startDate.toISOString())
      console.log('  End Date:', endDate.toISOString())
      console.log('  Device ID:', deviceId)
      console.log('  Sensor IDs:', sensorIds)

      // Fetch data for each sensor
      const dataPromises = sensorIds.map(async (sensorId, index) => {
        console.log(`--- Processing Sensor ${index + 1}/${sensorIds.length}: ${sensorId} ---`)
        
        const queryParams = {
          deviceId,
          sensorList: [sensorId],
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          cal: true,
          alias: true,
        }
        
        console.log('DataQuery params:', queryParams)
        
        try {
          const data = await dataAccess.dataQuery(queryParams)
          console.log(`Sensor ${sensorId} raw response:`, data)
          console.log(`Sensor ${sensorId} data points count:`, data?.length || 0)
          
          if (data && data.length > 0) {
            console.log(`First data point for ${sensorId}:`, data[0])
            console.log(`Last data point for ${sensorId}:`, data[data.length - 1])
          }

          // Format data for the chart
          const formattedData = data.map((point: any, idx: number) => {
            const formatted = {
              time: new Date(point.time).toLocaleTimeString(),
              value: parseFloat(point.value) || 0,
            }
            if (idx < 3) {
              console.log(`Formatted point ${idx} for ${sensorId}:`, formatted)
            }
            return formatted
          })

          return {
            sensorId,
            data: formattedData,
          }
        } catch (sensorError: any) {
          console.error(`Error fetching data for sensor ${sensorId}:`, sensorError)
          return {
            sensorId,
            data: [],
            error: sensorError.message || 'Unknown error'
          }
        }
      })

      console.log('Waiting for all sensor data promises...')
      const results = await Promise.all(dataPromises)
      console.log('All sensor promises resolved:', results)
      
      const formattedData = results.reduce((acc, { sensorId, data, error }) => {
        if (error) {
          console.warn(`Sensor ${sensorId} had error:`, error)
        }
        acc[sensorId] = data || []
        return acc
      }, {} as Record<string, Array<{ time: string; value: number }>>)

      console.log('Final formatted data:', formattedData)
      console.log('Data summary:', Object.entries(formattedData).map(([id, data]) => ({ sensor: id, points: data.length })))
      
      setSensorData(formattedData)
    } catch (err: any) {
      console.error('=== FETCHSENSORDATA ERROR ===')
      console.error('Error details:', err)
      console.error('Error stack:', err.stack)
      
      // Generate dummy data on error
      console.log('Generating fallback dummy data due to error')
      const dummyData = generateDummyData(sensorIds, tag);
      setSensorData(dummyData);
      
      setError(err.message || 'Failed to fetch sensor data')
    } finally {
      setLoading(false)
      console.log('=== FETCHSENSORDATA END ===')
    }
  }
  
  // Function to generate realistic dummy data
  const generateDummyData = (sensorIds: string[], tag: string) => {
    const baseValue = tag.toLowerCase() === 'critical' ? 90 :
                     tag.toLowerCase() === 'high' ? 75 :
                     tag.toLowerCase() === 'medium' ? 60 :
                     tag.toLowerCase() === 'low' ? 45 : 30;
                     
    const variance = tag.toLowerCase() === 'critical' ? 15 :
                    tag.toLowerCase() === 'high' ? 12 :
                    tag.toLowerCase() === 'medium' ? 10 :
                    tag.toLowerCase() === 'low' ? 8 : 5;
    
    // Generate dummy data for each sensor
    return sensorIds.reduce((acc, sensorId) => {
      acc[sensorId] = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        value: Math.max(0, Math.min(100, baseValue + (Math.random() - 0.5) * variance)),
      }));
      return acc;
    }, {} as Record<string, Array<{ time: string; value: number }>>);
  }

  const getTagColor = (tag: string) => {
    switch (tag?.toLowerCase()) {
      case 'critical':
        return 'bg-[#e53935] text-white'
      case 'high':
        return 'bg-[#ffb300] text-black'
      case 'medium':
        return 'bg-[#2196f3] text-white'
      case 'low':
        return 'bg-[#43a047] text-white'
      default:
        return 'bg-[#e0e7ef] text-black'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={`${getTagColor(tag)} text-sm font-semibold`}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </Badge>
            <span className="text-lg">Tag Analysis</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <Info className="h-5 w-5 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-600">{tagDescription}</p>
            </div>
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="h-[300px] flex items-center justify-center text-red-500">
              <AlertTriangle className="h-8 w-8 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {sensorIds.map((sensorId) => (
                  <TabsTrigger key={sensorId} value={sensorId}>
                    Sensor {sensorId}
                  </TabsTrigger>
                ))}
              </TabsList>
              {sensorIds.map((sensorId) => (
                <TabsContent key={sensorId} value={sensorId}>
                  <div className="h-[300px] w-full">
                    {sensorData[sensorId]?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sensorData[sensorId]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="time" 
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            stroke="#666"
                            tick={{ fontSize: 12 }}
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `${value.toFixed(1)}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            }}
                            formatter={(value: number) => [`${value.toFixed(2)}`, 'Value']}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke={tagColor}
                            strokeWidth={2}
                            dot={{ fill: tagColor, strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: tagColor }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        No data available for this sensor
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-700 mb-1">Trend Analysis</h4>
                <p className="text-sm text-blue-600">
                  {tag.toLowerCase() === 'critical' ? 'Critical values showing significant deviation from normal range' :
                   tag.toLowerCase() === 'high' ? 'High values indicating potential issues that need attention' :
                   tag.toLowerCase() === 'medium' ? 'Medium values showing moderate fluctuations' :
                   tag.toLowerCase() === 'low' ? 'Low values within acceptable range' :
                   'Values within normal operating parameters'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 