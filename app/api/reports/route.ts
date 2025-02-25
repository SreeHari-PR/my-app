import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import ExcelJS from "exceljs"
import PDFDocument from "pdfkit"

// Helper function to create Excel workbook
async function generateExcelReport(data: any, reportType: string) {
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
      break
    case "items":
      worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Description", key: "description", width: 30 },
        { header: "Quantity", key: "quantity", width: 10 },
        { header: "Price", key: "price", width: 15 },
      ]
      break
    case "customer":
      worksheet.columns = [
        { header: "Customer", key: "customer", width: 20 },
        { header: "Total Purchases", key: "totalPurchases", width: 15 },
        { header: "Total Amount", key: "totalAmount", width: 15 },
      ]
      break
  }

  worksheet.addRows(data)

  const buffer = await workbook.xlsx.writeBuffer()
  return buffer
}

// Helper function to create PDF document
async function generatePDFReport(data: any, reportType: string) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on("data", (chunk) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    // Add title
    doc.fontSize(16).text(`${reportType.toUpperCase()} REPORT`, { align: "center" })
    doc.moveDown()

    // Add date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`)
    doc.moveDown()

    // Add table headers and data based on report type
    switch (reportType) {
      case "sales":
        doc.text("Date\t\tItem\t\tQuantity\tCustomer\tTotal")
        doc.moveDown()
        data.forEach((sale: any) => {
          doc.text(
            `${new Date(sale.date).toLocaleDateString()}\t${sale.item}\t${sale.quantity}\t${sale.customer}\t$${sale.total.toFixed(2)}`,
          )
        })
        break
      case "items":
        doc.text("Name\t\tDescription\t\tQuantity\tPrice")
        doc.moveDown()
        data.forEach((item: any) => {
          doc.text(`${item.name}\t${item.description}\t${item.quantity}\t$${item.price.toFixed(2)}`)
        })
        break
      case "customer":
        doc.text("Customer\t\tTotal Purchases\tTotal Amount")
        doc.moveDown()
        data.forEach((customer: any) => {
          doc.text(`${customer.customer}\t${customer.totalPurchases}\t$${customer.totalAmount.toFixed(2)}`)
        })
        break
    }

    doc.end()
  })
}

// Helper function to create DOCX content
async function generateDOCXReport(data: any, reportType: string) {
  // For simplicity, we'll return a text buffer that can be saved as .docx
  // In a production environment, you'd want to use a proper DOCX library
  let content = `${reportType.toUpperCase()} REPORT\n\n`
  content += `Generated on: ${new Date().toLocaleDateString()}\n\n`

  switch (reportType) {
    case "sales":
      content += "Date\tItem\tQuantity\tCustomer\tTotal\n"
      data.forEach((sale: any) => {
        content += `${new Date(sale.date).toLocaleDateString()}\t${sale.item}\t${sale.quantity}\t${sale.customer}\t$${sale.total.toFixed(2)}\n`
      })
      break
    case "items":
      content += "Name\tDescription\tQuantity\tPrice\n"
      data.forEach((item: any) => {
        content += `${item.name}\t${item.description}\t${item.quantity}\t$${item.price.toFixed(2)}\n`
      })
      break
    case "customer":
      content += "Customer\tTotal Purchases\tTotal Amount\n"
      data.forEach((customer: any) => {
        content += `${customer.customer}\t${customer.totalPurchases}\t$${customer.totalAmount.toFixed(2)}\n`
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

    let data
    switch (reportType) {
      case "sales":
        data = await db.collection("sales").find({}).sort({ date: -1 }).toArray()
        break
      case "items":
        data = await db.collection("inventory").find({}).toArray()
        break
      case "customer":
        // Aggregate customer data from sales
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

    let buffer
    let filename
    let contentType

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
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Error generating report" }, { status: 500 })
  }
}

