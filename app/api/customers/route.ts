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
    const customers = await db.collection("customers").find({}).toArray()

    return NextResponse.json(customers)
  } catch (error: unknown) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error fetching customers" }, { status: 500 })
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

    const newCustomer = {
      ...data,
      userId: session.user.id,
      createdAt: new Date(),
    }

    const result = await db.collection("customers").insertOne(newCustomer)
    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error adding customer" }, { status: 500 })
  }
}

