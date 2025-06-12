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
import DataAccess from "connector-userid-ts/connectors/DataAccess"

interface TagGraphModalProps {
  isOpen: boolean
  onClose: () => void
  tag: string
  tagColor: string
  tagDescription: string
  deviceId: string
  sensorIds: string[]
  endTime: string // ISO date string
}

// Hardcoded DataAccess config
const dataAccess = new DataAccess({
  userId: '66792886ef26fb850db806c5',
  dataUrl: 'datads.iosense.io',
  dsUrl: 'ds-server.iosense.io',
  onPrem: false,
  tz: 'UTC'
})

export function TagGraphModal({
  isOpen,
  onClose,
  tag,
  tagColor,
  tagDescription,
  deviceId,
  sensorIds,
  endTime,
}: TagGraphModalProps) {
  const [activeTab, setActiveTab] = useState<string>(sensorIds[0] || '')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sensorData, setSensorData] = useState<Record<string, Array<{ time: string; value: number }>>>({})

  useEffect(() => {
    if (isOpen && deviceId && sensorIds.length > 0) {
      fetchSensorData()
    }
    // eslint-disable-next-line
  }, [isOpen, deviceId, JSON.stringify(sensorIds), endTime])

  const fetchSensorData = async () => {
    setLoading(true)
    setError(null)
    try {
      const endDate = new Date(endTime)
      const startDate = new Date(endDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      const dataPromises = sensorIds.map(async (sensorId) => {
        const data = await dataAccess.dataQuery({
          deviceId,
          sensorList: [sensorId],
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          cal: true,
          alias: true,
        })
        return {
          sensorId,
          data: data.map((point: any) => ({
            time: new Date(point.time).toLocaleTimeString(),
            value: parseFloat(point.value) || 0,
          })),
        }
      })
      const results = await Promise.all(dataPromises)
      const formattedData = results.reduce((acc, { sensorId, data }) => {
        acc[sensorId] = data
        return acc
      }, {} as Record<string, Array<{ time: string; value: number }>>)
      setSensorData(formattedData)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sensor data')
      setSensorData({})
    } finally {
      setLoading(false)
    }
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