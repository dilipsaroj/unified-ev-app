/**
 * One-time script to generate route polylines from Google Directions API
 * Run with: npx tsx scripts/generate-routes.ts
 */

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface RouteConfig {
  id: string;
  originName: string;
  originCoords: { lat: number; lng: number };
  destinationName: string;
  destinationCoords: { lat: number; lng: number };
  distanceKm: number;
  durationMins: number;
  chargingStopStationId: string;
  alternativeStationIds: string[];
}

const routes: Omit<RouteConfig, 'polylineEncoded'>[] = [
  {
    id: 'mumbai-pune',
    originName: 'Mumbai',
    originCoords: { lat: 19.076, lng: 72.877 },
    destinationName: 'Pune',
    destinationCoords: { lat: 18.520, lng: 73.856 },
    distanceKm: 148,
    durationMins: 195,
    chargingStopStationId: 'tp-lonavala-01', // Will create this station
    alternativeStationIds: ['statiq-lonavala-01', 'jio-khandala-01'],
  },
  {
    id: 'delhi-jaipur',
    originName: 'Delhi',
    originCoords: { lat: 28.6139, lng: 77.2090 },
    destinationName: 'Jaipur',
    destinationCoords: { lat: 26.9124, lng: 75.7873 },
    distanceKm: 280,
    durationMins: 330,
    chargingStopStationId: 'tp-neemrana-01',
    alternativeStationIds: ['iocl-neemrana-01', 'hpcl-kotputli-01'],
  },
  {
    id: 'bengaluru-mysore',
    originName: 'Bengaluru',
    originCoords: { lat: 12.9716, lng: 77.5946 },
    destinationName: 'Mysore',
    destinationCoords: { lat: 12.2958, lng: 76.6394 },
    distanceKm: 145,
    durationMins: 180,
    chargingStopStationId: 'statiq-mandya-01',
    alternativeStationIds: ['tp-mandya-01', 'jio-srirangapatna-01'],
  },
];

async function fetchPolyline(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): Promise<string> {
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  url.searchParams.set('key', GOOGLE_API_KEY!);
  url.searchParams.set('mode', 'driving');

  const response = await fetch(url.toString());
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`Google Directions API error: ${data.status} - ${data.error_message || 'Unknown error'}`);
  }

  const route = data.routes[0];
  if (!route) {
    throw new Error('No routes found');
  }

  return route.overview_polyline.encoded_polyline;
}

async function generateRoutes() {
  console.log('🗺️  Generating routes with Google Directions API...\n');

  const routesWithPolylines: RouteConfig[] = [];

  for (const route of routes) {
    console.log(`Fetching polyline for ${route.originName} → ${route.destinationName}...`);
    
    try {
      const polylineEncoded = await fetchPolyline(route.originCoords, route.destinationCoords);
      
      routesWithPolylines.push({
        ...route,
        polylineEncoded,
      } as RouteConfig);
      
      console.log(`✓ ${route.id}: ${polylineEncoded.substring(0, 50)}...\n`);
    } catch (error) {
      console.error(`✗ Failed to fetch ${route.id}:`, error);
      process.exit(1);
    }
  }

  console.log('\n📄 Generated routes.json:\n');
  console.log(JSON.stringify(routesWithPolylines, null, 2));
  
  console.log('\n✓ Copy the output above to src/data/routes.json');
}

generateRoutes().catch(console.error);
