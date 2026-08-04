/* ─── Primitive enums ────────────────────────────────────────────────────── */

export type ConnectorType =
  | 'CCS_2'
  | 'CHADEMO'
  | 'TYPE_2_AC'
  | 'BHARAT_AC_001' // India-specific low-power AC (for 2W/3W and budget 4W)
  | 'BHARAT_DC_001'; // India-specific low-power DC (for 2W/3W and small 4W)

export type VehicleClass = 'TWO_WHEELER' | 'THREE_WHEELER' | 'FOUR_WHEELER' | 'COMMERCIAL';

export type ConnectorStatus = 'AVAILABLE' | 'OCCUPIED' | 'FAULTED' | 'UNAVAILABLE' | 'UNKNOWN';

export type TrafficLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type SessionStatus =
  | 'INITIATED'
  | 'PAYMENT_AUTHORIZED'
  | 'STARTING'
  | 'ACTIVE'
  | 'STOPPING'
  | 'COMPLETED'
  | 'SETTLED'
  | 'FAILED';

export type ReliabilityTier = 'green' | 'amber' | 'red' | 'unknown';

/* ─── Core entities ──────────────────────────────────────────────────────── */

export interface CPO {
  id: string;
  name: string;
  logoUrl: string;
  chipColor: string;
  protocol: string;
}

export interface Amenity {
  type: 'cafe' | 'restroom' | '24x7' | 'security' | 'parking' | 'wifi' | 'shopping';
  label: string;
}

export interface Station {
  id: string;
  cpoId: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  isActive: boolean;
  avgWaitMins: number;
  bestTimeToCharge: string;
  trafficLevel: TrafficLevel;
  /** Populated by DataClient — not in raw JSON */
  cpo?: CPO;
  connectors?: Connector[];
  reliabilityScore?: number;
  reliabilityTier?: ReliabilityTier;
  distanceKm?: number;
  recommendationReason?: string;
  _lastConfirmedAt?: string;
}

export interface Connector {
  id: string;
  stationId: string;
  cpoId: string;
  identifier: string;
  type: ConnectorType;
  maxPowerKw: number;
  pricePerKwh: number;
  status: ConnectorStatus;
  /** Populated by DataClient */
  reliability?: ReliabilityScore;
}

export interface ReliabilityScore {
  connectorId: string;
  scorePct: number;
  sampleSize: number;
  windowDays: number;
  lastConfirmedAt: string; // ISO 8601
}

export interface Review {
  id: string;
  stationId: string;
  cpoId: string;
  /** null on curated seed reviews */
  sessionId: string | null;
  userId: string;
  userName: string;
  rating: number; // 1-5
  text: string;
  isCurated: boolean;
  createdAt: string; // ISO 8601
}

export interface Photo {
  id: string;
  stationId: string;
  cpoId: string;
  sessionId: string | null;
  userId: string;
  url: string;
  caption: string;
  isCurated: boolean;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant?: string;
  vehicleClass: VehicleClass;
  batteryKwh: number;
  connectorType: ConnectorType;
  avgConsumptionWhPerKm: number;
  maxChargeRateKw: number;
  preferredChargeToPct?: number;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  vehicleId: string | null;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  connectorId: string;
  stationId: string;
  cpoId: string;
  status: SessionStatus;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  energyKwh: number;
  costAccrued: number;
  platformFee: number;
  holdAmount: number;
  capturedAmount: number;
  refundAmount: number;
  durationMins: number;
  startedAt: string;
  endedAt: string | null;
  currentPowerKw?: number;
  currentSoc?: number;
  /** Reference to user_vehicle — used for CDR / passport linkage */
  vehicleId?: string;
  authMethod?: 'APP_USER' | 'AD_HOC_USER';
  /** Hours of parking billed (default 0) */
  totalParkingTime?: number;
  /** Periods for OCPI charging_periods array */
  chargingPeriods?: {
    startedAt: string;
    energyKwh: number;
  }[];
  /** CPO's own session ID (null/undefined in V1 mock) */
  cpoSessionRef?: string;
  currency: 'INR';
  /** GST percent applied to session cost (18 for V1) */
  gstPct: number;
}

