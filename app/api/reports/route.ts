import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import ExcelJS from "exceljs"
import { jsPDF } from "jspdf"
import "jspdf-autotable"

interface TableColumn {
  header: string
  dataKey: string
}

interface ReportData {
  date?: string
  item?: string
  quantity?: number
  customer?: string
  total?: number
  name?: string
  description?: string
  price?: number
  totalPurchases?: number
  totalAmount?: number
}

interface ErrorResponse {
  message: string
  code?: string
  stack?: string
}

// Helper function to create Excel workbook
async function generateExcelReport(data: ReportData[], reportType: string) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet(reportType)

  switch (reportType) {
    case "sales":
      worksheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Item", key: "item", width: 20 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Customer", key: "customer", width: 20 },
        { header: "Total", key: "total", width: 15 },
      ]
      // Format data
      const salesData = data.map((sale: ReportData) => ({
        ...sale,
        date: sale.date ? new Date(sale.date).toLocaleDateString() : "",
        total: sale.total ? `$${sale.total.toFixed(2)}` : "$0.00",
      }))
      worksheet.addRows(salesData)
      break

    case "items":
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Description", key: "description", width: 30 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Price", key: "price", width: 15 },
      ]
      // Format data
      const itemsData = data.map((item: ReportData) => ({
        ...item,
        price: item.price ? `$${item.price.toFixed(2)}` : "$0.00",
      }))
      worksheet.addRows(itemsData)
      break

    case "customer":
      worksheet.columns = [
        { header: "Customer", key: "customer", width: 20 },
        { header: "Total Purchases", key: "totalPurchases", width: 15 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
      ]
      // Format data
      const customerData = data.map((customer: ReportData) => ({
        ...customer,
        totalAmount: customer.totalAmount ? `$${customer.totalAmount.toFixed(2)}` : "$0.00",
      }))
      worksheet.addRows(customerData)
      break
  }

  return await workbook.xlsx.writeBuffer()
}

// Helper function to create PDF document using jsPDF
async function generatePDFReport(data: ReportData[], reportType: string) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(16)
  doc.text(`${reportType.toUpperCase()} REPORT`, doc.internal.pageSize.width / 2, 20, { align: "center" })

  // Add date
  doc.setFontSize(12)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

  // Prepare table data based on report type
  const columns: TableColumn[] = []
  const rows: Record<string, string | number>[] = []

  switch (reportType) {
    case "sales":
      columns.push(
        { header: "Date", dataKey: "date" },
        { header: "Item", dataKey: "item" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Customer", dataKey: "customer" },
        { header: "Total", dataKey: "total" },
      )
      rows.push(
        ...data.map((sale: ReportData) => ({
          date: sale.date ? new Date(sale.date).toLocaleDateString() : "",
          item: sale.item || "",
          quantity: sale.quantity || 0,
          customer: sale.customer || "",
          total: sale.total ? `$${sale.total.toFixed(2)}` : "$0.00",
        })),
      )
      break

    case "items":
      columns.push(
        { header: "Name", dataKey: "name" },
        { header: "Description", dataKey: "description" },
        { header: "Quantity", dataKey: "quantity" },
        { header: "Price", dataKey: "price" },
      )
      rows.push(
        ...data.map((item: ReportData) => ({
          name: item.name || "",
          description: item.description || "",
          quantity: item.quantity || 0,
          price: item.price ? `$${item.price.toFixed(2)}` : "$0.00",
        })),
      )
      break

    case "customer":
      columns.push(
        { header: "Customer", dataKey: "customer" },
        { header: "Total Purchases", dataKey: "totalPurchases" },
        { header: "Total Amount", dataKey: "totalAmount" },
      )
      rows.push(
        ...data.map((customer: ReportData) => ({
          customer: customer.customer || "",
          totalPurchases: customer.totalPurchases || 0,
          totalAmount: customer.totalAmount ? `$${customer.totalAmount.toFixed(2)}` : "$0.00",
        })),
      )
      break
  }

  // @ts-expect-error - autotable is added by jspdf-autotable
  doc.autoTable({
    startY: 40,
    head: [columns.map((col) => col.header)],
    body: rows.map((row) => columns.map((col) => row[col.dataKey])),
    theme: "grid",
  })

  return Buffer.from(doc.output("arraybuffer"))
}

// Helper function to create DOCX content
async function generateDOCXReport(data: ReportData[], reportType: string) {
  let content = `${reportType.toUpperCase()} REPORT\n\n`
  content += `Generated on: ${new Date().toLocaleDateString()}\n\n`

  switch (reportType) {
    case "sales":
      content += "Date\tItem\tQuantity\tCustomer\tTotal\n"
      data.forEach((sale: ReportData) => {
        content += `${sale.date ? new Date(sale.date).toLocaleDateString() : ""}\t${sale.item || ""}\t${sale.quantity || 0}\t${sale.customer || ""}\t$${sale.total ? sale.total.toFixed(2) : "0.00"}\n`
      })
      break
    case "items":
      content += "Name\tDescription\tQuantity\tPrice\n"
      data.forEach((item: ReportData) => {
        content += `${item.name || ""}\t${item.description || ""}\t${item.quantity || 0}\t$${item.price ? item.price.toFixed(2) : "0.00"}\n`
      })
      break
    case "customer":
      content += "Customer\tTotal Purchases\tTotal Amount\n"
      data.forEach((customer: ReportData) => {
        content += `${customer.customer || ""}\t${customer.totalPurchases || 0}\t$${customer.totalAmount ? customer.totalAmount.toFixed(2) : "0.00"}\n`
      })
      break
  }

  return Buffer.from(content, "utf-8")
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type")
    const format = searchParams.get("format")

    if (!reportType || !format) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()

    let data: ReportData[] = []
    switch (reportType) {
      case "sales":
        data = await db.collection("sales").find({}).sort({ date: -1 }).toArray()
        break
      case "items":
        data = await db.collection("inventory").find({}).toArray()
        break
      case "customer":
        data = await db
          .collection("sales")
          .aggregate([
            {
              $group: {
                _id: "$customer",
                totalPurchases: { $sum: 1 },
                totalAmount: { $sum: "$total" },
              },
            },
            {
              $project: {
                _id: 0,
                customer: "$_id",
                totalPurchases: 1,
                totalAmount: 1,
              },
            },
          ])
          .toArray()
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    let buffer: Buffer
    let filename: string
    let contentType: string

    switch (format) {
      case "xlsx":
        buffer = await generateExcelReport(data, reportType)
        filename = `${reportType}_report.xlsx`
        contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        break
      case "pdf":
        buffer = await generatePDFReport(data, reportType)
        filename = `${reportType}_report.pdf`
        contentType = "application/pdf"
        break
      case "docx":
        buffer = await generateDOCXReport(data, reportType)
        filename = `${reportType}_report.docx`
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break
      default:
        return NextResponse.json({ error: "Invalid format" }, { status: 400 })
    }

    // Create response with appropriate headers
    const response = new NextResponse(buffer)
    response.headers.set("Content-Type", contentType)
    response.headers.set("Content-Disposition", `attachment; filename=${filename}`)

    return response
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error("Report generation error:", errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error generating report" }, { status: 500 })
  }
}

