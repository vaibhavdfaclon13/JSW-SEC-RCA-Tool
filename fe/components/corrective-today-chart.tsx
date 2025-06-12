"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

export function CorrectiveTodayChart() {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Sample data for corrective actions today (by hour)
  const hours = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}:00` : `${i}:00`))

  const currentHour = new Date().getHours()

  // Generate data for hours up to current hour
  const data = hours.slice(0, currentHour + 1).map((hour, index) => ({
    name: hour,
    y: Math.floor(Math.random() * 8) + 1, // Random value between 1-8
  }))

  const options: Highcharts.Options = {
    chart: {
      type: "column",
      height: 300,
    },
    title: {
      text: undefined,
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: hours.slice(0, currentHour + 1),
      crosshair: true,
      labels: {
        rotation: -45,
        style: {
          fontSize: "10px",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Corrective Actions",
      },
      allowDecimals: false,
    },
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat:
        '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
        '<td style="padding:0"><b>{point.y}</b></td></tr>',
      footerFormat: "</table>",
      shared: true,
      useHTML: true,
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        colorByPoint: true,
        colors: [
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#6b7280",
          "#4b5563",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
          "#6b7280",
          "#4b5563",
          "#10b981",
          "#3b82f6",
          "#f59e0b",
          "#ef4444",
          "#8b5cf6",
        ],
      },
    },
    series: [
      {
        name: "Corrective Actions",
        type: "column",
        data: data,
        showInLegend: false,
      },
    ],
  }

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
    </div>
  )
}
