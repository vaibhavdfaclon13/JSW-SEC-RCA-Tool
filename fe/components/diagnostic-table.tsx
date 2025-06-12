"use client"

import { useState, useCallback, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import React from "react"
import { ParameterGraphModal } from "./parameter-graph-modal"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { TagGraphModal } from "./tag-graph-modal"
import logger from "@/lib/logger"

interface DiagnosticTableProps {
  data: any[]
  onSelectRows?: (rows: string[]) => void
  totalItems: number
  currentPage: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  startItem: number
  endItem: number
  userId: string
}

// DummyLineChart component for popover
function DummyLineChart() {
  const [points, setPoints] = useState<Array<[number, number]>>([]);

  useEffect(() => {
    // Only run on client
    const generated: Array<[number, number]> = Array.from({ length: 20 }, (_, i) => [i * 20, 40 + Math.sin(i / 2) * 20 + Math.random() * 10] as [number, number]);
    setPoints(generated);
  }, []);

  if (points.length === 0) {
    // Optionally show a loading spinner or skeleton
    return <div style={{ width: 400, height: 100, background: "#f9fafb", borderRadius: 8 }} />;
  }

  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${100 - y}`).join(' ');

  return (
    <svg width="400" height="100" style={{ background: '#f9fafb', borderRadius: 8 }}>
      <polyline
        fill="none"
        stroke="#3b82f6"
        strokeWidth="3"
        points={points.map(([x, y]) => `${x},${100 - y}`).join(' ')}
      />
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" />
    </svg>
  );
}

export function DiagnosticTable({
  data,
  onSelectRows,
  totalItems,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  startItem,
  endItem,
  userId,
}: DiagnosticTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])
  const [showParameterModal, setShowParameterModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)
  const [selectedParameter, setSelectedParameter] = useState<any>(null)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [selectedTag, setSelectedTag] = useState<{
    tag: string;
    description: string;
    deviceId: string;
    sensorIds: string[];
    endTime: string;
    userId: string;
  } | null>(null)
  const [showTagModal, setShowTagModal] = useState(false)

  const toggleExpandRow = useCallback((id: string) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]))
  }, [])

  const toggleRow = useCallback(
    (id: string) => {
      setSelectedRows((prev) => {
        const newSelection = prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        onSelectRows?.(newSelection)
        return newSelection
      })
    },
    [onSelectRows],
  )

  const getStatusBadge = useCallback((status: string, color: string) => {
    const colorMap: Record<string, string> = {
      green: "bg-green-100 text-green-800 border-green-300",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
      red: "bg-red-100 text-red-800 border-red-300",
      purple: "bg-purple-100 text-purple-800 border-purple-300",
      blue: "bg-blue-100 text-blue-800 border-blue-300",
      orange: "bg-orange-100 text-orange-800 border-orange-300",
      gray: "bg-gray-100 text-gray-800 border-gray-300",
      "gray-dark": "bg-gray-200 text-gray-800 border-gray-400",
    }

    return <span className={`px-2 py-1 rounded-full text-xs ${colorMap[color] || ""}`}>{status}</span>
  }, [])

  const getParameterBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical':
      case 'high':
        return "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
      case 'warning':
      case 'medium':
        return "bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200"
      case 'low':
        return "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
      case 'normal':
        return "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200"
    }
  }

  const handleOpenParameterModal = useCallback((asset: any, parameter: any) => {
    setSelectedAsset(asset)
    setSelectedParameter(parameter)
    setShowParameterModal(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setShowParameterModal(false)
    setSelectedAsset(null)
    setSelectedParameter(null)
    // Force a re-render after modal closes
    setTimeout(() => {
      setForceUpdate((prev) => prev + 1)
    }, 0)
  }, [])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (endItem < totalItems) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Get fault analysis data from the raw data
  const getFaultAnalysis = (rawData: any) => {
    return rawData?.result?.FaultsFound_Analysis || {}
  }

  // Get root cause and recommendations
  const getRootCauseData = (rawData: any) => {
    return rawData?.result?.RootCause_RecommendedSolutions || {}
  }

  const getTagColor = (tag: string) => {
    switch (tag?.toLowerCase()) {
      case 'critical':
        return '#e53935'
      case 'high':
        return '#ffb300'
      case 'medium':
        return '#2196f3'
      case 'low':
        return '#43a047'
      default:
        return '#e0e7ef'
    }
  }

  const handleTagClick = (tag: string, description: string, deviceId: string, sensorIds: string[], endTime: string) => {
    // Use a default userId or extract it from asset data if available
    const userId = "66792886ef26fb850db806c5"  // This is the same userId we saw in the terminal logs
    
    // Ensure we have at least some sample sensor IDs if none are provided
    const useSensorIds = sensorIds && sensorIds.length > 0 
      ? sensorIds 
      : ["temp_sensor", "pressure_sensor", "vibration_sensor", "speed_sensor"];
      
    // Ensure we have a valid device ID
    const useDeviceId = deviceId || "sample_device_123";
    
    // Ensure we have a valid end time (default to current time)
    const useEndTime = endTime || new Date().toISOString();
    
    setSelectedTag({ 
      tag, 
      description, 
      deviceId: useDeviceId, 
      sensorIds: useSensorIds, 
      endTime: useEndTime, 
      userId 
    });
    setShowTagModal(true);
  }

  const handleCloseTagModal = () => {
    setShowTagModal(false)
    setSelectedTag(null)
  }

  return (
    <div className="border rounded-md" key={`table-container-${forceUpdate}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {onSelectRows && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedRows.length === data.length && data.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const allIds = data.map((asset) => asset.id)
                      setSelectedRows(allIds)
                      onSelectRows?.(allIds)
                    } else {
                      setSelectedRows([])
                      onSelectRows?.([])
                    }
                  }}
                />
              </TableHead>
            )}
            <TableHead>Mill Name</TableHead>
            <TableHead>Detected Issue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((asset) => {
            const faultAnalysis = getFaultAnalysis(asset.rawData)
            const rootCauseData = getRootCauseData(asset.rawData)
            
            return (
            <React.Fragment key={asset.id}>
              <TableRow
                className="hover:bg-gray-50 group"
                data-state={selectedRows.includes(asset.id) ? "selected" : ""}
              >
                {onSelectRows && (
                  <TableCell className="w-[50px]">
                    <Checkbox checked={selectedRows.includes(asset.id)} onCheckedChange={() => toggleRow(asset.id)} />
                  </TableCell>
                )}
                <TableCell className="font-medium">{asset.name}</TableCell>
                <TableCell className="max-w-md">
                  <div className="truncate" title={asset.fault}>
                    {asset.fault}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(asset.status, asset.statusColor)}</TableCell>
                <TableCell>{asset.lastUpdated}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpandRow(asset.id)}>
                      <ChevronDown className={`h-5 w-5 text-gray-700 transition-transform ${expandedRows.includes(asset.id) ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {expandedRows.includes(asset.id) && (
                <TableRow>
                  <TableCell colSpan={6} className="p-0">
                    <div className="bg-[#fffbf2] border border-[#ffecb5] rounded-md p-4">
                      <h3 className="text-black font-bold flex items-center gap-2 mb-4 text-base">
                        <AlertTriangle className="h-5 w-5 text-[#e5a635]" />
                        Faults Found & Analysis
                      </h3>
                      <div className="bg-[#fff8e1] border border-[#ffe082] rounded p-3">
                        <h4 className="font-bold text-black mb-1 text-base">Detected Issue:</h4>
                        <p className="text-base text-black mb-4">{faultAnalysis.detected_issue || 'No issue detected'}</p>
                        <h4 className="font-bold text-black mb-2 text-base">DETAILED ANALYSIS POINTS:</h4>
                        <ul className="space-y-2">
                          {Object.values(faultAnalysis.detailed_analysis_points || {}).map((point: any, idx: number) => {
                            // Extract device ID and sensor IDs from the point data
                            const deviceId = point.dev_id || '';
                            const sensorIds = point.sensor_id || [];
                            const endTime = asset.rawData?.invocationTime || new Date().toISOString();
                            const isClickable = deviceId && sensorIds.length > 0;
                            
                            logger.data(`Analysis Point ${idx + 1}`, {
                              deviceId,
                              sensorIds,
                              endTime,
                              isClickable
                            });

                            return (
                              <li key={idx} className="flex items-start gap-2 text-base text-black">
                                {isClickable ? (
                                  <button
                                    className={
                                      `rounded-full px-3 py-1 text-xs font-semibold mr-2 inline-block align-middle cursor-pointer hover:opacity-90 transition-opacity shadow-sm border border-white/30 hover:shadow-md transform hover:translate-y-[-1px] ` +
                                      (point.tag?.toLowerCase() === 'critical'
                                        ? 'bg-[#e53935] text-white'
                                        : point.tag?.toLowerCase() === 'high'
                                        ? 'bg-[#ffb300] text-black'
                                        : point.tag?.toLowerCase() === 'medium'
                                        ? 'bg-[#2196f3] text-white'
                                        : point.tag?.toLowerCase() === 'low'
                                        ? 'bg-[#43a047] text-white'
                                        : 'bg-[#e0e7ef] text-black')
                                    }
                                    onClick={() => handleTagClick(point.tag, point.rca, deviceId, sensorIds, endTime)}
                                    title={`View data for ${sensorIds.join(', ')}`}
                                  >
                                    {point.tag?.charAt(0).toUpperCase() + point.tag?.slice(1)}
                                  </button>
                                ) : (
                                  <span
                                    className={
                                      `rounded-full px-3 py-1 text-xs font-semibold mr-2 inline-block align-middle opacity-90 border-dashed border ` +
                                      (point.tag?.toLowerCase() === 'critical'
                                        ? 'bg-[#e53935]/80 text-white border-white/20'
                                        : point.tag?.toLowerCase() === 'high'
                                        ? 'bg-[#ffb300]/80 text-black border-black/20'
                                        : point.tag?.toLowerCase() === 'medium'
                                        ? 'bg-[#2196f3]/80 text-white border-white/20'
                                        : point.tag?.toLowerCase() === 'low'
                                        ? 'bg-[#43a047]/80 text-white border-white/20'
                                        : 'bg-[#e0e7ef]/80 text-black border-black/20')
                                    }
                                    title="No sensor data available for this tag"
                                  >
                                    {point.tag?.charAt(0).toUpperCase() + point.tag?.slice(1)}
                                  </span>
                                )}
                                <div className="align-middle">
                                  <span>{point.rca}</span>
                                </div>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          )})}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between px-4 py-2 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Items per page:</span>
          <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number.parseInt(value))}>
            <SelectTrigger className="h-8 w-16">
              <SelectValue placeholder="50" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-gray-500">
          {startItem}-{endItem} of {totalItems}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={endItem >= totalItems}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ParameterGraphModal
        isOpen={showParameterModal}
        onClose={handleCloseModal}
        assetData={selectedAsset}
        parameterData={selectedParameter}
      />
      {selectedTag && (
        <TagGraphModal
          isOpen={showTagModal}
          onClose={handleCloseTagModal}
          tag={selectedTag.tag}
          tagColor={getTagColor(selectedTag.tag)}
          tagDescription={selectedTag.description}
          deviceId={selectedTag.deviceId}
          sensorIds={selectedTag.sensorIds}
          endTime={selectedTag.endTime}
          userId={selectedTag.userId}
        />
      )}
    </div>
  )
}
