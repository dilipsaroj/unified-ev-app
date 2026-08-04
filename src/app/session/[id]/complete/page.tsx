'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { dataClient } from '@/lib/data';
import { toCDR } from '@/lib/data/cdr';
import { useToast } from '@/hooks/useToast';
import { CheckCircle } from 'lucide-react';
import type { Connector, Session, Station, User } from '@/lib/data/types';

interface Props {
  params: { id: string };
}

type AnimationPhase = 'held' | 'capturing' | 'refunding' | 'settled';

const isDevEnv = process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev';

export default function SessionCompletePage(_props: Props) {
  const router = useRouter();
  const { activeSession, clearSession } = useSessionStore();
  const { currentUser } = useUserStore();
  const { success, error: showError } = useToast();

  const [phase, setPhase] = useState<AnimationPhase>('held');
  const [station, setStation] = useState<Station | null>(null);
  const [connector, setConnector] = useState<Connector | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const session = activeSession as Session | null;

  useEffect(() => {
    if (!session) {
      router.push('/map');
      return;
    }

    const loadStation = async () => {
      const stationData = await dataClient.getStation(session.stationId);
      setStation(stationData);
      const matched =
        stationData?.connectors?.find((c) => c.id === session.connectorId) ?? null;
      setConnector(matched);
    };

    loadStation();

    const timer1 = setTimeout(() => setPhase('capturing'), 1000);
    const timer2 = setTimeout(() => setPhase('refunding'), 1500);
    const timer3 = setTimeout(() => setPhase('settled'), 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [session, router]);

  const handleDownloadCdr = async () => {
    if (!session || !station || !connector) {
      showError('CDR export needs session, station, and connector.');
      return;
    }

    let user: User | null = currentUser;
    if (!user) {
      user = await dataClient.getCurrentUser();
    }
    if (!user) {
      showError('No user available for CDR export.');
      return;
    }

    try {
      const cdr = toCDR(session, station, connector, user);
      const blob = new Blob([JSON.stringify(cdr, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cdr_${session.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
      success('CDR downloaded.');
    } catch (err) {
      console.error('CDR export failed:', err);
      showError('Could not export CDR.');
    }
  };

  const handleSubmitReview = async () => {
    if (!session || !rating) return;

    setIsSubmitting(true);
    try {
      await dataClient.submitReview({
        sessionId: session.id,
        stationId: session.stationId,
        userId: session.userId,
        rating,
        text: reviewText.trim() || undefined,
      });
      success('Thanks for the review.');
      setReviewSubmitted(true);
    } catch (err) {
      console.error('Failed to submit review:', err);
      showError('Could not submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipReview = () => {
    clearSession();
    router.push('/map');
  };

  if (!session || !station) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 15, color: 'var(--color-ink-3)' }}>Loading...</div>
      </div>
    );
  }

  const holdAmount = session.holdAmount;
  const capturedAmount = session.capturedAmount;
  const refundAmount = session.refundAmount;
  const energyKwh = session.energyKwh;
  const durationMins = session.durationMins;
  const costAccrued = session.costAccrued;
  const platformFee = session.platformFee;

  const co2SavedKg = Math.round(energyKwh * 1.3);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--color-bg)',
        color: 'var(--color-ink)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {phase !== 'settled' && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-6)',
          }}
        >
          {phase === 'held' && (
            <>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  fontFeatureSettings: '"tnum" 1',
                }}
              >
                ₹{holdAmount}
              </div>
              <div style={{ fontSize: 15, color: 'var(--color-ink-2)' }}>Held</div>
              <div style={{ fontSize: 14, color: 'var(--color-ink-3)' }}>
                Processing settlement...
              </div>
            </>
          )}

          {phase === 'capturing' && (
            <>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: 'var(--color-brand-500)',
                  fontFeatureSettings: '"tnum" 1',
                  animation: 'countDown 0.5s ease-out',
                }}
              >
                ₹{capturedAmount}
              </div>
              <div style={{ fontSize: 15, color: 'var(--color-ink-2)' }}>
                Captured ₹{capturedAmount}
              </div>
            </>
          )}

          {phase === 'refunding' && (
            <>
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: 'var(--color-success)',
                  fontFeatureSettings: '"tnum" 1',
                  animation: 'fadeIn 0.3s ease-out',
                }}
              >
                ₹{refundAmount}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 15,
                  color: 'var(--color-ink-2)',
                }}
              >
                <CheckCircle size={20} color="var(--color-success)" />
                Refunded to your {session.paymentMethod}
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'settled' && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            animation: 'slideUp 0.4s ease-out',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div
              style={{
                padding: 'var(--space-5)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                    {station.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        padding: '2px 8px',
                        background: station.cpo?.chipColor,
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      {station.cpo?.name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
                      {new Date(session.endedAt || '').toLocaleString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                  paddingBottom: 'var(--space-4)',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {energyKwh.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    kWh
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {Math.round(durationMins)}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    minutes
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: 'var(--color-ink)',
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    ₹{capturedAmount}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    total
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Energy</span>
                  <span style={{ fontFeatureSettings: '"tnum" 1' }}>₹{costAccrued.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform fee</span>
                  <span style={{ fontFeatureSettings: '"tnum" 1' }}>₹{platformFee}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid var(--color-border)',
                    fontWeight: 600,
                  }}
                >
                  <span>Total</span>
                  <span style={{ fontFeatureSettings: '"tnum" 1' }}>₹{capturedAmount}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: '10px 14px',
                  background: 'rgba(52, 229, 161, 0.1)',
                  border: '1px solid rgba(52, 229, 161, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: 'var(--color-success)',
                  fontWeight: 500,
                }}
              >
                <span>🌱</span>
                {co2SavedKg} kg CO₂ saved vs petrol equivalent
              </div>
            </div>

            {!reviewSubmitted && (
            <div
              style={{
                padding: 'var(--space-5)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                How was this charger?
              </h3>

              <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-4)' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 32,
                      padding: 0,
                      color: star <= rating ? '#F59E0B' : 'var(--color-border)',
                      transition: 'color 0.2s',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Anything worth noting? (optional)"
                style={{
                  width: '100%',
                  minHeight: 80,
                  padding: '12px',
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  color: 'var(--color-ink)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />

              <button
                onClick={handleSubmitReview}
                disabled={!rating || isSubmitting}
                style={{
                  width: '100%',
                  height: 48,
                  marginTop: 'var(--space-3)',
                  background: !rating ? 'var(--color-surface-2)' : 'var(--color-brand-500)',
                  color: !rating ? 'var(--color-ink-3)' : 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: !rating ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>

              <button
                onClick={handleSkipReview}
                style={{
                  width: '100%',
                  marginTop: 12,
                  background: 'transparent',
                  color: 'var(--color-ink-3)',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '8px',
                }}
              >
                Skip
              </button>
            </div>
            )}

            {isDevEnv && (
              <button
                type="button"
                onClick={handleDownloadCdr}
                className="w-full h-[48px] rounded-lg border border-neutral-border bg-neutral-surface-2 text-sm font-semibold text-neutral-ink-2"
              >
                Download CDR
              </button>
            )}

            <button
              onClick={() => {
                clearSession();
                router.push('/map');
              }}
              style={{
                width: '100%',
                height: 52,
                background: 'var(--color-brand-500)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: 'var(--space-6)',
              }}
            >
              Back to Map
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes countDown {
          from {
            transform: scale(1.2);
            opacity: 0.5;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
