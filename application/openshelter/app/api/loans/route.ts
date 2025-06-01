import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, amount, termMonths, purpose, interestRate = 3.5, transactionHash } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("loans")

    // Calculate monthly payment
    const monthlyPayment = (amount * (1 + interestRate / 100)) / termMonths

    const loan = {
      walletAddress,
      amount: Number(amount),
      termMonths: Number(termMonths),
      purpose,
      interestRate,
      monthlyPayment,
      totalRepayment: monthlyPayment * termMonths,
      status: "pending", // pending, approved, disbursed, completed, defaulted
      transactionHash,
      appliedAt: new Date(),
      approvedAt: null,
      disbursedAt: null,
      completedAt: null,
      remainingBalance: amount * (1 + interestRate / 100),
      paymentsMade: 0,
      nextPaymentDue: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(loan)

    return NextResponse.json({
      success: true,
      loanId: result.insertedId,
      message: "Loan application submitted successfully",
    })
  } catch (error) {
    console.error("Error creating loan application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get("walletAddress")
    const loanId = searchParams.get("loanId")

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("loans")

    if (loanId) {
      // Get specific loan
      const loan = await collection.findOne({ _id: new ObjectId(loanId) })
      if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 })
      }
      return NextResponse.json({ loan })
    }

    if (walletAddress) {
      // Get all loans for a user
      const loans = await collection.find({ walletAddress }).sort({ createdAt: -1 }).toArray()

      return NextResponse.json({ loans })
    }

    // Get all loans (admin view)
    const loans = await collection.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ loans })
  } catch (error) {
    console.error("Error fetching loans:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { loanId, status, transactionHash } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const collection = db.collection("loans")

    const updateData: any = {
      status,
      updatedAt: new Date(),
    }

    if (transactionHash) {
      updateData.transactionHash = transactionHash
    }

    // Set appropriate timestamp based on status
    if (status === "approved") {
      updateData.approvedAt = new Date()
    } else if (status === "disbursed") {
      updateData.disbursedAt = new Date()
      // Set first payment due date (30 days from disbursement)
      updateData.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    } else if (status === "completed") {
      updateData.completedAt = new Date()
      updateData.remainingBalance = 0
    }

    const result = await collection.updateOne({ _id: new ObjectId(loanId) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Loan updated successfully",
    })
  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
