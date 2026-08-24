import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const OCM_API_KEY = process.env.OCM_API_KEY;
if (!OCM_API_KEY || OCM_API_KEY === 'REPLACE_ME') {
  throw new Error('OCM_API_KEY is missing from .env — add it before seeding');
}

type OcmConnection = {
  ConnectionTypeID?: number;
  PowerKW?: number;
};

type OcmStation = {
  AddressInfo?: {
    Latitude?: number;
    Longitude?: number;
    Title?: string;
    AddressLine1?: string;
    Town?: string;
    StateOrProvince?: string;
  };
  OperatorInfo?: { Title?: string };
  Connections?: OcmConnection[];
};

function mapConnectorType(ocmTypeId: number): string {
  const map: Record<number, string> = {
    25: 'CCS_2',
    2: 'CHADEMO',
    3: 'TYPE_2_AC',
    26: 'BHARAT_AC_001',
    27: 'BHARAT_DC_001',
  };
  return map[ocmTypeId] || 'TYPE_2_AC';
}

async function fetchIndiaStations(): Promise<OcmStation[]> {
  const url = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=IN&maxresults=500&compact=true&verbose=false&key=${OCM_API_KEY}`;
  const res = await fetch(url);
  return res.json() as Promise<OcmStation[]>;
}

async function main() {
  console.log('Seeding stations from Open Charge Map...');

  const cpos = await Promise.all([
    prisma.cPO.upsert({
      where: { slug: 'chargezone' },
      update: {},
      create: { name: 'ChargeZone', slug: 'chargezone', chipColor: '#F97316' },
    }),
    prisma.cPO.upsert({
      where: { slug: 'bolt-earth' },
      update: {},
      create: { name: 'Bolt.Earth', slug: 'bolt-earth', chipColor: '#10b981' },
    }),
    prisma.cPO.upsert({
      where: { slug: 'statiq' },
      update: {},
      create: { name: 'Statiq', slug: 'statiq', chipColor: '#3B82F6' },
    }),
    prisma.cPO.upsert({
      where: { slug: 'tata-power' },
      update: {},
      create: { name: 'Tata Power', slug: 'tata-power', chipColor: '#6366F1' },
    }),
    prisma.cPO.upsert({
      where: { slug: 'others' },
      update: {},
      create: { name: 'Others', slug: 'others', chipColor: '#94A3B8' },
    }),
  ]);

  const stations = await fetchIndiaStations();
  console.log(`Fetched ${stations.length} stations from OCM`);

  let created = 0;

  for (const station of stations) {
    try {
      if (!station.AddressInfo?.Latitude || !station.AddressInfo?.Longitude) continue;

      const operatorName = station.OperatorInfo?.Title?.toLowerCase() || '';
      let cpo = cpos[4];
      if (operatorName.includes('chargezone')) cpo = cpos[0];
      else if (operatorName.includes('bolt')) cpo = cpos[1];
      else if (operatorName.includes('statiq')) cpo = cpos[2];
      else if (operatorName.includes('tata')) cpo = cpos[3];

      const connections = station.Connections || [];
      if (connections.length === 0) continue;

      await prisma.station.create({
        data: {
          cpoId: cpo.id,
          name: station.AddressInfo.Title || 'EV Charging Station',
          address: [
            station.AddressInfo.AddressLine1,
            station.AddressInfo.Town,
            station.AddressInfo.StateOrProvince,
          ]
            .filter(Boolean)
            .join(', '),
          lat: station.AddressInfo.Latitude,
          lng: station.AddressInfo.Longitude,
          amenities: [],
          connectors: {
            create: connections.slice(0, 4).map((conn) => ({
              type: mapConnectorType(conn.ConnectionTypeID ?? 0) as
                | 'CCS_2'
                | 'CHADEMO'
                | 'TYPE_2_AC'
                | 'BHARAT_AC_001'
                | 'BHARAT_DC_001',
              maxPowerKw: conn.PowerKW || 7.4,
              pricePerKwh: 18,
              status: 'AVAILABLE' as const,
              reliabilityScore: Math.floor(Math.random() * 30) + 70,
              reliabilityTier: Math.random() > 0.3 ? 'green' : Math.random() > 0.5 ? 'amber' : 'red',
              sampleSize: 5,
            })),
          },
        },
      });

      created++;
      if (created % 50 === 0) console.log(`Created ${created} stations...`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes('Unique constraint')) {
        console.error('Station insert error:', message);
      }
    }
  }

  console.log(`Done. Created ${created} stations.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
