"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomModal } from "./custom-modal"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  assetData?: {
    name: string
    fault: string
    recommendation?: string
    date?: string
  }
}

export function FeedbackModal({ isOpen, onClose, assetData }: FeedbackModalProps) {
  const [date, setDate] = useState(assetData?.date || "")
  const [hour, setHour] = useState("08")
  const [minute, setMinute] = useState("45")
  const [feedback, setFeedback] = useState("inaccurate")

  const handleSubmit = () => {
    // Handle form submission
    console.log("Feedback submitted")
    onClose()
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Feedback"
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
          <Input id="assetName" defaultValue={assetData?.name || "Energy"} />
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
          <Label htmlFor="recommendation" className="text-green-600">
            Recommendation
          </Label>
          <Input id="recommendation" defaultValue={assetData?.recommendation || "Plant 2 and 3 Energy Analysis"} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="feedback" className="text-green-600">
            Feedback
          </Label>
          <Select defaultValue={feedback} onValueChange={setFeedback}>
            <SelectTrigger id="feedback">
              <SelectValue placeholder="Select feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inaccurate">Inaccurate recommendation</SelectItem>
              <SelectItem value="helpful">Helpful recommendation</SelectItem>
              <SelectItem value="notApplicable">Not applicable</SelectItem>
              <SelectItem value="needsImprovement">Needs improvement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CustomModal>
  )
}
