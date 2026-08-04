/**
 * Lightweight CDR tests — no vitest/jest in this repo yet.
 * Run with: npx tsx src/lib/data/cdr.test.ts
 */
import assert from 'node:assert/strict';
import { toCDR, _testHelpers } from './cdr';
import type { Connector, Session, Station, User } from './types';

const user: User = {
  id: 'demo-user',
  phone: '+91 98765 43210',
  name: 'Rohan Mehta',
  vehicleId: 'tata-nexon-ev',
  createdAt: '2026-06-01T00:00:00Z',
};

const station: Station = {
  id: 'tp-bkc-01',
  cpoId: 'tata-power',
  name: 'Tata Power — BKC Hub',
  address: 'Bandra Kurla Complex, Mumbai 400051',
  coordinates: { lat: 19.0596, lng: 72.8656 },
  amenities: [],
  isActive: true,
  avgWaitMins: 5,
  bestTimeToCharge: '10am–2pm',
  trafficLevel: 'LOW',
};

const ccsConnector: Connector = {
  id: 'tp-bkc-01-c1',
  stationId: 'tp-bkc-01',
  cpoId: 'tata-power',
  identifier: 'A1',
  type: 'CCS_2',
  maxPowerKw: 50,
  pricePerKwh: 18.5,
  status: 'AVAILABLE',
};

const bharatDcConnector: Connector = {
  id: 'hpcl-dadar-01-c1',
  stationId: 'hpcl-dadar-01',
  cpoId: 'hpcl',
  identifier: 'D1',
  type: 'BHARAT_DC_001',
  maxPowerKw: 15,
  pricePerKwh: 10.0,
  status: 'AVAILABLE',
};

function makeSession(overrides: Partial<Session> = {}): Session {
  const startedAt = '2026-07-30T10:00:00.000Z';
  const endedAt = '2026-07-30T10:42:00.000Z';
  return {
    id: 's-test-001',
    userId: user.id,
    connectorId: ccsConnector.id,
    stationId: station.id,
    cpoId: 'tata-power',
    status: 'SETTLED',
    paymentMethod: 'UPI',
    energyKwh: 18.4,
    costAccrued: 340.4,
    platformFee: 7,
    holdAmount: 500,
    capturedAmount: 347.4,
    refundAmount: 152.6,
    durationMins: 42,
    startedAt,
    endedAt,
    vehicleId: user.vehicleId ?? undefined,
    authMethod: 'APP_USER',
    totalParkingTime: 0,
    chargingPeriods: [{ startedAt, energyKwh: 18.4 }],
    currency: 'INR',
    gstPct: 18,
    ...overrides,
  };
}

function testNormalSessionProducesValidCdr() {
  const cdr = toCDR(makeSession(), station, ccsConnector, user);

  assert.equal(cdr.country_code, 'IN');
  assert.equal(cdr.party_id, 'UEV');
  assert.equal(cdr.id, 's-test-001');
  assert.equal(cdr.session_id, 's-test-001');
  assert.equal(cdr.currency, 'INR');
  assert.equal(cdr.total_energy, 18.4);
  assert.equal(cdr.total_time, 0.7);
  assert.equal(cdr.cdr_token.uid, user.phone);
  assert.equal(cdr.cdr_token.type, 'APP_USER');
  assert.equal(cdr.cdr_location.connector_standard, 'IEC_62196_T2_COMBO');
  assert.equal(cdr.cdr_location.connector_power_type, 'DC');
  assert.equal(cdr.charging_periods.length, 1);
  assert.equal(cdr.charging_periods[0].dimensions[0].type, 'ENERGY');
  assert.equal(cdr.charging_periods[0].dimensions[0].volume, 18.4);
  assert.equal(cdr.total_cost.incl_vat, 340.4);
  assert.ok(cdr.total_cost.excl_vat < cdr.total_cost.incl_vat);
  assert.ok(cdr.last_updated);
  console.log('✓ normal session produces a valid CDR');
}

function testBharatDcConnectorMapsCorrectly() {
  const session = makeSession({
    connectorId: bharatDcConnector.id,
    stationId: 'hpcl-dadar-01',
    cpoId: 'hpcl',
  });
  const cdr = toCDR(session, station, bharatDcConnector, user);

  assert.equal(
    cdr.cdr_location.connector_standard,
    'CHADEMO',
    'BHARAT_DC_001 should map to CHADEMO (approximate OCPI equivalent)',
  );
  assert.equal(cdr.cdr_location.connector_power_type, 'DC');
  assert.equal(_testHelpers.mapConnectorStandard('BHARAT_DC_001'), 'CHADEMO');
  console.log('✓ Bharat DC connector maps correctly');
}

testNormalSessionProducesValidCdr();
testBharatDcConnectorMapsCorrectly();
console.log('\nAll CDR tests passed.');
