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

/** Spec: peek 30% / half 60% / full 95% of the map area above the bottom nav */
const SNAP_HEIGHTS: Record<SnapPoint, string> = {
  peek: '30%',
  half: '60%',
  full: '95%',
};

const SNAP_ORDER: SnapPoint[] = ['peek', 'half', 'full'];

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
    const idx = SNAP_ORDER.indexOf(snap);

    if (velocity < -200 || offset < -60) {
      // Drag up → expand
      setSnap(SNAP_ORDER[Math.min(idx + 1, SNAP_ORDER.length - 1)]);
    } else if (velocity > 200 || offset > 60) {
      // Drag down → collapse
      setSnap(SNAP_ORDER[Math.max(idx - 1, 0)]);
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
      className="absolute inset-x-0 z-40 flex flex-col overflow-hidden rounded-t-3xl shadow-lg"
      style={{
        bottom: 64, // above bottom nav
        background: 'var(--color-surface)',
        maxHeight: 'calc(100% - 64px)',
      }}
    >
      {/* Drag handle — only this area starts sheet drag */}
      <div
        className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <div className="h-1 w-10 rounded-full bg-neutral-400" />
      </div>

      {/* Header */}
      <div
        className="flex shrink-0 cursor-grab touch-none items-center justify-between px-4 pb-3 active:cursor-grabbing"
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
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-6"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
        }}
      >
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full"
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
          <div className="py-12 text-center">
            <p style={{ fontSize: 14, color: 'var(--color-ink-3)' }}>
              No stations match the active filters.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
