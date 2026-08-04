'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Coffee,
  Clock,
  TrendingUp,
  AlertCircle,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { dataClient } from '@/lib/data';
import { useReliabilityLive } from '@/hooks/useReliabilityLive';
import { StationPhotoCarousel } from '@/components/station/StationPhotoCarousel';
import type { Station, Review, Photo, ConnectorStatus } from '@/lib/data/types';

interface Props {
  params: { id: string };
}

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  cafe: <Coffee size={16} />,
  restroom: <span style={{ fontSize: 14 }}>🚻</span>,
  '24x7': <Clock size={16} />,
  security: <span style={{ fontSize: 14 }}>🛡️</span>,
  parking: <span style={{ fontSize: 14 }}>🅿️</span>,
  wifi: <span style={{ fontSize: 14 }}>📶</span>,
  shopping: <span style={{ fontSize: 14 }}>🛍️</span>,
};

const AMENITY_LABELS: Record<string, string> = {
  cafe: 'Café',
  restroom: 'Restroom',
  '24x7': '24×7',
  security: 'Security',
  parking: 'Parking',
  wifi: 'WiFi',
  shopping: 'Shopping',
};

function ReliabilityHero({ station }: { station: Station }) {
  const lastConfirmed = station._lastConfirmedAt || new Date().toISOString();
  const liveTime = useReliabilityLive(lastConfirmed);

  const tierColor =
    station.reliabilityTier === 'green'
      ? 'var(--color-tier-green)'
      : station.reliabilityTier === 'amber'
        ? 'var(--color-tier-amber)'
        : 'var(--color-tier-red)';

  const sampleSize = station.connectors?.reduce(
    (sum, c) => sum + (c.reliability?.sampleSize || 0),
    0,
  ) || 0;

  return (
    <div
      style={{
        padding: 'var(--space-6)',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: tierColor }}>
          {station.reliabilityScore || 0}%
        </span>
        <span style={{ fontSize: 15, color: 'var(--color-ink-2)' }}>reliability</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.5 }}>
        Based on {sampleSize.toLocaleString()} sessions in the last 30 days
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--color-ink-2)',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: tierColor,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
        Last confirmed working {liveTime}
      </div>
    </div>
  );
}

export default function StationDetailPage({ params }: Props) {
  const router = useRouter();
  const [station, setStation] = useState<Station | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStation = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [stationData, reviewsData, photosData] = await Promise.all([
          dataClient.getStation(params.id),
          dataClient.getReviewsForStation(params.id),
          dataClient.getPhotosForStation(params.id),
        ]);

        if (!stationData) {
          setError('Station not found');
          return;
        }

        setStation(stationData);
        setReviews(reviewsData);
        setPhotos(photosData);
      } catch (err) {
        setError('Failed to load station');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStation();
  }, [params.id]);

  const handleShare = async () => {
    if (navigator.share && station) {
      try {
        await navigator.share({
          title: station.name,
          text: `Check out this EV charging station: ${station.name}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const handleReport = () => {
    alert('Reported. Thanks for helping other drivers.');
  };

  const openDirections = () => {
    if (station) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${station.coordinates.lat},${station.coordinates.lng}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div style={{ fontSize: 15, color: 'var(--color-ink-3)' }}>Loading station...</div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-bg)', padding: 'var(--space-6)' }}
      >
        <AlertCircle size={48} color="var(--color-danger)" />
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
          {error || 'Station not found'}
        </div>
        <button
          onClick={() => router.back()}
          style={{
            padding: '12px 24px',
            background: 'var(--color-brand-500)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-ink)' }}
    >
      <div
        className="flex-shrink-0"
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-ink-2)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={handleShare}
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-ink-2)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Share2 size={20} />
        </button>
      </div>

      <StationPhotoCarousel photos={photos} />

      <div
        className="min-h-0 flex-1 overflow-y-auto"
        style={{
          padding: 'var(--space-4)',
          paddingBottom: 120,
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: station.cpo?.chipColor,
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)' }}>
              {station.cpo?.name}
            </span>
          </div>

          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{station.name}</h1>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                color: 'var(--color-ink-3)',
                fontSize: 14,
              }}
            >
              <MapPin size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>{station.address}</span>
            </div>
          </div>

          <ReliabilityHero station={station} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-4)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                Avg wait
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{station.avgWaitMins} min</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                Traffic
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {station.trafficLevel.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--color-ink-3)', marginBottom: 4 }}>
                Best time
              </div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{station.bestTimeToCharge}</div>
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-3)' }}>
              Connectors
            </h2>
            <div className="flex flex-col gap-3">
              {station.connectors?.map((connector) => {
                const statusColor =
                  connector.status === 'AVAILABLE'
                    ? 'var(--color-success)'
                    : connector.status === 'OCCUPIED'
                      ? 'var(--color-warning)'
                      : 'var(--color-danger)';

                return (
                  <div
                    key={connector.id}
                    style={{
                      padding: 'var(--space-4)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {connector.type.replace(/_/g, ' ')} • {connector.maxPowerKw} kW
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-ink-2)' }}>
                        ₹{connector.pricePerKwh}/kWh
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '4px 10px',
                        background: `${statusColor}22`,
                        color: statusColor,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {connector.status.toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {station.amenities && station.amenities.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                Amenities
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {station.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    style={{
                      padding: '8px 14px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--color-ink-2)',
                    }}
                  >
                    {AMENITY_ICONS[amenity] || null}
                    {AMENITY_LABELS[amenity] || amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviews.length > 0 && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                Recent reviews
              </h2>
              <div className="flex flex-col gap-4">
                {reviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: 'var(--space-4)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{review.userName}</span>
                        {review.isCurated && (
                          <div
                            style={{
                              padding: '2px 8px',
                              background: 'var(--color-success)',
                              color: 'white',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: 11,
                              fontWeight: 500,
                            }}
                          >
                            ✓ verified
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span
                            key={i}
                            style={{
                              color: i < review.rating ? '#F59E0B' : 'var(--color-surface-3)',
                              fontSize: 14,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--color-ink-2)', lineHeight: 1.5 }}>
                      {review.text}
                    </p>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 8 }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleReport}
            style={{
              padding: '12px',
              background: 'transparent',
              color: 'var(--color-ink-3)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            Report an issue
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 flex gap-3"
        style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => router.push(`/scan?stationId=${station.id}`)}
          style={{
            flex: 1,
            height: 52,
            background: 'var(--color-brand-500)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Scan to Charge
        </button>
        <button
          onClick={openDirections}
          style={{
            height: 52,
            padding: '0 20px',
            background: 'var(--color-surface-2)',
            color: 'var(--color-ink)',
            borderRadius: 'var(--radius-lg)',
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ExternalLink size={18} />
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
