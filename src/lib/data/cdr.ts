import type { Connector, ConnectorType, Session, Station, User } from './types';

/** Minimum OCPI 2.2.1 CDR shape exported from a Session */
export interface CDR {
  country_code: string;
  party_id: string;
  id: string;
  start_date_time: string;
  end_date_time: string;
  session_id?: string;
  cdr_token: {
    uid: string;
    type: 'RFID' | 'APP_USER' | 'AD_HOC_USER';
    contract_id: string;
  };
  auth_method: 'AUTH_REQUEST' | 'COMMAND' | 'WHITELIST';
  cdr_location: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates: { latitude: string; longitude: string };
    evse_uid: string;
    evse_id: string;
    connector_id: string;
    connector_standard: string;
    connector_format: 'SOCKET' | 'CABLE';
    connector_power_type: 'AC_1_PHASE' | 'AC_3_PHASE' | 'DC';
  };
  currency: string;
  charging_periods: {
    start_date_time: string;
    dimensions: {
      type: 'ENERGY' | 'TIME' | 'FLAT';
      volume: number;
    }[];
  }[];
  total_cost: {
    excl_vat: number;
    incl_vat: number;
  };
  total_energy: number;
  total_time: number;
  total_parking_time?: number;
  remark?: string;
  last_updated: string;
}

// Party ID for Unified-EV as eMSP — placeholder, replace when company is registered
const OUR_PARTY_ID = 'UEV';
const OUR_COUNTRY_CODE = 'IN';

/**
 * Pure OCPI 2.2.1 CDR mapper. No I/O, no side effects.
 * Layer 2 will expose this via GET /api/cpo/:cpoId/cdrs.
 */
export function toCDR(
  session: Session,
  station: Station,
  connector: Connector,
  user: User,
): CDR {
  if (!session.startedAt || !session.endedAt) {
    throw new Error('toCDR requires a completed session with startedAt and endedAt');
  }

  const durationHours =
    (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 3_600_000;

  return {
    country_code: OUR_COUNTRY_CODE,
    party_id: OUR_PARTY_ID,
    id: session.id,
    start_date_time: session.startedAt,
    end_date_time: session.endedAt,
    session_id: session.id,
    cdr_token: {
      uid: user.phone,
      type: 'APP_USER',
      contract_id: user.id,
    },
    auth_method: 'AUTH_REQUEST',
    cdr_location: {
      id: station.id,
      name: station.name,
      address: station.address,
      city: extractCity(station.address),
      country: 'India',
      coordinates: {
        latitude: station.coordinates.lat.toString(),
        longitude: station.coordinates.lng.toString(),
      },
      evse_uid: connector.id,
      evse_id: connector.id,
      connector_id: connector.identifier,
      connector_standard: mapConnectorStandard(connector.type),
      connector_format: 'CABLE',
      connector_power_type: powerType(connector.type),
    },
    currency: session.currency,
    charging_periods: (
      session.chargingPeriods ?? [
        {
          startedAt: session.startedAt,
          energyKwh: session.energyKwh,
        },
      ]
    ).map((p) => ({
      start_date_time: p.startedAt,
      dimensions: [{ type: 'ENERGY' as const, volume: p.energyKwh }],
    })),
    total_cost: {
      excl_vat: round2(session.costAccrued / (1 + session.gstPct / 100)),
      incl_vat: round2(session.costAccrued),
    },
    total_energy: session.energyKwh,
    total_time: round2(durationHours),
    total_parking_time: session.totalParkingTime ?? 0,
    last_updated: new Date().toISOString(),
  };
}

function mapConnectorStandard(type: ConnectorType | string): string {
  const map: Record<string, string> = {
    CCS_2: 'IEC_62196_T2_COMBO',
    CHADEMO: 'CHADEMO',
    TYPE_2_AC: 'IEC_62196_T2',
    // Approximate — Bharat AC 001 is India-specific and not in OCPI v2.2.1 formally
    BHARAT_AC_001: 'IEC_60309_2_single_16',
    // Approximate — Bharat DC 001 is India-specific; CHADEMO is closest low-power DC equivalent
    BHARAT_DC_001: 'CHADEMO',
  };
  return map[type] ?? 'DOMESTIC_F';
}

function powerType(type: ConnectorType | string): 'AC_1_PHASE' | 'AC_3_PHASE' | 'DC' {
  if (type.includes('DC') || type === 'CCS_2' || type === 'CHADEMO') return 'DC';
  if (type === 'TYPE_2_AC') return 'AC_3_PHASE';
  return 'AC_1_PHASE';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function extractCity(address: string): string {
  // V1 heuristic: last comma-separated segment before pin code
  const parts = address.split(',').map((s) => s.trim());
  return parts[parts.length - 2] ?? 'Mumbai';
}

/** Exported for tests */
export const _testHelpers = { mapConnectorStandard, powerType, round2, extractCity };
