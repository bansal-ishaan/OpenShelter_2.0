import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { loanId, walletAddress, amount, paymentMethod, transactionHash } = body

    const client = await clientPromise
    const db = client.db("openshelter")
    const loansCollection = db.collection("loans")
    const paymentsCollection = db.collection("payments")

    // Get the loan details
    const loan = await loansCollection.findOne({ _id: new ObjectId(loanId) })
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 })
    }

    // Create payment record
    const payment = {
      loanId: new ObjectId(loanId),
      walletAddress,
      amount: Number(amount),
      paymentMethod,
      transactionHash,
      status: "completed",
      paidAt: new Date(),
      createdAt: new Date(),
    }

    const paymentResult = await paymentsCollection.insertOne(payment)

    // Update loan with payment
    const newRemainingBalance = loan.remainingBalance - Number(amount)
    const newPaymentsMade = loan.paymentsMade + 1

    const loanUpdate: any = {
      remainingBalance: Math.max(0, newRemainingBalance),
      paymentsMade: newPaymentsMade,
      updatedAt: new Date(),
    }

    // If loan is fully paid
    if (newRemainingBalance <= 0) {
      loanUpdate.status = "completed"
      loanUpdate.completedAt = new Date()
      loanUpdate.nextPaymentDue = null
    } else {
      // Set next payment due date (30 days from now)
      loanUpdate.nextPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }

    await loansCollection.updateOne({ _id: new ObjectId(loanId) }, { $set: loanUpdate })

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.insertedId,
      remainingBalance: loanUpdate.remainingBalance,
      message: "Payment processed successfully",
    })
  } catch (error) {
    console.error("Error processing payment:", error)
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
    const collection = db.collection("payments")

    const query: any = {}

    if (walletAddress) {
      query.walletAddress = walletAddress
    }

    if (loanId) {
      query.loanId = new ObjectId(loanId)
    }

    const payments = await collection.find(query).sort({ paidAt: -1 }).toArray()

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
