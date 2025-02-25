import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const sales = await db.collection("sales").find({}).sort({ date: -1 }).toArray()

    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const data = await request.json()

    // Update inventory quantity
    const inventory = await db.collection("inventory").findOne({ name: data.item })
    if (!inventory) {
      return NextResponse.json({ error: "Item not found in inventory" }, { status: 404 })
    }

    if (inventory.quantity < data.quantity) {
      return NextResponse.json({ error: "Insufficient inventory quantity" }, { status: 400 })
    }

    // Update inventory
    await db.collection("inventory").updateOne({ name: data.item }, { $inc: { quantity: -data.quantity } })

    // Record sale
    const newSale = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
      date: new Date(data.date).toISOString(),
    }

    const result = await db.collection("sales").insertOne(newSale)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error recording sale" }, { status: 500 })
  }
}

