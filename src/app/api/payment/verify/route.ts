import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'order_id, payment_id, and signature required' },
        { status: 400 },
      )
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { session: true },
    })

    if (!payment) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (payment.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (payment.session) {
      return NextResponse.json({ sessionId: payment.session.id })
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        status: 'CAPTURED',
      },
    })

    try {
      const session = await prisma.session.create({
        data: {
          userId: user.id,
          connectorId: updated.connectorId,
          paymentId: updated.id,
          startedAt: new Date(),
          status: 'PAYMENT_AUTHORIZED',
        },
      })
      return NextResponse.json({ sessionId: session.id })
    } catch (createErr: unknown) {
      const code =
        createErr && typeof createErr === 'object' && 'code' in createErr
          ? (createErr as { code?: string }).code
          : undefined
      if (code === 'P2002') {
        const existing = await prisma.payment.findUnique({
          where: { id: updated.id },
          include: { session: true },
        })
        if (existing?.session) {
          return NextResponse.json({ sessionId: existing.session.id })
        }
      }
      throw createErr
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/payment/verify:', message)
    return NextResponse.json(
      { error: 'Payment verification failed', detail: message },
      { status: 500 },
    )
  }
}
