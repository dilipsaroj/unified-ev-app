'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, CreditCard } from 'lucide-react';
import type { Station, Connector } from '@/lib/data/types';

interface PaymentSheetProps {
  station: Station;
  connector: Connector;
  onApprove: (method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET') => void;
  onCancel: () => void;
}

type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export default function PaymentSheet({ station, connector, onApprove, onCancel }: PaymentSheetProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
  const [expanded, setExpanded] = useState(false);

  const holdAmount = 500;
  const estimatedEnergy = 20;
  const energyCost = 493;
  const platformFee = 7;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 40,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onCancel}
      />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-bg)',
          borderRadius: '24px 24px 0 0',
          zIndex: 50,
          animation: 'slideUp 0.3s ease-out',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: 'var(--color-border)',
            borderRadius: 2,
            margin: '12px auto 8px',
          }}
        />

        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
            Confirm charging session
          </h2>
          <button
            onClick={onCancel}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 4,
              color: 'var(--color-ink-3)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--color-ink-2)', lineHeight: 1.5 }}>
            {station.cpo?.name} · {station.name.split(' · ')[1] || station.name} · Connector{' '}
            {connector.identifier} · {connector.maxPowerKw} kW {connector.type.replace(/_/g, ' ')}
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--color-ink-2)' }}>Hold amount</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-ink)' }}>
                ₹{holdAmount}
              </div>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--color-brand-500)',
                padding: 0,
                fontWeight: 500,
              }}
            >
              {expanded ? 'Hide' : 'Show'} breakdown
            </button>

            {expanded && (
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border)',
                  fontSize: 13,
                  color: 'var(--color-ink-2)',
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>~₹{energyCost} for {estimatedEnergy} kWh</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Platform fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTop: '1px solid var(--color-border)',
                    fontSize: 12,
                    color: 'var(--color-ink-3)',
                  }}
                >
                  Final charge based on actual usage. Excess refunded instantly.
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--color-ink)' }}>
              Payment method
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSelectedMethod('UPI')}
                className={`rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  selectedMethod === 'UPI'
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-neutral-border bg-neutral-surface text-neutral-ink'
                }`}
              >
                UPI
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('CARD')}
                className={`rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  selectedMethod === 'CARD'
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-neutral-border bg-neutral-surface text-neutral-ink'
                }`}
              >
                Card (Visa / Mastercard / RuPay)
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethod('NETBANKING')}
                className={`rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  selectedMethod === 'NETBANKING'
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-neutral-border bg-neutral-surface text-neutral-ink'
                }`}
              >
                Netbanking
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-md border border-neutral-border bg-neutral-surface-2 px-4 py-3 text-left text-sm font-medium text-neutral-ink-4 opacity-60"
              >
                Wallets (coming soon)
              </button>
            </div>

            {selectedMethod === 'UPI' && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 8 }}>
                  UPI ID
                </div>
                <input
                  type="text"
                  defaultValue="rohan@ybl"
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--color-surface-2)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--color-ink)',
                  }}
                />
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    color: 'var(--color-ink-2)',
                    fontSize: 13,
                  }}
                >
                  QR code placeholder
                </div>
              </div>
            )}

            {selectedMethod === 'CARD' && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-ink-3">Accepted</span>
                  <Image
                    src="/payment-methods/rupay.svg"
                    alt="RuPay"
                    width={56}
                    height={18}
                    className="h-[18px] w-auto"
                  />
                  <span className="text-xs text-neutral-ink-3">Visa · Mastercard</span>
                </div>
                <button
                  style={{
                    padding: '14px',
                    background: 'var(--color-surface-2)',
                    border: '1px dashed var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--color-ink-2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <CreditCard size={18} />
                  Add new card
                </button>
                <div
                  style={{
                    padding: '14px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 14,
                    color: 'var(--color-ink-2)',
                  }}
                >
                  Use saved card ending 4242
                </div>
              </div>
            )}

            {selectedMethod === 'NETBANKING' && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontSize: 13, color: 'var(--color-ink-2)', marginBottom: 12 }}>
                  Select your bank
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                    <button
                      key={bank}
                      style={{
                        padding: '16px 8px',
                        background: 'var(--color-surface-2)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 13,
                        fontWeight: 500,
                        color: 'var(--color-ink)',
                        cursor: 'pointer',
                      }}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMethod === 'WALLET' && (
              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--color-ink-3)',
                  fontSize: 14,
                }}
              >
                Coming soon
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-4)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <button
            onClick={() => onApprove(selectedMethod)}
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
            }}
          >
            Approve ₹{holdAmount} hold
          </button>
          <button
            onClick={onCancel}
            style={{
              width: '100%',
              height: 44,
              background: 'transparent',
              color: 'var(--color-ink-2)',
              border: 'none',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
