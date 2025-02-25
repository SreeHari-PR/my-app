"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Printer, FileSpreadsheet, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PreviewData {
  _id?: string
  date?: string
  item?: string
  name?: string
  description?: string
  customer?: string
  quantity?: number
  price?: number
  total?: number
  totalPurchases?: number
  totalAmount?: number
}

export default function Reports() {
  const { status } = useSession()
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState("sales")
  const [isLoading, setIsLoading] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData[]>([])
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const reportTypes = [
    { value: "sales", label: "Sales Report" },
    { value: "items", label: "Items Report" },
    { value: "customer", label: "Customer Ledger" },
  ]

  const fetchPreviewData = useCallback(async () => {
    try {
      setIsPreviewLoading(true)
      const response = await fetch(`/api/reports/preview?type=${selectedReport}`)

      if (!response.ok) {
        throw new Error("Failed to fetch preview data")
      }

      const { data } = await response.json()
      setPreviewData(data)
    } catch (error) {
      toast.error("Error loading preview")
      console.error("Preview error:", error)
    } finally {
      setIsPreviewLoading(false)
    }
  }, [selectedReport])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated") {
      fetchPreviewData()
    }
  }, [status, router, fetchPreviewData])

  useEffect(() => {
    if (status === "authenticated") {
      fetchPreviewData()
    }
  }, [status, fetchPreviewData])

  const handleDownload = async (format: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/reports?type=${selectedReport}&format=${format}`)

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition?.split("filename=")[1] || `${selectedReport}_report.${format}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
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

  const renderPreviewTable = () => {
    if (isPreviewLoading) {
      return (
        <div className="h-96 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      )
    }

    if (previewData.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-emerald-100/60">No data available for preview</div>
      )
    }

    switch (selectedReport) {
      case "sales":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((sale, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(sale.date!).toLocaleDateString()}</TableCell>
                  <TableCell>{sale.item}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>{sale.customer}</TableCell>
                  <TableCell>${sale.total?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )

      case "items":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${item.price?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )

      case "customer":
        return (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Total Purchases</TableHead>
                <TableHead>Total Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((customer, index) => (
                <TableRow key={index}>
                  <TableCell>{customer.customer}</TableCell>
                  <TableCell>{customer.totalPurchases}</TableCell>
                  <TableCell>${customer.totalAmount?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )

      default:
        return null
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
          <div className="rounded-md border border-zinc-700">{renderPreviewTable()}</div>
        </CardContent>
      </Card>
    </div>
  )
}

