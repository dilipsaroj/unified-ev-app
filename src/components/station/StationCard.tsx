import type { Station } from '@/lib/data/types';
import { ReliabilityBadge } from './ReliabilityBadge';
import { formatDistance, formatPricePerKwh } from '@/lib/format';

interface Props {
  station: Station;
  onClick?: () => void;
}

const CPO_COLORS: Record<string, string> = {
  'tata-power': '#1B4B96',
  'jio-bp': '#00A550',
  statiq: '#7C3AED',
  hpcl: '#E31E24',
  iocl: '#F58220',
  bpcl: '#FFCB05',
};

export function StationCard({ station, onClick }: Props) {
  const tier = station.reliabilityTier ?? 'unknown';
  const score = station.reliabilityScore ?? 0;
  const cpoColor = station.cpo ? CPO_COLORS[station.cpo.id] ?? '#6B7684' : '#6B7684';
  const cpoName = station.cpo?.name ?? station.cpoId;

  const dcConnector = station.connectors?.find(
    (c) => c.type === 'CCS_2' || c.type === 'CHADEMO' || c.type === 'BHARAT_DC_001',
  );
  const acConnector = station.connectors?.find(
    (c) => c.type === 'TYPE_2_AC' || c.type === 'BHARAT_AC_001',
  );
  const primaryConnector = dcConnector ?? acConnector;
  
  // Build connector info and price separately for better layout control
  const connectorInfo: string[] = [];
  if (dcConnector) connectorInfo.push(`DC ${dcConnector.maxPowerKw} kW`);
  if (acConnector) connectorInfo.push(`AC ${acConnector.maxPowerKw} kW`);
  const price = primaryConnector ? formatPricePerKwh(primaryConnector.pricePerKwh) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg flex items-start gap-3 active:scale-[0.98] transition-transform"
      style={{
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        padding: '14px 16px',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <ReliabilityBadge scorePct={score} tier={tier} />
      </div>

      <div className="flex-1 min-w-0" style={{ paddingTop: 2 }}>
        {/* Row 1: name + distance */}
        <div className="flex items-baseline justify-between gap-2" style={{ marginBottom: 4 }}>
          <span
            className="font-semibold truncate"
            style={{ fontSize: 14, lineHeight: 1.3, color: 'var(--color-ink)' }}
          >
            {station.name}
          </span>
          {station.distanceKm !== undefined && (
            <span
              className="shrink-0 tabular-nums"
              style={{ fontSize: 12, lineHeight: 1.3, color: 'var(--color-ink-3)' }}
            >
              {formatDistance(station.distanceKm)}
            </span>
          )}
        </div>

        {/* Row 2: CPO name with dot */}
        <div className="flex items-center gap-1.5" style={{ marginBottom: 3 }}>
          <span
            className="inline-block rounded-full shrink-0"
            style={{ width: 8, height: 8, background: cpoColor }}
          />
          <span 
            className="truncate" 
            style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--color-ink-3)' }}
          >
            {cpoName}
          </span>
        </div>

        {/* Row 3: connector specs + price */}
        {(connectorInfo.length > 0 || price) && (
          <div className="flex items-center gap-1.5 flex-wrap" style={{ marginBottom: 0 }}>
            <span 
              style={{ 
                fontSize: 11, 
                lineHeight: 1.4, 
                color: 'var(--color-ink-3)',
                whiteSpace: 'nowrap'
              }}
            >
              {connectorInfo.join(' · ')}
            </span>
            {price && (
              <>
                <span style={{ fontSize: 11, color: 'var(--color-border)' }}>·</span>
                <span 
                  style={{ 
                    fontSize: 11, 
                    lineHeight: 1.4,
                    color: 'var(--color-ink-2)', 
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {price}
                </span>
              </>
            )}
          </div>
        )}

        {/* Row 4: recommendation reason (if any) */}
        {station.recommendationReason && (
          <p
            className="italic truncate"
            style={{ 
              fontSize: 11, 
              lineHeight: 1.4,
              color: 'var(--color-brand-500)',
              marginTop: 3
            }}
          >
            {station.recommendationReason}
          </p>
        )}
      </div>
    </button>
  );
}
