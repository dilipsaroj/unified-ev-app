'use client';

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import type { Vehicle, Connector } from '@/lib/data/types';

interface UseSessionSimParams {
  vehicle: Vehicle;
  connector: Connector;
  startSoc: number;
  targetSoc: number;
  totalDurationSec: number;
}

export function useSessionSim({
  vehicle,
  connector,
  startSoc,
  targetSoc,
  totalDurationSec,
}: UseSessionSimParams) {
  const { updateActiveSession, activeSession } = useSessionStore();
  const startTimeRef = useRef<number>(Date.now());
  const rafIdRef = useRef<number>();

  useEffect(() => {
    if (!activeSession || activeSession.status !== 'ACTIVE') {
      return;
    }

    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / totalDurationSec, 1);

      const currentSoc = startSoc + (targetSoc - startSoc) * progress;
      
      const socDelta = currentSoc - startSoc;
      const energyKwh = (socDelta / 100) * vehicle.batteryKwh;
      
      const jitter = 1 + (Math.random() * 0.02 - 0.01);
      const costAccrued = energyKwh * connector.pricePerKwh * jitter;
      
      const powerKw = connector.maxPowerKw * (0.95 + Math.sin(elapsed / 3) * 0.05);

      const durationMins = elapsed / 60;

      updateActiveSession({
        currentSoc: Math.round(currentSoc * 10) / 10,
        energyKwh: Math.round(energyKwh * 100) / 100,
        costAccrued: Math.round(costAccrued * 100) / 100,
        currentPowerKw: Math.round(powerKw * 10) / 10,
        durationMins: Math.round(durationMins * 10) / 10,
      });

      if (progress < 1) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    activeSession,
    vehicle.batteryKwh,
    connector.maxPowerKw,
    connector.pricePerKwh,
    startSoc,
    targetSoc,
    totalDurationSec,
    updateActiveSession,
  ]);
}
