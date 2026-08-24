#!/usr/bin/env node
/**
 * Hits payment + session APIs on a running Next server.
 * Usage: node scripts/test-payment-flow.mjs [baseUrl]
 */
import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const BASE = process.argv[2] || 'http://localhost:3010'
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'test_hmac_secret'
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'whsec_test'
const PHONE = '+919876501234'

const prisma = new PrismaClient()
const results = []

function hmac(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

async function req(method, path, { body, cookie, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text.slice(0, 200) }
  }
  return { status: res.status, json, setCookie: res.headers.get('set-cookie') }
}

function assert(name, cond, extra) {
  results.push({ name, ok: !!cond, extra })
  if (!cond) console.error('FAIL', name, extra ?? '')
  else console.log('ok  ', name)
}

async function main() {
  // 1. Unauthenticated
  let r = await req('POST', '/api/payment/create-order', {
    body: { stationId: 'x', connectorId: 'y' },
  })
  assert('create-order unauth → 401', r.status === 401, r)

  r = await req('POST', '/api/payment/verify', {
    body: {
      razorpay_order_id: 'o',
      razorpay_payment_id: 'p',
      razorpay_signature: 's',
    },
  })
  assert('verify unauth → 401', r.status === 401, r)

  r = await req('GET', '/api/sessions/does-not-exist')
  assert('GET session unauth → 401', r.status === 401, r)

  r = await req('POST', '/api/payment/webhook', { body: {} })
  assert('webhook missing signature → 400', r.status === 400, r)

  const badWh = JSON.stringify({ event: 'payment.captured' })
  r = await req('POST', '/api/payment/webhook', {
    body: JSON.parse(badWh),
    headers: { 'x-razorpay-signature': 'deadbeef' },
  })
  // fetch JSON.stringify of object may not match what we signed — send raw via custom
  const rawFailed = '{"event":"payment.failed","payload":{"payment":{"entity":{"order_id":"order_none"}}}}'
  r = await fetch(`${BASE}/api/payment/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'not-a-valid-sig',
    },
    body: rawFailed,
  })
  assert('webhook wrong secret → 400', r.status === 400, { status: r.status })

  // 2. Login (dev OTP)
  r = await req('POST', '/api/auth/verify-otp', { body: { phone: PHONE, token: '1234' } })
  assert('verify-otp → 200', r.status === 200, r)
  const cookieMatch = r.setCookie?.match(/ev-auth-phone=([^;]+)/)
  const cookie = cookieMatch ? `ev-auth-phone=${cookieMatch[1]}` : `ev-auth-phone=${encodeURIComponent(PHONE)}`
  assert('auth cookie present', !!cookieMatch, r.setCookie)

  const connector = await prisma.connector.findFirst()
  assert('seeded connector exists', !!connector)
  if (!connector) throw new Error('no connector')

  r = await req('POST', '/api/payment/create-order', {
    cookie,
    body: {},
  })
  assert('create-order missing ids → 400', r.status === 400, r)

  r = await req('POST', '/api/payment/create-order', {
    cookie,
    body: { stationId: connector.stationId, connectorId: 'not-a-real-id' },
  })
  assert('create-order unknown connector → 404', r.status === 404, r)

  r = await req('POST', '/api/payment/create-order', {
    cookie,
    body: { stationId: connector.stationId, connectorId: connector.id },
  })
  // Dummy Razorpay keys should fail at the Razorpay API, not 401/400
  assert(
    'create-order dummy keys → 500 (Razorpay API)',
    r.status === 500 && typeof r.json.detail === 'string',
    r,
  )

  const user = await prisma.user.findUnique({ where: { phone: PHONE } })
  assert('user upserted', !!user)
  if (!user) throw new Error('no user')

  const orderId = `order_test_${Date.now()}`
  const paymentId = `pay_test_${Date.now()}`
  const payment = await prisma.payment.create({
    data: {
      razorpayOrderId: orderId,
      amount: 5000,
      userId: user.id,
      stationId: connector.stationId,
      connectorId: connector.id,
      status: 'CREATED',
    },
  })

  r = await req('POST', '/api/payment/verify', {
    cookie,
    body: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: 'tampered',
    },
  })
  assert('verify tampered signature → 400', r.status === 400, r)

  const sig = hmac(KEY_SECRET, `${orderId}|${paymentId}`)
  r = await req('POST', '/api/payment/verify', {
    cookie,
    body: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: sig,
    },
  })
  assert('verify valid signature → 200 + sessionId', r.status === 200 && !!r.json.sessionId, r)
  const sessionId = r.json.sessionId

  const dbSession = await prisma.session.findUnique({ where: { id: sessionId } })
  assert(
    'session status PAYMENT_AUTHORIZED',
    dbSession?.status === 'PAYMENT_AUTHORIZED',
    dbSession,
  )
  assert('session.paymentId linked', dbSession?.paymentId === payment.id, dbSession)

  r = await req('POST', '/api/payment/verify', {
    cookie,
    body: {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: sig,
    },
  })
  assert('verify idempotent same sessionId', r.status === 200 && r.json.sessionId === sessionId, r)

  r = await req('GET', `/api/sessions/${sessionId}`, { cookie })
  assert(
    'GET session shape',
    r.status === 200 &&
      r.json.id === sessionId &&
      r.json.stationId === connector.stationId &&
      r.json.connectorId === connector.id &&
      r.json.status === 'PAYMENT_AUTHORIZED' &&
      r.json.holdAmount === 50 &&
      r.json.currency === 'INR',
    r,
  )

  r = await req('GET', `/api/stations/${connector.stationId}`)
  assert(
    'GET station includes connector',
    r.status === 200 &&
      Array.isArray(r.json.connectors) &&
      r.json.connectors.some((c) => c.id === connector.id),
    { status: r.status, connectorCount: r.json.connectors?.length },
  )

  const otherPhone = '+919876509999'
  r = await req('POST', '/api/auth/verify-otp', {
    body: { phone: otherPhone, token: '1234' },
  })
  const otherCookieMatch = r.setCookie?.match(/ev-auth-phone=([^;]+)/)
  const otherCookie = otherCookieMatch
    ? `ev-auth-phone=${otherCookieMatch[1]}`
    : `ev-auth-phone=${encodeURIComponent(otherPhone)}`
  r = await req('GET', `/api/sessions/${sessionId}`, { cookie: otherCookie })
  assert('GET session other user → 403', r.status === 403, r)

  const capturedBody = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: { id: paymentId, order_id: orderId },
      },
    },
  })
  const whSig = hmac(WEBHOOK_SECRET, capturedBody)
  const whRes = await fetch(`${BASE}/api/payment/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': whSig,
    },
    body: capturedBody,
  })
  const whJson = await whRes.json()
  assert('webhook captured → 200', whRes.status === 200 && whJson.received === true, {
    status: whRes.status,
    whJson,
  })

  const captured = await prisma.payment.findUnique({ where: { id: payment.id } })
  assert('payment status CAPTURED', captured?.status === 'CAPTURED', captured)

  // cleanup test rows (keep users)
  await prisma.session.delete({ where: { id: sessionId } }).catch(() => {})
  await prisma.payment.delete({ where: { id: payment.id } }).catch(() => {})

  const failed = results.filter((x) => !x.ok)
  console.log('\n' + results.length + ' checks, ' + failed.length + ' failed')
  if (failed.length) process.exitCode = 1
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
