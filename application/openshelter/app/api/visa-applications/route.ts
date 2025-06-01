import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      dateOfBirth,
      nationality,
      passportNumber,
      destinationCountry,
      visaType,
      purposeOfTravel,
      plannedDuration,
      contactEmail,
      contactPhone,
      walletAddress,
      status = "pending",
    } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("visa_applications")

    // Generate application ID
    const applicationId = `VA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(3, "0")}`

    const application = {
      applicationId,
      fullName,
      dateOfBirth,
      nationality,
      passportNumber,
      destinationCountry,
      visaType,
      purposeOfTravel,
      plannedDuration,
      contactEmail,
      contactPhone,
      walletAddress,
      status,
      hasVisaSBT: false,
      documents: [],
      submittedAt: new Date(),
      updatedAt: new Date(),
      estimatedProcessingTime: "4-8 weeks",
      processingProgress: 0,
    }

    const result = await collection.insertOne(application)

    return NextResponse.json({
      success: true,
      applicationId,
      id: result.insertedId,
      message: "Visa application submitted successfully",
    })
  } catch (error) {
    console.error("Error creating visa application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const applicationId = searchParams.get("applicationId")

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("visa_applications")

    if (applicationId) {
      // Get specific application
      const application = await collection.findOne({ applicationId })
      if (!application) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 })
      }
      return NextResponse.json({ application })
    }

    if (walletAddress) {
      // Get all applications for a user
      const applications = await collection.find({ walletAddress }).sort({ submittedAt: -1 }).toArray()
      return NextResponse.json({ applications })
    }

    // Get all applications (admin view)
    const applications = await collection.find({}).sort({ submittedAt: -1 }).toArray()
    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching visa applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { applicationId, status, hasVisaSBT, processingProgress, transactionHash } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("visa_applications")

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status !== undefined) updateData.status = status
    if (hasVisaSBT !== undefined) updateData.hasVisaSBT = hasVisaSBT
    if (processingProgress !== undefined) updateData.processingProgress = processingProgress
    if (transactionHash !== undefined) updateData.transactionHash = transactionHash

    // Set appropriate timestamp based on status
    if (status === "approved") {
      updateData.approvedAt = new Date()
    } else if (status === "rejected") {
      updateData.rejectedAt = new Date()
    }

    const result = await collection.updateOne({ applicationId }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
    })
  } catch (error) {
    console.error("Error updating visa application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
