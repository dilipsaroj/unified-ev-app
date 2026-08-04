'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserStore } from '@/stores/userStore';
import { dataClient } from '@/lib/data';
import { useSessionSim } from '@/hooks/useSessionSim';
import { getShortSessionId } from '@/lib/utils/session';
import SocDial from '@/components/session/SocDial';
import type { Station, Connector } from '@/lib/data/types';

interface Props {
  params: { id: string };
}

const DEMO_START_SOC = 40;
const SIMULATION_DURATION_SEC = 90;

export default function SessionPage({ params }: Props) {
  const router = useRouter();
  const { activeSession, updateActiveSession, stopSession } = useSessionStore();
  const { currentVehicle } = useUserStore();
  
  const [station, setStation] = useState<Station | null>(null);
  const [connector, setConnector] = useState<Connector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStopping, setIsStopping] = useState(false);

  const vehicle = currentVehicle || {
    id: 'tata-nexon-ev-max',
    make: 'Tata',
    model: 'Nexon EV Max',
    vehicleClass: 'FOUR_WHEELER' as const,
    batteryKwh: 40.5,
    connectorType: 'CCS_2' as const,
    avgConsumptionWhPerKm: 150,
    maxChargeRateKw: 50,
    preferredChargeToPct: 80,
  };

  const targetSoc = vehicle.preferredChargeToPct || 80;

  useEffect(() => {
    const loadData = async () => {
      if (!activeSession) {
        router.push('/map');
        return;
      }

      try {
        const [stationData, connectorStatus] = await Promise.all([
          dataClient.getStation(activeSession.stationId),
          dataClient.getConnectorStatus(activeSession.connectorId),
        ]);

        if (!stationData) {
          router.push('/map');
          return;
        }

        const connectorData = stationData.connectors?.find(
          (c) => c.id === activeSession.connectorId
        );

        if (!connectorData) {
          router.push('/map');
          return;
        }

        setStation(stationData);
        setConnector(connectorData);

        if (activeSession.status === 'PAYMENT_AUTHORIZED' || activeSession.status === 'STARTING') {
          updateActiveSession({ status: 'ACTIVE' });
        }
      } catch (err) {
        console.error('Failed to load session data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeSession, router, updateActiveSession]);

  useSessionSim({
    vehicle,
    connector: connector || { maxPowerKw: 50, pricePerKwh: 18.5 } as Connector,
    startSoc: DEMO_START_SOC,
    targetSoc,
    totalDurationSec: SIMULATION_DURATION_SEC,
  });

  const handleStop = async () => {
    if (!activeSession || isStopping) return;

    setIsStopping(true);
    try {
      await stopSession(activeSession.id);
      router.push(`/session/${activeSession.id}/complete`);
    } catch (err) {
      console.error('Failed to stop session:', err);
      setIsStopping(false);
    }
  };

  if (isLoading || !activeSession || !station || !connector) {
    return (
      <div
        data-theme="dark"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0A0F1C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.5)' }}>Loading session...</div>
      </div>
    );
  }

  const currentSoc = activeSession.currentSoc || DEMO_START_SOC;
  const energyKwh = activeSession.energyKwh || 0;
  const costAccrued = activeSession.costAccrued || 0;
  const powerKw = activeSession.currentPowerKw || connector.maxPowerKw;
  const durationMins = activeSession.durationMins || 0;

  const socRemaining = targetSoc - currentSoc;
  const etaMins = socRemaining > 0 ? Math.round((socRemaining / (targetSoc - DEMO_START_SOC)) * (SIMULATION_DURATION_SEC / 60)) : 0;

  return (
    <div
      data-theme="dark"
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0F1C',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#34E5A1',
              animation: 'pulse 1.6s ease-out infinite',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#34E5A1', letterSpacing: '0.05em' }}>
            LIVE · CHARGING
          </span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255, 255, 255, 0.6)' }}>
          {getShortSessionId(activeSession.id)}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-6)',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
            {station.cpo?.name} · {station.name.split(' · ')[1] || station.name}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.5)' }}>
            Connector {connector.identifier} · {connector.type.replace(/_/g, ' ')} · {connector.maxPowerKw} kW
          </div>
        </div>

        <SocDial currentSoc={currentSoc} startSoc={DEMO_START_SOC} targetSoc={targetSoc} />

        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-4)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#fff',
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {energyKwh.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              kWh Delivered
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#fff',
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              ₹{Math.round(costAccrued)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Cost
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#fff',
                fontFeatureSettings: '"tnum" 1',
              }}
            >
              {powerKw.toFixed(1)}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'rgba(255, 255, 255, 0.5)',
                marginTop: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              kW Power
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
          }}
        >
          {Math.round(durationMins)} min elapsed · ~{etaMins} min to {targetSoc}%
        </div>
      </div>

      <div
        style={{
          padding: 'var(--space-4)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        <button
          onClick={handleStop}
          disabled={isStopping}
          style={{
            width: '100%',
            height: 56,
            background: isStopping ? 'rgba(239, 68, 68, 0.5)' : '#EF4444',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: 16,
            fontWeight: 600,
            cursor: isStopping ? 'not-allowed' : 'pointer',
            opacity: isStopping ? 0.6 : 1,
          }}
        >
          {isStopping ? 'Stopping...' : 'Stop charging'}
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(0.95);
          }
        }
      `}</style>
    </div>
  );
}
