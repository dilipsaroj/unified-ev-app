'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { dataClient } from '@/lib/data';
import { useUserStore } from '@/stores/userStore';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const { login } = useUserStore();

  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!phone) {
      router.push('/onboarding');
      return;
    }

    inputRefs[0].current?.focus();

    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone, router]);

  const handleChange = async (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && index === 3) {
      await verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const verifyOtp = async (code: string) => {
    setIsLoading(true);
    try {
      const user = await dataClient.verifyOtp(`+91${phone}`, code);
      login(user);
      
      if (user.vehicleId) {
        router.push('/map');
      } else {
        router.push('/onboarding/vehicle');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setOtp(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    try {
      await dataClient.sendOtp(`+91${phone}`);
      setCountdown(30);
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const maskedPhone = phone.replace(/(\d{2})(\d{5})(\d{3})/, '$1XXX XX$3');

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
          href="/onboarding"
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
          Verify code
        </h1>
      </div>

      <div
        className="flex flex-1 flex-col justify-between"
        style={{ padding: 'var(--space-6)' }}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <p
              style={{
                fontSize: 15,
                color: 'var(--color-ink-2)',
                lineHeight: 1.5,
              }}
            >
              Enter the 4-digit code sent to{' '}
              <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                +91 {maskedPhone}
              </span>
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isLoading}
                  style={{
                    width: 56,
                    height: 64,
                    fontSize: 24,
                    fontWeight: 600,
                    textAlign: 'center',
                    color: 'var(--color-ink)',
                    background: 'var(--color-surface)',
                    border: `2px solid ${digit ? 'var(--color-brand-500)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    outline: 'none',
                    transition: 'border-color 150ms ease',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-brand-500)';
                  }}
                  onBlur={(e) => {
                    if (!digit) {
                      e.target.style.borderColor = 'var(--color-border)';
                    }
                  }}
                />
              ))}
            </div>

            <button
              onClick={handleResend}
              disabled={countdown > 0}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: countdown > 0 ? 'var(--color-ink-3)' : 'var(--color-brand-500)',
                background: 'transparent',
                border: 'none',
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                textAlign: 'center',
              }}
            >
              {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div
            style={{
              textAlign: 'center',
              fontSize: 14,
              color: 'var(--color-ink-3)',
            }}
          >
            Verifying...
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingOtpPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex flex-1 items-center justify-center"
          style={{ background: 'var(--color-bg)' }}
        >
          <div style={{ fontSize: 15, color: 'var(--color-ink-3)' }}>Loading...</div>
        </div>
      }
    >
      <OtpContent />
    </Suspense>
  );
}
