import stations from '@/data/stations.json';
import cities from '@/data/india-cities.json';

export type PlaceValue = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

const CITY_PLACES: PlaceValue[] = (cities as PlaceValue[]).map((c) => ({
  name: c.name,
  address: c.address,
  lat: c.lat,
  lng: c.lng,
}));

const STATION_PLACES: PlaceValue[] = (
  stations as { name: string; address: string; coordinates: { lat: number; lng: number } }[]
).map((s) => ({
  name: s.name,
  address: s.address,
  lat: s.coordinates.lat,
  lng: s.coordinates.lng,
}));

export const LOCAL_PLACES: PlaceValue[] = [...CITY_PLACES, ...STATION_PLACES];

export function isInIndia(lat: number, lng: number): boolean {
  return lat >= 6.4 && lat <= 37.2 && lng >= 68.0 && lng <= 97.5;
}

export function searchLocalPlaces(query: string, limit = 8): PlaceValue[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, ' ');
  if (q.length < 2) return [];
  const tokens = q.split(' ').filter(Boolean);
  const scored = LOCAL_PLACES.map((place) => {
    const name = place.name.toLowerCase();
    const hay = `${place.name} ${place.address}`.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 90;
    else if (tokens.every((t) => hay.includes(t))) score = name.includes(tokens[0]) ? 70 : 40;
    return { place, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const seen = new Set<string>();
  const out: PlaceValue[] = [];
  for (const { place } of scored) {
    const key = `${place.lat.toFixed(3)},${place.lng.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(place);
    if (out.length >= limit) break;
  }
  return out;
}
