#!/usr/bin/env node

/**
 * Fetch route polylines from Google Directions API
 * Run with: node scripts/fetch-routes.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read API key from .env.local
const envPath = join(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="?([^"\n]+)"?/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1] : '';

const routes = [
  {
    id: 'mumbai-pune',
    originName: 'Mumbai',
    originCoords: { lat: 19.076, lng: 72.877 },
    destinationName: 'Pune',
    destinationCoords: { lat: 18.520, lng: 73.856 },
    distanceKm: 148,
    durationMins: 195,
    chargingStopStationId: 'tp-lonavala-01',
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

async function fetchPolyline(origin, destination) {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`API error: ${data.status} - ${data.error_message || ''}`);
  }

  return data.routes[0].overview_polyline.encoded_polyline;
}

async function main() {
  console.log('🗺️  Fetching route polylines...\n');

  const result = [];

  for (const route of routes) {
    try {
      console.log(`Fetching ${route.originName} → ${route.destinationName}...`);
      const polylineEncoded = await fetchPolyline(route.originCoords, route.destinationCoords);
      
      result.push({
        ...route,
        polylineEncoded,
      });
      
      console.log(`✓ Done (${polylineEncoded.length} chars)\n`);
    } catch (error) {
      console.error(`✗ Failed:`, error.message);
      process.exit(1);
    }
  }

  console.log('\n📄 routes.json content:\n');
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
