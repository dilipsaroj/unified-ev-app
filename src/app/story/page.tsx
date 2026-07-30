'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function StoryPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Header */}
      <div
        className="flex items-center px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <button
          onClick={() => router.back()}
          style={{ color: 'var(--color-ink)' }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Hero section */}
          <div className="mb-8">
            <div
              style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'var(--color-brand-50)',
                color: 'var(--color-brand-900)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Our Story
            </div>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
              marginBottom: 16,
            }}
          >
            Why We&apos;re Building Unified-EV
          </h1>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.6,
                color: 'var(--color-ink-2)',
              }}
            >
              The problem isn&apos;t technology. It&apos;s fragmentation.
            </p>
          </div>

          {/* Story content */}
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: 'var(--color-ink)',
            }}
          >
            <p style={{ marginBottom: 24 }}>
              Dilip owned an EV for a single day. During that trip he encountered three separate CPO
              networks — Indian Oil, HPCL, Bharat Petroleum — and each one required:
            </p>

            <ol
              style={{
                marginBottom: 24,
                marginLeft: 24,
                color: 'var(--color-ink-2)',
              }}
            >
              <li style={{ marginBottom: 8 }}>Download the CPO&apos;s own app</li>
              <li style={{ marginBottom: 8 }}>Create an account, verify phone</li>
              <li style={{ marginBottom: 8 }}>Set up a payment method or top up a prepaid wallet</li>
              <li style={{ marginBottom: 8 }}>Find the specific dock, choose a slot</li>
              <li style={{ marginBottom: 8 }}>Charge</li>
            </ol>

            <p style={{ marginBottom: 24 }}>
              Then repeat at the next stop. There was no universal way to just plug in and pay.
              Google Maps showed the pins but had no way to actually initiate a session. He couldn&apos;t
              tell before arriving whether the charger even worked.
            </p>

            <p style={{ marginBottom: 24 }}>
              This origin is not a pitch invention — it is the actual customer problem, experienced
              first-hand, that motivated the product.
            </p>

            {/* Divider */}
            <div
              style={{
                width: 60,
                height: 4,
                background: 'var(--color-brand-500)',
                borderRadius: 2,
                margin: '40px 0',
              }}
            />

            {/* The insight */}
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--color-ink)',
                marginBottom: 16,
              }}
            >
              The Core Insight
            </h2>

            <p style={{ marginBottom: 24 }}>
              Ask any Indian EV owner what they hate more: opening a second app, or driving 15 km to
              a &ldquo;working&rdquo; charger that&apos;s broken. It&apos;s always the second.
            </p>

            <p style={{ marginBottom: 24 }}>
              Charger reliability — will this actually charge my car when I get there — is the
              single biggest blocker to EV adoption in India today. And no CPO has any incentive to
              publish honest reliability data about their own network.
            </p>

            <p
              style={{
                padding: 24,
                background: 'var(--color-brand-50)',
                border: '2px solid var(--color-brand-500)',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-brand-900)',
                marginBottom: 24,
              }}
            >
              Only a neutral, cross-CPO platform can.
            </p>

            <p style={{ marginBottom: 24 }}>
              If Unified-EV becomes the trusted answer to &ldquo;will this charger work?&rdquo;, the unified
              experience is just the delivery mechanism. Reliability data is what compounds — more
              users → more sessions → better reliability data → more users.
            </p>

            <p style={{ marginBottom: 24, fontWeight: 600, color: 'var(--color-ink)' }}>
              Classic network effect on a data asset, not a marketplace asset.
            </p>

            {/* Divider */}
            <div
              style={{
                width: 60,
                height: 4,
                background: 'var(--color-brand-500)',
                borderRadius: 2,
                margin: '40px 0',
              }}
            />

            {/* What we're building */}
            <h2
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--color-ink)',
                marginBottom: 16,
              }}
            >
              What We&apos;re Building
            </h2>

            <p style={{ marginBottom: 24 }}>
              An Indian EV driver installs one app. They see every charger in the country on one map
              — Tata Power, Jio-bp, Statiq, HPCL, Indian Oil, Bharat Petroleum — colored by how
              reliable that specific charger has been in the last 30 days.
            </p>

            <p style={{ marginBottom: 24 }}>
              They tap the closest reliable one, scan the QR at the station, approve one payment
              through their preferred method — UPI, card, or netbanking — and plug in.
            </p>

            <p style={{ marginBottom: 24 }}>
              No prepaid wallets. No minimum top-ups. No proprietary balances trapped in one CPO&apos;s
              app.
            </p>

            <p style={{ marginBottom: 24 }}>
              When the car is done, the exact ₹ is captured from their bank account and any
              remainder refunded immediately. Every session builds a personal Charging Passport —
              history, kWh, ₹ spent, CO₂ saved — that lives with them across every charger and
              every network.
            </p>

            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-brand-500)',
                marginTop: 40,
              }}
            >
              One app. Every charger. No prepaid wallets. Reliability you can trust.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
