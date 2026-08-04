'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import dynamic from 'next/dynamic';
import { dataClient } from '@/lib/data';
import type { ChargingHistory } from '@/lib/data/types';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { useUserStore } from '@/stores/userStore';

// Dynamic import for Recharts to avoid SSR issues
const BatteryHealthChart = dynamic(
  () => import('@/components/passport/BatteryHealthChart'),
  { ssr: false, loading: () => <Skeleton height={200} rounded /> },
);

export default function PassportPage() {
  const router = useRouter();
  const { currentUser, currentVehicle } = useUserStore();
  const [history, setHistory] = useState<ChargingHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCpo, setSelectedCpo] = useState<string>('all');

  useEffect(() => {
    // Redirect to onboarding if no user/vehicle
    if (!currentUser || !currentVehicle) {
      router.push('/onboarding');
      return;
    }

    async function loadHistory() {
      try {
        const data = await dataClient.getChargingHistory(currentUser!.id);
        setHistory(data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [currentUser, currentVehicle, router]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalSessions: history.length,
      energyDelivered: history.reduce((sum, h) => sum + h.energyKwh, 0),
      totalSpent: history.reduce((sum, h) => sum + h.totalCost, 0),
      co2Saved: history.reduce((sum, h) => sum + h.co2SavedKg, 0),
    };
  }, [history]);

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      // Month filter
      if (selectedMonth !== 'all') {
        const sessionDate = new Date(h.date);
        const filterMonth = parseInt(selectedMonth);
        if (sessionDate.getMonth() !== filterMonth) return false;
      }

      // CPO filter
      if (selectedCpo !== 'all' && h.cpoId !== selectedCpo) {
        return false;
      }

      return true;
    });
  }, [history, selectedMonth, selectedCpo]);

  // Get unique CPOs
  const cpos = useMemo(() => {
    const uniqueCpos = new Map();
    history.forEach((h) => {
      if (h.cpo && !uniqueCpos.has(h.cpoId)) {
        uniqueCpos.set(h.cpoId, h.cpo);
      }
    });
    return Array.from(uniqueCpos.values());
  }, [history]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: 'var(--color-bg)' }}>
        <div className="p-4">
          <Skeleton height={24} width={100} className="mb-4" />
          <Skeleton height={200} rounded className="mb-6" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard className="mb-3" />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col" style={{ background: 'var(--color-bg)' }}>
        <div
          className="flex items-center px-4 py-3"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <button
            onClick={() => router.back()}
            style={{ color: 'var(--color-ink)' }}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 text-center"
          style={{ paddingBottom: 80 }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--color-surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <span style={{ fontSize: 40 }}>⚡</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>
            No charging sessions yet
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-ink-3)', maxWidth: 280 }}>
            Your first charge will show here.
          </p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.name?.split(' ')[0] || 'Demo User';
  const vehicleModel = currentVehicle?.model || 'EV';

  return (
    <div className="flex h-full min-h-0 flex-col" style={{ background: 'var(--color-bg)' }}>
      {/* Hero header */}
      <div
        className="flex-shrink-0"
        style={{
          background: 'linear-gradient(to bottom, var(--color-ink), #1a1b24)',
          borderRadius: '0 0 24px 24px',
          padding: 24,
          paddingTop: 16,
          color: 'white',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ color: 'white', marginBottom: 16 }}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Charging Passport</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
          Your charging history
        </p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
          {userName}&apos;s {vehicleModel}
        </h1>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Total sessions', value: stats.totalSessions },
            { label: 'Energy delivered', value: `${stats.energyDelivered.toFixed(1)} kWh` },
            { label: 'Total spent', value: `₹${stats.totalSpent.toFixed(0)}` },
            { label: '🌱 CO₂ saved', value: `${stats.co2Saved.toFixed(1)} kg` },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                padding: 16,
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <p style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{stat.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
        <div className="p-4 space-y-6">
          {/* Battery health section */}
          <div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--color-ink)',
                marginBottom: 12,
              }}
            >
              Battery health over time
            </h2>
            <BatteryHealthChart />
            <p
              style={{
                fontSize: 12,
                color: 'var(--color-ink-3)',
                marginTop: 12,
                fontStyle: 'italic',
              }}
            >
              Estimated based on your charging patterns. Direct battery telemetry coming with
              vehicle integration.
            </p>
          </div>

          {/* Recent sessions section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                Recent sessions
              </h2>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* Month filter */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    fontSize: 13,
                    color: 'var(--color-ink)',
                    background: 'var(--color-surface)',
                  }}
                >
                  <option value="all">All months</option>
                  {[...Array(6)].map((_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    return (
                      <option key={i} value={date.getMonth()}>
                        {date.toLocaleDateString('en-IN', { month: 'short' })}
                      </option>
                    );
                  })}
                </select>

                {/* CPO filter */}
                {cpos.length > 1 && (
                  <select
                    value={selectedCpo}
                    onChange={(e) => setSelectedCpo(e.target.value)}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--color-border)',
                      borderRadius: 6,
                      fontSize: 13,
                      color: 'var(--color-ink)',
                      background: 'var(--color-surface)',
                    }}
                  >
                    <option value="all">All CPOs</option>
                    {cpos.map((cpo) => (
                      <option key={cpo.id} value={cpo.id}>
                        {cpo.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Session list */}
            <div className="space-y-3">
              {filteredHistory.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    // For demo, sessions in history don't have full receipt data
                    // In production, this would navigate to /session/[id]/complete
                    console.log('Session clicked:', session.id);
                  }}
                  style={{
                    padding: 16,
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-brand-500)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                    {/* CPO logo */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: session.cpo?.chipColor || 'var(--color-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {session.cpo?.name.substring(0, 2).toUpperCase() || '??'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: 'var(--color-ink)',
                          marginBottom: 4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {session.station?.name || 'Unknown Station'}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>
                        {formatDate(session.date)}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          fontSize: 13,
                          color: 'var(--color-ink-2)',
                          marginBottom: 2,
                        }}
                      >
                        {session.energyKwh.toFixed(1)} kWh · {session.durationMins} min
                      </p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>
                        ₹{session.totalCost.toFixed(2)}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>
                        {session.connectorType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredHistory.length === 0 && (
              <p
                style={{
                  textAlign: 'center',
                  padding: 40,
                  color: 'var(--color-ink-3)',
                  fontSize: 14,
                }}
              >
                No sessions match the selected filters.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
