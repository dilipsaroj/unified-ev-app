export type LatLng = { lat: number; lng: number };

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** How far along the origin→destination segment a point sits, 0..1, plus km off the line. */
export function alongSegment(point: LatLng, origin: LatLng, dest: LatLng): { t: number; offsetKm: number } {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const vx = (dest.lng - origin.lng) * Math.cos(toRad((origin.lat + dest.lat) / 2));
  const vy = dest.lat - origin.lat;
  const wx = (point.lng - origin.lng) * Math.cos(toRad((origin.lat + dest.lat) / 2));
  const wy = point.lat - origin.lat;
  const len2 = vx * vx + vy * vy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2));
  const proj = {
    lat: origin.lat + t * (dest.lat - origin.lat),
    lng: origin.lng + t * (dest.lng - origin.lng),
  };
  return { t, offsetKm: haversineKm(point, proj) };
}
