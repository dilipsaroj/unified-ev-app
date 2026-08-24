import type { Connector, Session, Station } from '@prisma/client'
import type { Session as ClientSession } from '@/lib/data/types'

/** V1 deposit is always ₹50 (5000 paise). Metered billing is Layer 2. */
export const HOLD_AMOUNT_RUPEES = 50

type DbSessionWithStation = Session & {
  connector: Connector & { station: Station }
}

export function mapDbSessionToClient(session: DbSessionWithStation): ClientSession {
  return {
    id: session.id,
    userId: session.userId,
    connectorId: session.connectorId,
    stationId: session.connector.stationId,
    cpoId: session.connector.station.cpoId,
    status: session.status as ClientSession['status'],
    paymentMethod: 'UPI',
    energyKwh: session.energyKwh ?? 0,
    costAccrued: session.totalCost ?? 0,
    platformFee: 7,
    holdAmount: HOLD_AMOUNT_RUPEES,
    capturedAmount: HOLD_AMOUNT_RUPEES,
    refundAmount: 0,
    durationMins: 0,
    startedAt: (session.startedAt ?? session.createdAt).toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
    authMethod: 'APP_USER',
    totalParkingTime: 0,
    chargingPeriods: [],
    currency: 'INR',
    gstPct: 18,
  }
}
