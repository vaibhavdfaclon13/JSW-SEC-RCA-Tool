"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

export function CorrectiveYearChart() {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Sample data for corrective actions this year (by month)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const currentMonth = new Date().getMonth() // 0-11

  // Generate data for months up to current month
  const data = months.slice(0, currentMonth + 1).map((month, index) => ({
    name: month,
    y: Math.floor(Math.random() * 50) + 10, // Random value between 10-60
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
      categories: months.slice(0, currentMonth + 1),
      crosshair: true,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Number of Corrective Actions",
      },
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
