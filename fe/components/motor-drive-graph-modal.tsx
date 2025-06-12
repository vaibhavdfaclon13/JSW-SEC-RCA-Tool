"use client"

import { useRef } from "react"
import { CustomModal } from "./custom-modal"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

interface MotorDriveGraphModalProps {
  isOpen: boolean
  onClose: () => void
  assetData?: {
    name: string
    id: string
  }
}

export function MotorDriveGraphModal({ isOpen, onClose, assetData }: MotorDriveGraphModalProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Sample vibration data for motor drive end
  const generateVibrationData = () => {
    const data = []
    for (let i = 0; i < 100; i++) {
      const time = i * 0.1
      const amplitude = Math.sin(time * 2) * 0.5 + Math.sin(time * 5) * 0.3 + Math.random() * 0.1
      data.push([time, amplitude])
    }
    return data
  }

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      height: 400,
      zoomType: "x",
    },
    title: {
      text: `Motor Drive End - Vibration Analysis`,
    },
    subtitle: {
      text: `Asset: ${assetData?.name || "Unknown Asset"}`,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      title: {
        text: "Time (seconds)",
      },
      crosshair: true,
    },
    yAxis: {
      title: {
        text: "Amplitude (mm/s)",
      },
      plotLines: [
        {
          value: 0,
          width: 1,
          color: "#808080",
        },
      ],
    },
    tooltip: {
      headerFormat: "<b>{series.name}</b><br/>",
      pointFormat: "Time: {point.x:.2f}s<br/>Amplitude: {point.y:.3f} mm/s",
    },
    legend: {
      enabled: true,
    },
    plotOptions: {
      line: {
        marker: {
          enabled: false,
        },
        lineWidth: 2,
      },
    },
    series: [
      {
        name: "Vibration Signal",
        type: "line",
        data: generateVibrationData(),
        color: "#3b82f6",
      },
      {
        name: "Threshold",
        type: "line",
        data: [
          [0, 0.8],
          [10, 0.8],
        ],
        color: "#ef4444",
        dashStyle: "Dash",
        marker: {
          enabled: false,
        },
      },
    ],
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Motor Drive End Analysis">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-900">RMS Velocity</div>
            <div className="text-lg font-bold text-blue-700">2.34 mm/s</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-900">Peak Frequency</div>
            <div className="text-lg font-bold text-green-700">47.5 Hz</div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="font-medium text-orange-900">Temperature</div>
            <div className="text-lg font-bold text-orange-700">68°C</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-900">Status</div>
            <div className="text-lg font-bold text-purple-700">Warning</div>
          </div>
        </div>

        <div className="border rounded-lg p-2">
          <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <h4 className="font-medium text-yellow-800 mb-2">Analysis Summary</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Elevated vibration levels detected at motor drive end</li>
            <li>• Frequency analysis indicates potential bearing wear</li>
            <li>• Recommend scheduling maintenance within 2 weeks</li>
            <li>• Monitor temperature trends closely</li>
          </ul>
        </div>
      </div>
    </CustomModal>
  )
}
