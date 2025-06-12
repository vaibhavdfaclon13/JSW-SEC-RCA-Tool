"use client"

import { useRef } from "react"
import Highcharts from "highcharts"
import HighchartsReact from "highcharts-react-official"

export function FaultChart() {
  const chartComponentRef = useRef<HighchartsReact.RefObject>(null)

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
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
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
          enabled: false,
        },
        showInLegend: true,
        innerSize: "60%",
        colors: ["#4b5563", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6", "#6b7280"],
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
        name: "Fault",
        type: "pie",
        data: [
          { name: "Fault 7", y: 39, dataLabels: { enabled: true, format: "39", position: "left", x: -30 } },
          { name: "Fault 1", y: 20, dataLabels: { enabled: true, format: "20", position: "right", y: -20 } },
          { name: "Fault 2", y: 17, dataLabels: { enabled: true, format: "17", position: "right" } },
          { name: "Fault 3", y: 36, dataLabels: { enabled: true, format: "36", position: "right", y: 20 } },
          { name: "Fault 4", y: 15, dataLabels: { enabled: true, format: "15", position: "right", y: 30 } },
          { name: "Fault 5", y: 14, dataLabels: { enabled: true, format: "14", position: "left", y: 30 } },
          { name: "Fault 6", y: 43, dataLabels: { enabled: true, format: "43", position: "left", y: -20 } },
        ],
      },
    ],
  }

  return (
    <div className="relative">
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
        <div className="bg-gray-500 text-white rounded-full h-10 w-10 flex items-center justify-center">C</div>
        <div className="bg-gray-200 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center -ml-2">S</div>
      </div>
    </div>
  )
}
