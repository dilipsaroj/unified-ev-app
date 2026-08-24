import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Signature is over the raw body. req.json() first would break verification.
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id
      const orderId = event.payload.payment.entity.order_id

      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          razorpayPaymentId: paymentId,
          status: 'CAPTURED',
        },
      })
    }

    if (event.event === 'payment.failed') {
      const orderId = event.payload.payment.entity.order_id

      await prisma.payment.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' },
      })
    }

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/payment/webhook:', message)
    return NextResponse.json(
      { error: 'Webhook handling failed', detail: message },
      { status: 500 },
    )
  }
}
