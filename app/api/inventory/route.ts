import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

interface ErrorResponse {
  message: string
  code?: string
  stack?: string
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db()
    const items = await db.collection("inventory").find({}).toArray()

    return NextResponse.json(items)
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error(errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error fetching inventory items" }, { status: 500 })
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

    const newItem = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
    }

    const result = await db.collection("inventory").insertOne(newItem)
    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    const errorResponse = error as ErrorResponse
    console.error(errorResponse)
    return NextResponse.json({ error: errorResponse.message || "Error adding inventory item" }, { status: 500 })
  }
}

