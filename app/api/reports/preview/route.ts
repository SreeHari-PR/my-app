import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromain from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get("type")

    if (!reportType) {
      return NextResponse.json({ error: "Missing report type" }, { status: 400 })
    }

    const client = await clientPromain
    const db = client.db()

    let data
    switch (reportType) {
      case "sales":
        data = await db
          .collection("sales")
          .find({})
          .sort({ date: -1 })
          .limit(10) // Limit to last 10 records for preview
          .toArray()
        break
      case "items":
        data = await db.collection("inventory").find({}).limit(10).toArray()
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
            { $limit: 10 },
          ])
          .toArray()
        break
      default:
        return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: "Error fetching preview data" }, { status: 500 })
  }
}

