"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CorrectiveTableProps {
  data: any[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
  setCurrentPage: (page: number) => void
  setItemsPerPage: (items: number) => void
  startItem: number
  endItem: number
}

export function CorrectiveTable({
  data,
  totalItems,
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  startItem,
  endItem,
}: CorrectiveTableProps) {
  const getStatusBadge = (status: string, color: string) => {
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
  }

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

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Fault Date & time</TableHead>
            <TableHead>Fault</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Corrective Action</TableHead>
            <TableHead>Action Initiator</TableHead>
            <TableHead>Action Date & Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((asset) => (
            <TableRow key={asset.id} className="hover:bg-gray-50">
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.lastUpdated}</TableCell>
              <TableCell>{asset.fault}</TableCell>
              <TableCell>{getStatusBadge(asset.status, asset.statusColor)}</TableCell>
              <TableCell>{`Corrective Action ${asset.id}`}</TableCell>
              <TableCell>{asset.id === "1" ? "John Patil" : `Name ${asset.id}`}</TableCell>
              <TableCell>{asset.lastUpdated}</TableCell>
            </TableRow>
          ))}
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
    </div>
  )
}
