import * as XLSX from "xlsx"

export function exportToExcel(data: any[], fileName: string) {
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(
    data.map((item) => ({
      "Asset Name": item.name,
      Fault: item.fault,
      Status: item.status,
      "Last Updated": item.lastUpdated,
      "Number of Devices": item.deviceCount,
    })),
  )

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data")

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
