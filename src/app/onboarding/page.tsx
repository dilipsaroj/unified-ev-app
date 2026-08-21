'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { dataClient } from '@/lib/data';

/** Keep the 10-digit national number. Strips +91 / 91 / leading 0 from paste/autofill. */
function toNationalNumber(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length >= 12) {
    digits = digits.slice(-10);
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

export default function OnboardingPhonePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);

  const applyPhone = (raw: string) => {
    const next = toNationalNumber(raw);
    setPhone((prev) => (prev === next ? prev : next));
  };

  // Chrome/Safari autofill often paints a value without firing React onChange.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const syncFromDom = () => applyPhone(el.value);
    el.addEventListener('input', syncFromDom);
    el.addEventListener('change', syncFromDom);
    const interval = window.setInterval(syncFromDom, 200);
    const stop = window.setTimeout(() => window.clearInterval(interval), 4000);

    return () => {
      el.removeEventListener('input', syncFromDom);
      el.removeEventListener('change', syncFromDom);
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, []);

  const handleContinue = async () => {
    if (!isValid) return;
    
    setIsLoading(true);
    try {
      await dataClient.sendOtp(`+91${phone}`);
      router.push(`/onboarding/otp?phone=${phone}`);
    } catch (error) {
      console.error('Failed to send OTP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleContinue();
    }
  };

  return (
    <div
      className="flex flex-1 flex-col"
      style={{
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
      }}
    >
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--color-ink-2)',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={20} />
        </Link>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginLeft: 'var(--space-4)',
          }}
        >
          Sign in
        </h1>
      </div>

      <div
        className="flex flex-1 flex-col justify-between"
        style={{ padding: 'var(--space-6)' }}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="phone"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-ink-2)',
              }}
            >
              Phone number
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 'var(--space-4)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'var(--color-ink-2)',
                }}
              >
                +91
              </span>
              <input
                ref={inputRef}
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={16}
                value={phone}
                onChange={(e) => applyPhone(e.target.value)}
                onBlur={(e) => applyPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="9876543210"
                autoFocus
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: 400,
                  color: 'var(--color-ink)',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                }}
              />
            </div>
            <p
              style={{
                fontSize: 13,
                color: 'var(--color-ink-3)',
                lineHeight: 1.5,
              }}
            >
              We&apos;ll send a 4-digit code to verify your number
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!isValid || isLoading}
          style={{
            width: '100%',
            height: 52,
            background: isValid && !isLoading ? 'var(--color-brand-500)' : 'var(--color-surface-3)',
            color: isValid && !isLoading ? 'white' : 'var(--color-ink-4)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: isValid && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'transform 100ms ease-out',
          }}
          onMouseDown={(e) => {
            if (isValid && !isLoading) {
              e.currentTarget.style.transform = 'scale(0.98)';
            }
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isLoading ? 'Sending...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
