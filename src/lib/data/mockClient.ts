import type {
  DataClient,
  Station,
  Connector,
  ConnectorStatus,
  CPO,
  Review,
  Photo,
  Session,
  User,
  Vehicle,
  ReliabilityScore,
  ReliabilityTier,
  StationFilters,
  InitiateSessionInput,
  PlanRouteInput,
  RoutePlan,
  PreGeneratedRoute,
  ChargingHistory,
  SubmitReviewInput,
  Unsubscribe,
} from './types';

import rawCpos from '@/data/cpos.json';
import rawStations from '@/data/stations.json';
import rawConnectors from '@/data/connectors.json';
import rawReliability from '@/data/reliability.json';
import rawReviews from '@/data/reviews.json';
import rawPhotos from '@/data/photos.json';
import rawVehicles from '@/data/vehicles.json';
import rawRoutes from '@/data/routes.json';
import rawHistory from '@/data/history.json';

/* Cast imported JSON to our types */
const cpos = rawCpos as CPO[];
const stations = rawStations as Station[];
const connectors = rawConnectors as Connector[];
const reliabilityData = rawReliability as ReliabilityScore[];
const reviews = rawReviews as Review[];
const photos = rawPhotos as Photo[];
const vehicles = rawVehicles as Vehicle[];
const routes = rawRoutes as PreGeneratedRoute[];
const chargingHistory = rawHistory as ChargingHistory[];

/** V1 in-memory store for reviews submitted during the session */
const submittedReviews: Review[] = [];

/** Simulated network delay so loading states get exercised */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(150 + Math.random() * 250);
}

/* ─── Lookup helpers ─────────────────────────────────────────────────────── */

function getCPOById(id: string): CPO | undefined {
  return cpos.find((c) => c.id === id);
}

function getConnectorsForStation(stationId: string): Connector[] {
  return connectors.filter((c) => c.stationId === stationId);
}

function getReliabilityForConnector(connectorId: string): ReliabilityScore | undefined {
  return reliabilityData.find((r) => r.connectorId === connectorId);
}

