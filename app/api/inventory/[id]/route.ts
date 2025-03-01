import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

interface ErrorResponse {
  message: string
  code?: string
  stack?: string
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const item = await db.collection("inventory").findOne({ _id: new ObjectId(params.id) })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json(item)
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error("Error fetching inventory item:", errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error fetching inventory item" }, { status: 500 })
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

    const result = await db.collection("inventory").updateOne({ _id: new ObjectId(params.id) }, { $set: data })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item updated successfully" })
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error("Error updating inventory item:", errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error updating inventory item" }, { status: 500 })
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
    const result = await db.collection("inventory").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Item deleted successfully" })
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error("Error deleting inventory item:", errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error deleting inventory item" }, { status: 500 })
  }
}

