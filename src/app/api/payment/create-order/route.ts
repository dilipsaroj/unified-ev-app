import { NextRequest, NextResponse } from 'next/server'
import { getRazorpay } from '@/lib/razorpay'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PREAUTH_AMOUNT_PAISE = 5000 // ₹50 — display-only deposit in V1; not metered billing

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { stationId, connectorId } = await req.json()

    if (!stationId || !connectorId) {
      return NextResponse.json(
        { error: 'stationId and connectorId required' },
        { status: 400 },
      )
    }

    const connector = await prisma.connector.findFirst({
      where: { id: connectorId, stationId },
    })
    if (!connector) {
      return NextResponse.json({ error: 'Connector not found' }, { status: 404 })
    }

    const razorpay = getRazorpay()
    const order = await razorpay.orders.create({
      amount: PREAUTH_AMOUNT_PAISE,
      currency: 'INR',
      payment_capture: true,
      notes: {
        stationId,
        connectorId,
        userId: user.id,
      },
    })

    await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount: PREAUTH_AMOUNT_PAISE,
        userId: user.id,
        stationId,
        connectorId,
        status: 'CREATED',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err: unknown) {
    const message = serializeError(err)
    console.error('POST /api/payment/create-order:', message)
    if (message.includes('RAZORPAY_KEY')) {
      return NextResponse.json(
        { error: 'Payment not configured', detail: message },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'Could not create order', detail: message },
      { status: 500 },
    )
  }
}

function serializeError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object') {
    const nested = err as { error?: { description?: string; code?: string } }
    if (nested.error?.description) {
      return nested.error.code
        ? `${nested.error.code}: ${nested.error.description}`
        : nested.error.description
    }
    try {
      return JSON.stringify(err)
    } catch {
      return 'Unknown error'
    }
  }
  return 'Unknown error'
}
