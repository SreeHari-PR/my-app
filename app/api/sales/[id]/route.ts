import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const sale = await db.collection("sales").findOne({ _id: new ObjectId(params.id) })

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json(sale)
  } catch (error) {
    return NextResponse.json({ error: "Error fetching sale" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const data = await request.json()

    // Get the original sale
    const originalSale = await db.collection("sales").findOne({ _id: new ObjectId(params.id) })
    if (!originalSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // If quantity is being updated, adjust inventory accordingly
    if (data.quantity !== originalSale.quantity || data.item !== originalSale.item) {
      // Restore original quantity to original item
      await db
        .collection("inventory")
        .updateOne({ name: originalSale.item }, { $inc: { quantity: originalSale.quantity } })

      // Deduct new quantity from new/same item
      const inventory = await db.collection("inventory").findOne({ name: data.item })
      if (!inventory) {
        return NextResponse.json({ error: "Item not found in inventory" }, { status: 404 })
      }

      if (inventory.quantity < data.quantity) {
        return NextResponse.json({ error: "Insufficient inventory quantity" }, { status: 400 })
      }

      await db.collection("inventory").updateOne({ name: data.item }, { $inc: { quantity: -data.quantity } })
    }

    const result = await db.collection("sales").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...data,
          date: new Date(data.date).toISOString(),
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sale updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Error updating sale" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()

    // Get the sale before deleting
    const sale = await db.collection("sales").findOne({ _id: new ObjectId(params.id) })
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Restore quantity to inventory
    await db.collection("inventory").updateOne({ name: sale.item }, { $inc: { quantity: sale.quantity } })

    // Delete the sale
    const result = await db.collection("sales").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Sale deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Error deleting sale" }, { status: 500 })
  }
}

