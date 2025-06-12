"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

interface StatusChartProps {
  data: {
    label: string
    count: number
    color: string
  }[]
}

export function StatusChart({ data }: StatusChartProps) {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Map colors to Highcharts colors
  const colorMap: Record<string, string> = {
    green: "#10b981",
    red: "#ef4444",
    orange: "#f59e0b",
    purple: "#8b5cf6",
    blue: "#3b82f6",
    gray: "#6b7280",
    "gray-dark": "#4b5563",
  }

  // Transform data for Highcharts
  const chartData = data.map((item) => ({
    name: item.label,
    y: item.count,
    color: colorMap[item.color] || "#6b7280",
    dataLabels: {
      enabled: true,
      format: "{point.y}",
      position: "outside",
    },
  }))

  const options: Highcharts.Options = {
    chart: {
      type: "pie",
      height: 300,
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.y} ({point.percentage:.1f}%)</b>",
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.y}",
          distance: 20,
        },
        showInLegend: true,
        innerSize: "60%",
      },
    },
    legend: {
      align: "right",
      verticalAlign: "middle",
      layout: "vertical",
      itemMarginBottom: 10,
      symbolRadius: 0,
      itemStyle: {
        fontWeight: "normal",
      },
    },
    series: [
      {
        name: "Status",
        type: "pie",
        data: chartData,
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
}
