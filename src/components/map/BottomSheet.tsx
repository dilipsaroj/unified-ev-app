'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, PanInfo, useDragControls } from 'framer-motion';
import type { Station } from '@/lib/data/types';
import { StationCard } from '@/components/station/StationCard';

type SnapPoint = 'peek' | 'half' | 'full';

interface Props {
  stations: Station[];
  loading: boolean;
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
}

const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '32vh',
  half: '58vh',
  full: '88vh',
};

export function BottomSheet({
  stations,
  loading,
  selectedStationId,
  onSelectStation,
}: Props) {
  const [snap, setSnap] = useState<SnapPoint>('peek');
  const listRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Pin tap on the map selects a station — snap sheet to half so the list is visible
  useEffect(() => {
    if (selectedStationId) setSnap('half');
  }, [selectedStationId]);

  // Reset list scroll when collapsing so peek always shows the top of the list
  useEffect(() => {
    if (snap === 'peek' && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [snap]);

  function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    if (velocity < -200 || offset < -60) {
      setSnap((s) => (s === 'peek' ? 'half' : 'full'));
    } else if (velocity > 200 || offset > 60) {
      setSnap((s) => (s === 'full' ? 'half' : 'peek'));
    }
  }

  const snapToHalf = () => setSnap('half');

  return (
    <motion.div
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.12}
      onDragEnd={onDragEnd}
      animate={{ height: SNAP_HEIGHTS[snap] }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed left-0 right-0 z-40 flex flex-col overflow-hidden"
      style={{
        bottom: 64, // above bottom nav
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      {/* Drag handle — only this area starts sheet drag */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing shrink-0 touch-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div
          className="rounded-full"
          style={{ width: 40, height: 4, background: 'var(--color-surface-3)' }}
        />
      </div>

      {/* Header */}
      <div
        className="px-4 pb-3 flex items-center justify-between shrink-0 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>
          <span style={{ color: 'var(--color-brand-500)' }}>Recommended</span>
          {' · '}
          <span style={{ color: 'var(--color-ink-2)', fontWeight: 400 }}>
            {loading ? 'Loading…' : `${stations.length} stations`}
          </span>
        </p>
      </div>

      {/* Station list — independently scrollable */}
      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6 flex flex-col gap-3"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          paddingLeft: 16,
          paddingRight: 16,
        }}
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="rounded-full animate-spin"
              style={{
                width: 28,
                height: 28,
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-brand-500)',
              }}
            />
          </div>
        )}
        {!loading &&
          stations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onClick={() => {
                onSelectStation(station.id);
                snapToHalf();
              }}
            />
          ))}
        {!loading && stations.length === 0 && (
          <div className="text-center py-12">
            <p style={{ fontSize: 14, color: 'var(--color-ink-3)' }}>
              No stations match the active filters.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
