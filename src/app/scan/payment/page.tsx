'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dataClient } from '@/lib/data';
import { useUserStore } from '@/stores/userStore';
import { useSessionStore } from '@/stores/sessionStore';
import PaymentSheet from '@/components/payment/PaymentSheet';
import type { Station, Connector } from '@/lib/data/types';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useUserStore();
  const { setActiveSession } = useSessionStore();
  
  const [station, setStation] = useState<Station | null>(null);
  const [connector, setConnector] = useState<Connector | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const stationId = searchParams.get('stationId');

  useEffect(() => {
    if (!stationId) {
      router.push('/map');
      return;
    }

    const loadStation = async () => {
      try {
        const stationData = await dataClient.getStation(stationId);
        if (!stationData) {
          router.push('/map');
          return;
        }

        const availableConnector = stationData.connectors?.find((c) => c.status === 'AVAILABLE') || stationData.connectors?.[0];
        
        if (!availableConnector) {
          router.push('/map');
          return;
        }

        setStation(stationData);
        setConnector(availableConnector);
      } catch (err) {
        console.error('Failed to load station:', err);
        router.push('/map');
      } finally {
        setIsLoading(false);
      }
    };

    loadStation();
  }, [stationId, router]);

  const handleApprove = async (method: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET') => {
    if (!station || !connector || !currentUser) return;

    try {
      const session = await dataClient.initiateSession({
        userId: currentUser.id,
        connectorId: connector.id,
        stationId: station.id,
        cpoId: station.cpoId,
        paymentMethod: method,
        holdAmount: 500,
      });

      setActiveSession(session);
      
      router.push(`/session/${session.id}`);
    } catch (err) {
      console.error('Failed to initiate session:', err);
      alert('Failed to start session. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push(`/station/${stationId}`);
  };

  if (isLoading || !station || !connector) {
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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--color-bg)' }}>
      <PaymentSheet
        station={station}
        connector={connector}
        onApprove={handleApprove}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