/** Historical charging session (from history.json) */
export interface ChargingHistory {
  id: string;
  stationId: string;
  connectorId: string;
  connectorType: ConnectorType;
  cpoId: string;
  date: string; // ISO 8601
  energyKwh: number;
  durationMins: number;
  totalCost: number;
  pricePerKwh: number;
  co2SavedKg: number;
  status: 'COMPLETED';
  /** Populated by DataClient */
  station?: Station;
  cpo?: CPO;
}

/* ─── Route planning ─────────────────────────────────────────────────────── */

export interface RouteStop {
  stationId: string;
  station?: Station;
  estimatedArrivalSoC: number;
  estimatedDepartureSoC: number;
  chargeDurationMins: number;
}

export interface RoutePlan {
  id: string;
  origin: { label: string; lat: number; lng: number };
  destination: { label: string; lat: number; lng: number };
  totalDistanceKm: number;
  stops: RouteStop[];
  polyline: string; // encoded polyline
}

/** Pre-generated demo routes (routes.json) */
export interface PreGeneratedRoute {
  id: string;
  originName: string;
  originCoords: { lat: number; lng: number };
  destinationName: string;
  destinationCoords: { lat: number; lng: number };
  distanceKm: number;
  durationMins: number;
  polylineEncoded: string;
  chargingStopStationId: string;
  alternativeStationIds: string[];
}

/* ─── DataClient inputs ──────────────────────────────────────────────────── */

export interface StationFilters {
  availableOnly?: boolean;
  connectorTypes?: ConnectorType[];
  minReliability?: number;
  maxPricePerKwh?: number;
}

export interface InitiateSessionInput {
  userId: string;
  connectorId: string;
  stationId: string;
  cpoId: string;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';
  holdAmount: number;
}

export interface PlanRouteInput {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  currentSoC: number;
  vehicleId: string;
}

export interface SubmitReviewInput {
  sessionId: string;
  stationId: string;
  userId: string;
  rating: number; // 1-5
  text?: string;
}

export type Unsubscribe = () => void;

/* ─── The DataClient interface ───────────────────────────────────────────── */

export interface DataClient {
  // Stations
  getStationsNear(
    lat: number,
    lng: number,
    radiusKm: number,
    filters?: StationFilters,
  ): Promise<Station[]>;
  getStation(id: string): Promise<Station | null>;

  // CPOs
  getCPOs(): Promise<CPO[]>;

  // Connector status (real-time in V2; faked via setInterval in V1)
  getConnectorStatus(connectorId: string): Promise<ConnectorStatus>;
  subscribeToConnectorStatus(
    connectorId: string,
    cb: (status: ConnectorStatus) => void,
  ): Unsubscribe;

  // Sessions
  initiateSession(input: InitiateSessionInput): Promise<Session>;
  startSession(sessionId: string): Promise<Session>;
  stopSession(sessionId: string): Promise<Session>;
  subscribeToSession(sessionId: string, cb: (session: Session) => void): Unsubscribe;
  getSessionHistory(userId: string): Promise<Session[]>;
  getChargingHistory(userId: string): Promise<ChargingHistory[]>;

  // Reviews and photos
  getReviewsForStation(stationId: string): Promise<Review[]>;
  getPhotosForStation(stationId: string): Promise<Photo[]>;
  submitReview(input: SubmitReviewInput): Promise<Review>;

  // Auth (V1: accept-anything no-op; V2: real OTP flow)
  sendOtp(phone: string): Promise<{ nonce: string }>;
  verifyOtp(phone: string, otp: string): Promise<User>;
  getCurrentUser(): Promise<User | null>;

  // Vehicles
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | null>;

  // Route planning
  planRoute(input: PlanRouteInput): Promise<RoutePlan>;
  getPreGeneratedRoutes(): Promise<PreGeneratedRoute[]>;
}