function computeStationReliability(stationId: string): {
  scorePct: number;
  tier: ReliabilityTier;
  lastConfirmedAt: string;
} {
  const stationConnectors = getConnectorsForStation(stationId);
  const scores = stationConnectors
    .map((c) => getReliabilityForConnector(c.id))
    .filter((r): r is ReliabilityScore => r !== undefined);

  if (scores.length === 0) {
    return { scorePct: 0, tier: 'unknown', lastConfirmedAt: '' };
  }

  // Weighted average by sample size
  const totalSamples = scores.reduce((acc, r) => acc + r.sampleSize, 0);
  const weightedScore = scores.reduce(
    (acc, r) => acc + r.scorePct * (r.sampleSize / totalSamples),
    0,
  );
  const scorePct = Math.round(weightedScore);

  const tier: ReliabilityTier =
    scorePct >= 90 ? 'green' : scorePct >= 70 ? 'amber' : 'red';

  // Most recent confirmation across connectors
  const lastConfirmedAt = scores
    .map((r) => r.lastConfirmedAt)
    .sort()
    .reverse()[0];

  return { scorePct, tier, lastConfirmedAt };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function enrichStation(station: Station, userLat?: number, userLng?: number): Station {
  const stationConnectors = getConnectorsForStation(station.id).map((c) => ({
    ...c,
    reliability: getReliabilityForConnector(c.id),
  }));
  const { scorePct, tier, lastConfirmedAt } = computeStationReliability(station.id);
  const distanceKm =
    userLat !== undefined && userLng !== undefined
      ? haversineKm(userLat, userLng, station.coordinates.lat, station.coordinates.lng)
      : undefined;

  return {
    ...station,
    cpo: getCPOById(station.cpoId),
    connectors: stationConnectors,
    reliabilityScore: scorePct,
    reliabilityTier: tier,
    distanceKm,
    _lastConfirmedAt: lastConfirmedAt,
  } as Station & { _lastConfirmedAt: string };
}

function applyFilters(stations: Station[], filters?: StationFilters): Station[] {
  if (!filters) return stations;
  return stations.filter((s) => {
    if (filters.availableOnly) {
      const hasAvailable = s.connectors?.some((c) => c.status === 'AVAILABLE');
      if (!hasAvailable) return false;
    }
    if (filters.connectorTypes && filters.connectorTypes.length > 0) {
      const hasType = s.connectors?.some((c) => filters.connectorTypes!.includes(c.type));
      if (!hasType) return false;
    }
    if (filters.minReliability !== undefined) {
      if ((s.reliabilityScore ?? 0) < filters.minReliability) return false;
    }
    if (filters.maxPricePerKwh !== undefined) {
      const minPrice = Math.min(...(s.connectors?.map((c) => c.pricePerKwh) ?? [Infinity]));
      if (minPrice > filters.maxPricePerKwh) return false;
    }
    return true;
  });
}

/* ─── Demo user + session helpers ───────────────────────────────────────── */

const DEMO_USER: User = {
  id: 'demo-user',
  phone: '+91 98765 43210',
  name: 'Rohan Mehta',
  vehicleId: 'tata-nexon-ev',
  createdAt: '2026-06-01T00:00:00Z',
};

/* ─── Mock client implementation ─────────────────────────────────────────── */

export const mockClient: DataClient = {
  async getStationsNear(lat, lng, radiusKm, filters) {
    await randomDelay();
    const enriched = stations
      .map((s) => enrichStation(s, lat, lng))
      .filter((s) => (s.distanceKm ?? 0) <= radiusKm);
    return applyFilters(enriched, filters);
  },

  async getStation(id) {
    await randomDelay();
    const station = stations.find((s) => s.id === id);
    if (!station) return null;
    return enrichStation(station);
  },

  async getCPOs() {
    await randomDelay();
    return cpos;
  },

  async getConnectorStatus(connectorId) {
    await randomDelay();
    const connector = connectors.find((c) => c.id === connectorId);
    return (connector?.status ?? 'UNKNOWN') as ConnectorStatus;
  },

  subscribeToConnectorStatus(connectorId, cb) {
    const statuses: ConnectorStatus[] = ['AVAILABLE', 'OCCUPIED', 'AVAILABLE', 'AVAILABLE'];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % statuses.length;
      cb(statuses[i]);
    // Flip status roughly every 90 seconds to simulate real churn
    }, 90_000);
    return () => clearInterval(interval);
  },

  async initiateSession(input: InitiateSessionInput) {
    await randomDelay();
    const session: Session = {
      id: `s-${Date.now()}`,
      userId: input.userId,
      connectorId: input.connectorId,
      stationId: input.stationId,
      cpoId: input.cpoId,
      status: 'PAYMENT_AUTHORIZED',
      paymentMethod: input.paymentMethod,
      energyKwh: 0,
      costAccrued: 0,
      platformFee: 7,
      holdAmount: input.holdAmount,
      capturedAmount: 0,
      refundAmount: 0,
      durationMins: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    return session;
  },

  async startSession(sessionId) {
    await randomDelay();
    return {
      id: sessionId,
      userId: DEMO_USER.id,
      connectorId: 'tp-bkc-01-c1',
      stationId: 'tp-bkc-01',
      cpoId: 'tata-power',
      status: 'ACTIVE',
      paymentMethod: 'UPI',
      energyKwh: 0,
      costAccrued: 0,
      platformFee: 7,
      holdAmount: 500,
      capturedAmount: 0,
      refundAmount: 0,
      durationMins: 0,
      startedAt: new Date().toISOString(),
      endedAt: null,
    } as Session;
  },

  async stopSession(sessionId) {
    await randomDelay();
    const energyKwh = 18.4;
    const pricePerKwh = 18.5;
    const costAccrued = energyKwh * pricePerKwh;
    const holdAmount = 500;
    const capturedAmount = Math.round((costAccrued + 7) * 100) / 100;
    return {
      id: sessionId,
      userId: DEMO_USER.id,
      connectorId: 'tp-bkc-01-c1',
      stationId: 'tp-bkc-01',
      cpoId: 'tata-power',
      status: 'SETTLED',
      paymentMethod: 'UPI',
      energyKwh,
      costAccrued,
      platformFee: 7,
      holdAmount,
      capturedAmount,
      refundAmount: Math.round((holdAmount - capturedAmount) * 100) / 100,
      durationMins: 42,
      startedAt: new Date(Date.now() - 42 * 60000).toISOString(),
      endedAt: new Date().toISOString(),
    } as Session;
  },

  subscribeToSession(sessionId, cb) {
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 15;
      const energyKwh = Math.min(elapsed * 0.014, 30);
      const costAccrued = energyKwh * 18.5;
      cb({
        id: sessionId,
        userId: DEMO_USER.id,
        connectorId: 'tp-bkc-01-c1',
        stationId: 'tp-bkc-01',
        cpoId: 'tata-power',
        status: 'ACTIVE',
        paymentMethod: 'UPI',
        energyKwh,
        costAccrued,
        platformFee: 7,
        holdAmount: 500,
        capturedAmount: 0,
        refundAmount: 0,
        durationMins: elapsed / 60,
        startedAt: new Date(Date.now() - elapsed * 1000).toISOString(),
        endedAt: null,
      });
    }, 1000);
    return () => clearInterval(interval);
  },

  async getSessionHistory() {
    await randomDelay();
    return [];
  },

  async getReviewsForStation(stationId) {
    await randomDelay();
    const seeded = reviews.filter((r) => r.stationId === stationId);
    const live = submittedReviews.filter((r) => r.stationId === stationId);
    return [...live, ...seeded] as Review[];
  },

  async getPhotosForStation(stationId) {
    await randomDelay();
    return photos.filter((p) => p.stationId === stationId);
  },

  async submitReview(input: SubmitReviewInput) {
    await randomDelay();
    const station = stations.find((s) => s.id === input.stationId);
    const review: Review = {
      id: `r-${Date.now()}`,
      stationId: input.stationId,
      cpoId: station?.cpoId ?? 'unknown',
      sessionId: input.sessionId,
      userId: input.userId,
      userName: DEMO_USER.name,
      rating: input.rating,
      text: input.text ?? '',
      isCurated: false, // Real user-written, not seeded
      createdAt: new Date().toISOString(),
    };
    // V1: in-memory only, doesn't persist beyond page reload
    // Layer 2 will insert into Postgres via Supabase
    submittedReviews.unshift(review);
    return review;
  },

  async sendOtp() {
    await randomDelay();
    return { nonce: 'demo-nonce' };
  },

  async verifyOtp() {
    await randomDelay();
    return DEMO_USER;
  },

  async getCurrentUser() {
    await randomDelay();
    return DEMO_USER;
  },

  async getVehicles() {
    await randomDelay();
    return vehicles;
  },

  async getVehicle(id) {
    await randomDelay();
    return vehicles.find((v) => v.id === id) ?? null;
  },

  async planRoute() {
    await randomDelay();
    return {
      id: 'route-mock-1',
      origin: { label: 'Mumbai', lat: 19.076, lng: 72.877 },
      destination: { label: 'Pune', lat: 18.5204, lng: 73.8567 },
      totalDistanceKm: 148,
      stops: [],
      polyline: '',
    } as RoutePlan;
  },

  async getPreGeneratedRoutes() {
    await randomDelay();
    return routes;
  },

  async getChargingHistory() {
    await randomDelay();
    // Sort by date descending (most recent first)
    const sorted = [...chargingHistory].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    // Populate station and CPO data
    return sorted.map((h) => ({
      ...h,
      station: stations.find((s) => s.id === h.stationId),
      cpo: cpos.find((c) => c.id === h.cpoId),
    }));
  },
};
