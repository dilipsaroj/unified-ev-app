'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { MapPin, Scan, Zap, CreditCard } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/map');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-between"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
        padding: 'var(--space-6)',
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8 max-w-md">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--color-brand-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={28} color="white" fill="white" />
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: 'var(--color-ink)',
                letterSpacing: '-0.01em',
              }}
            >
              Unified-EV
            </h1>
          </div>

          <div
            style={{
              padding: '6px 14px',
              background: 'var(--color-brand-50)',
              color: 'var(--color-brand-900)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            ONE APP · EVERY CHARGER
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center">
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              color: 'var(--color-ink)',
            }}
          >
            Know it works{' '}
            <span style={{ color: 'var(--color-brand-500)' }}>before you drive.</span>
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.5,
              color: 'var(--color-ink-2)',
              maxWidth: 420,
            }}
          >
            Every charger in India. One app. Real-time reliability across every network. No prepaid wallets.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 w-full">
          {[
            { icon: MapPin, label: 'Find' },
            { icon: Scan, label: 'Scan' },
            { icon: Zap, label: 'Charge' },
            { icon: CreditCard, label: 'Pay' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-surface-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={24} color="var(--color-brand-500)" />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--color-ink-2)',
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push('/onboarding')}
          style={{
            width: '100%',
            height: 52,
            background: 'var(--color-brand-500)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 100ms ease-out',
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Continue with phone number
        </button>
      </div>

      <div
        className="flex flex-col items-center gap-2 text-center"
        style={{
          fontSize: 11,
          color: 'var(--color-ink-3)',
          lineHeight: 1.6,
          maxWidth: 380,
        }}
      >
        <div>🏛️ FAME-II aligned · 🇮🇳 Made in India · 🔓 Built on OCPI 2.2.1 + Beckn</div>
        <button
          onClick={() => router.push('/story')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-brand-500)',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px 0',
            marginTop: 8,
          }}
        >
          Why we&apos;re building this →
        </button>
        <nav
          className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-neutral-ink-3"
          aria-label="Legal"
        >
          <Link href="/policies/refund" className="hover:text-brand-500">
            Refund Policy
          </Link>
          <span aria-hidden>·</span>
          <a href="#" className="pointer-events-none opacity-70" onClick={(e) => e.preventDefault()}>
            Privacy
          </a>
          <span aria-hidden>·</span>
          <a href="#" className="pointer-events-none opacity-70" onClick={(e) => e.preventDefault()}>
            Terms
          </a>
          <span aria-hidden>·</span>
          <span>© 2026 Unified-EV</span>
        </nav>
      </div>
    </div>
  );
}
