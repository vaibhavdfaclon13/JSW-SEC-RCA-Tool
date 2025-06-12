"use client"

import { useRef } from "react"
import { CustomModal } from "./custom-modal"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

interface ParameterGraphModalProps {
  isOpen: boolean
  onClose: () => void
  assetData?: {
    name: string
    id: string
  }
  parameterData?: {
    name: string
    type: string
    value: string
    status: string
    color: string
  }
}

export function ParameterGraphModal({ isOpen, onClose, assetData, parameterData }: ParameterGraphModalProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Generate different types of data based on parameter type
  const generateParameterData = (type: string) => {
    const baseTime = Date.now() - 24 * 60 * 60 * 1000 // 24 hours ago
    const data = []

    for (let i = 0; i < 144; i++) {
      // 10-minute intervals over 24 hours
      const time = baseTime + i * 10 * 60 * 1000
      let value = 0

      switch (type) {
        case "vibration":
          value = 1.5 + Math.sin(i * 0.1) * 0.5 + Math.random() * 0.3
          if (i > 100) value += 0.8 // Simulate increasing vibration
          break
        case "temperature":
          value = 45 + Math.sin(i * 0.05) * 10 + Math.random() * 3
          if (i > 120) value += 15 // Simulate temperature rise
          break
        case "pressure":
          value = 12 + Math.sin(i * 0.08) * 2 + Math.random() * 0.5
          if (i > 80 && i < 120) value -= 3 // Simulate pressure drop
          break
        case "current":
          value = 6 + Math.sin(i * 0.06) * 1.5 + Math.random() * 0.4
          if (i > 110) value += 2 // Simulate current increase
          break
        case "voltage":
          value = 380 + Math.sin(i * 0.04) * 8 + Math.random() * 2
          break
        case "frequency":
          value = 50 + Math.sin(i * 0.1) * 2 + Math.random() * 0.5
          if (i > 100) value -= 2.5 // Simulate frequency deviation
          break
        case "flow":
          value = 100 + Math.sin(i * 0.07) * 15 + Math.random() * 5
          if (i > 90 && i < 130) value *= 0.7 // Simulate flow reduction
          break
        case "power":
          value = 0.85 + Math.sin(i * 0.03) * 0.1 + Math.random() * 0.02
          if (i > 100) value -= 0.15 // Simulate power factor drop
          break
        default:
          value = Math.random() * 100
      }

      data.push([time, Number.parseFloat(value.toFixed(2))])
    }

    return data
  }

  const getParameterConfig = (type: string) => {
    const configs = {
      vibration: {
        unit: "mm/s",
        threshold: 2.0,
        yAxisTitle: "Vibration Amplitude (mm/s)",
        color: "#ef4444",
        normalRange: [0, 1.5],
        warningRange: [1.5, 2.5],
      },
      temperature: {
        unit: "°C",
        threshold: 65,
        yAxisTitle: "Temperature (°C)",
        color: "#f59e0b",
        normalRange: [40, 60],
        warningRange: [60, 80],
      },
      pressure: {
        unit: "bar",
        threshold: 10,
        yAxisTitle: "Pressure (bar)",
        color: "#3b82f6",
        normalRange: [12, 18],
        warningRange: [8, 12],
      },
      current: {
        unit: "A",
        threshold: 8,
        yAxisTitle: "Current (A)",
        color: "#8b5cf6",
        normalRange: [5, 7.5],
        warningRange: [7.5, 9],
      },
      voltage: {
        unit: "V",
        threshold: 400,
        yAxisTitle: "Voltage (V)",
        color: "#10b981",
        normalRange: [370, 390],
        warningRange: [350, 370],
      },
      frequency: {
        unit: "Hz",
        threshold: 47,
        yAxisTitle: "Frequency (Hz)",
        color: "#f59e0b",
        normalRange: [49, 51],
        warningRange: [47, 49],
      },
      flow: {
        unit: "L/min",
        threshold: 80,
        yAxisTitle: "Flow Rate (L/min)",
        color: "#06b6d4",
        normalRange: [90, 130],
        warningRange: [70, 90],
      },
      power: {
        unit: "",
        threshold: 0.7,
        yAxisTitle: "Power Factor",
        color: "#84cc16",
        normalRange: [0.8, 0.95],
        warningRange: [0.7, 0.8],
      },
    }

    return configs[type as keyof typeof configs] || configs.vibration
  }

  if (!parameterData) return null

  const config = getParameterConfig(parameterData.type)
  const data = generateParameterData(parameterData.type)

  const options: Highcharts.Options = {
    chart: {
      type: "line",
      height: 400,
      zoomType: "x",
    },
    title: {
      text: `${parameterData.name} Analysis - ${assetData?.name}`,
    },
    subtitle: {
      text: `Current Value: ${parameterData.value} | Status: ${parameterData.status}`,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
      },
      crosshair: true,
    },
    yAxis: {
      title: {
        text: config.yAxisTitle,
      },
      plotBands: [
        {
          from: config.normalRange[0],
          to: config.normalRange[1],
          color: "rgba(16, 185, 129, 0.1)",
          label: {
            text: "Normal Range",
            style: {
              color: "#10b981",
            },
          },
        },
        {
          from: config.warningRange[0],
          to: config.warningRange[1],
          color: "rgba(245, 158, 11, 0.1)",
          label: {
            text: "Warning Range",
            style: {
              color: "#f59e0b",
            },
          },
        },
      ],
      plotLines: [
        {
          value: config.threshold,
          width: 2,
          color: "#ef4444",
          dashStyle: "Dash",
          label: {
            text: `Threshold: ${config.threshold} ${config.unit}`,
            style: {
              color: "#ef4444",
            },
          },
        },
      ],
    },
    tooltip: {
      headerFormat: "<b>{series.name}</b><br/>",
      pointFormat: "Time: {point.x:%Y-%m-%d %H:%M}<br/>Value: {point.y} " + config.unit,
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
        name: parameterData.name,
        type: "line",
        data: data,
        color: config.color,
      },
    ],
  }

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={`${parameterData.name} Parameter Analysis`}>
      <div className="border rounded-lg p-2">
        <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
      </div>
    </CustomModal>
  )
}
