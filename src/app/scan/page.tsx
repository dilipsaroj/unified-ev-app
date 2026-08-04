'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

function ScanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { warning } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  const stationId = searchParams.get('stationId');

  useEffect(() => {
    if (!stationId) return;

    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable:', err);
        setCameraError(true);
        warning('Camera unavailable. Continuing with demo mode.');
      }
    };

    initCamera();

    const timer = setTimeout(() => {
      setShowPaymentSheet(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stationId, warning]);

  const handleCancel = () => {
    router.back();
  };

  if (!stationId) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 px-6"
        style={{ background: 'var(--color-bg)', paddingBottom: 80 }}
      >
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--color-ink-2)',
            textAlign: 'center',
            maxWidth: 280,
          }}
        >
          Tap a station on the map, then choose Scan to Charge.
        </p>
        <Link
          href="/map"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            background: 'var(--color-brand-500)',
            color: 'white',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Open map
        </Link>
      </div>
    );
  }

  if (showPaymentSheet) {
    router.push(`/scan/payment?stationId=${stationId}`);
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        onClick={handleCancel}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          background: 'rgba(0, 0, 0, 0.5)',
          border: 'none',
          borderRadius: '50%',
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        <X size={20} color="white" />
      </button>

      {!cameraError ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
            Camera preview disabled
          </div>
        </div>
      )}

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            marginBottom: 32,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 600, color: 'white', textAlign: 'center' }}>
            Point at the QR on the charger
          </div>
          <div
            style={{
              fontSize: 14,
              color: 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
            }}
          >
            Auto-detects and starts charging
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 250,
              height: 250,
              border: '3px solid rgba(52, 229, 161, 0.6)',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent, #34E5A1, transparent)',
                animation: 'scan 2s ease-in-out infinite',
                boxShadow: '0 0 10px #34E5A1',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: -2,
                left: -2,
                width: 20,
                height: 20,
                borderTop: '4px solid #34E5A1',
                borderLeft: '4px solid #34E5A1',
                borderRadius: '16px 0 0 0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 20,
                height: 20,
                borderTop: '4px solid #34E5A1',
                borderRight: '4px solid #34E5A1',
                borderRadius: '0 16px 0 0',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                left: -2,
                width: 20,
                height: 20,
                borderBottom: '4px solid #34E5A1',
                borderLeft: '4px solid #34E5A1',
                borderRadius: '0 0 0 16px',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 20,
                height: 20,
                borderBottom: '4px solid #34E5A1',
                borderRight: '4px solid #34E5A1',
                borderRadius: '0 0 16px 0',
              }}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            top: 0;
          }
          50% {
            top: 100%;
          }
          100% {
            top: 0;
          }
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: 'white', fontSize: 15 }}>Loading...</div>
        </div>
      }
    >
      <ScanContent />
    </Suspense>
  );
}
