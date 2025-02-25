"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Printer, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Reports() {
  const { data: session } = useSession()
  const [selectedReport, setSelectedReport] = useState("sales")
  const [isLoading, setIsLoading] = useState(false)

  const reportTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "items", label: "Items Report" },
    { value: "customer", label: "Customer Ledger" },
  ]

  const handleDownload = async (format: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/reports?type=${selectedReport}&format=${format}`)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition?.split("filename=")[1] || `${selectedReport}_report.${format}`

      // Create a blob from the response
      const blob = await response.blob()

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob)

      // Create a temporary link element
      const link = document.createElement("a")
      link.href = url
      link.download = filename

      // Append the link to the body
      document.body.appendChild(link)

      // Click the link to trigger the download
      link.click()

      // Clean up
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully")
    } catch (error) {
      toast.error("Error generating report")
      console.error("Download error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-emerald-100">Reports</h1>
      <Card className="bg-zinc-800 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-emerald-100">Generate Report</CardTitle>
          <CardDescription className="text-emerald-100/60">Select a report type and export format</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-full bg-zinc-700 text-emerald-100 border-emerald-600">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleDownload("docx")}
                className="flex items-center bg-emerald-700 hover:bg-emerald-600 text-zinc-100"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Printer className="mr-2 h-4 w-4" />}
                Print (DOCX)
              </Button>
              <Button
                onClick={() => handleDownload("xlsx")}
                className="flex items-center bg-emerald-700 hover:bg-emerald-600 text-zinc-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                )}
                Excel
              </Button>
              <Button
                onClick={() => handleDownload("pdf")}
                className="flex items-center bg-emerald-700 hover:bg-emerald-600 text-zinc-100"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Preview Card */}
      <Card className="bg-zinc-800 border-emerald-700">
        <CardHeader>
          <CardTitle className="text-emerald-100">Report Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-zinc-700/50 flex items-center justify-center text-emerald-100/60 rounded-lg">
            Report preview will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

