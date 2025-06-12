"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

export function FaultFrequencyChart() {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

  // Sample data for fault frequency today
  const faultData = [
    { name: "Fault 1", y: 20 },
    { name: "Fault 2", y: 17 },
    { name: "Fault 3", y: 36 },
    { name: "Fault 4", y: 15 },
    { name: "Fault 5", y: 14 },
    { name: "Fault 6", y: 43 },
    { name: "Fault 7", y: 39 },
  ]

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
        colors: [
          "#10b981", // green
          "#f59e0b", // orange
          "#ef4444", // red
          "#8b5cf6", // purple
          "#3b82f6", // blue
          "#6b7280", // gray
          "#4b5563", // dark gray
        ],
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
        name: "Fault Frequency",
        type: "pie",
        data: faultData,
      },
    ],
  }

  return <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
}
