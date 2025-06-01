import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, country, document, walletAddress, documentHash, transactionHash } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("users")

    // Check if user already exists
    const existingUser = await collection.findOne({
      $or: [{ email }, { walletAddress }],
    })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create new user
    const user = {
      name,
      email,
      phone,
      country,
      document,
      walletAddress,
      documentHash,
      transactionHash,
      verified: false,
      reputationScore: 0,
      hasVerificationSBT: false,
      hasVisaSBT: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(user)

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("users")

    const user = await collection.findOne({ walletAddress })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, verified, reputationScore } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("users")

    const updateData: any = { updatedAt: new Date() }
    if (verified !== undefined) updateData.verified = verified
    if (reputationScore !== undefined) updateData.reputationScore = reputationScore

    const result = await collection.updateOne({ walletAddress }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
