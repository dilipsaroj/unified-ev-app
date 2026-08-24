import Razorpay from 'razorpay'

let client: Razorpay | null = null

/** Lazy init so `pnpm build` succeeds before test keys are in `.env.local`. */
export function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set')
  }

  if (!client) {
    client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })
  }

  return client
}
