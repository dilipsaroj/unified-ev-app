# Charging Session Refund Policy

**Effective date:** [To be finalized before Layer 2 payment launch]
**Version:** Draft 1.0 (V1 prototype)

> ⚠️ This is a working draft. It will be reviewed and finalized by legal counsel before Unified-EV processes real payments in production. If you're reading this in the V1 demo, actual payments are mocked and refunds do not apply.

## When you get a refund automatically

You get a full refund of any unused hold (and any wrongly captured charge) when:

- The session **failed to start** after payment was authorized — for example, the charger never unlocked or never began delivering power.
- The **charger cut off mid-session** because of a fault on our side or the CPO's side (not because you stopped it).
- The session lasted **less than 2 minutes** and delivered **less than 0.1 kWh**.
- Payment was authorized but the session **never began within 5 minutes**.

In these cases you should not need to do anything. The unused amount returns to your original payment method.

## When you don't get a refund

You are billed for energy already delivered when:

- You **stopped charging yourself** after more than 5 minutes of a working session.
- You **disconnected the cable early** — any charge already delivered is billed; only the unused part of the hold is released.
- You **no-showed** on a reservation after the grace period ended (reservation holds, when live, follow the same rule).

Stopping early does not wipe the bill for power you already used. That is intentional — the CPO delivered that energy.

## How refunds work

- Refunds go back to the **same payment method** you used (UPI, card, or netbanking).
- In most cases the unused hold is released within **2 hours**. Card refunds can take up to **5 business days** to show on your statement.
- Refunds are processed by **Razorpay** on our behalf. You will get an in-app notification when a refund is processed.
- Your final charge will never exceed the amount you pre-authorized before the session started.

## What to do if a refund doesn't arrive

1. Check your UPI app or bank statement — card refunds can take a few business days.
2. Note your **session ID** (shown on the session receipt and in your history).
3. Message us on WhatsApp from **Profile → Help & Support** and include that session ID.

We will look up the session and tell you where the refund stands.

## Disputes

You have **7 days** from the end of a session to raise a dispute (wrong amount, session marked complete when it failed, etc.).

We review disputes within **3 business days**. If we agree, we reverse or adjust the charge. If we need more detail, we will ask you on WhatsApp.

## Session pricing transparency

Before you start charging, the app shows the exact ₹ breakdown:

- Energy cost = kWh delivered × price per kWh
- Platform fee (shown separately)
- Total hold amount (the maximum that can be captured)

The **final charge cannot exceed the pre-authorized hold**. If you use less energy than the hold covers, the difference is refunded automatically.

---

Questions? WhatsApp us: [Profile → Help & Support](/profile)
