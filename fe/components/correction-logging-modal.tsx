"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomModal } from "./custom-modal"

interface CorrectionLoggingModalProps {
  isOpen: boolean
  onClose: () => void
  assetData?: {
    name: string
    fault: string
    date?: string
  }
}

export function CorrectionLoggingModal({ isOpen, onClose, assetData }: CorrectionLoggingModalProps) {
  const [date, setDate] = useState(assetData?.date || "")
  const [hour, setHour] = useState("08")
  const [minute, setMinute] = useState("45")
  const [actionDate, setActionDate] = useState(new Date().toLocaleDateString("en-GB").split("/").join("/"))
  const [actionHour, setActionHour] = useState("08")
  const [actionMinute, setActionMinute] = useState("45")

  const handleSubmit = () => {
    // Handle form submission
    console.log("Correction logged")
    onClose()
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Correction Logging"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </>
      }
    >
      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="assetName" className="text-green-600">
            Asset Name
          </Label>
          <Input id="assetName" defaultValue={assetData?.name || "Energy Monitoring Dashboard"} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="detectionDate" className="text-green-600">
              Date Of Detection
            </Label>
            <Input id="detectionDate" value={date || "18/11/2024"} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="detectionHour" className="text-green-600">
              Hr
            </Label>
            <Input id="detectionHour" value={hour} onChange={(e) => setHour(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="detectionMinute" className="text-green-600">
              Min
            </Label>
            <Input id="detectionMinute" value={minute} onChange={(e) => setMinute(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="fault" className="text-green-600">
            Fault
          </Label>
          <Input id="fault" defaultValue={assetData?.fault || "Fault 1"} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="correctiveAction" className="text-green-600">
            Corrective Action
          </Label>
          <Select defaultValue="plant2and3">
            <SelectTrigger id="correctiveAction">
              <SelectValue placeholder="Select corrective action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plant2and3">Plant 2 and 3 Energy Analysis</SelectItem>
              <SelectItem value="plant1">Plant 1 Energy Analysis</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="actionTakenBy" className="text-green-600">
            Action Taken By
          </Label>
          <Input id="actionTakenBy" defaultValue="John Patil" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="actionDate" className="text-green-600">
              Date of Action
            </Label>
            <Input id="actionDate" value={actionDate} onChange={(e) => setActionDate(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="actionHour" className="text-green-600">
              Hr
            </Label>
            <Input id="actionHour" value={actionHour} onChange={(e) => setActionHour(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="actionMinute" className="text-green-600">
              Min
            </Label>
            <Input id="actionMinute" value={actionMinute} onChange={(e) => setActionMinute(e.target.value)} />
          </div>
        </div>
      </div>
    </CustomModal>
  )
}
