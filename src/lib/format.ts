export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(0)}`;
}

export function formatCurrencyDecimal(amount: number): string {
  return `₹${amount.toFixed(1)}`;
}

export function formatKwh(kwh: number): string {
  return `${kwh.toFixed(1)} kWh`;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatPower(kw: number): string {
  return `${kw} kW`;
}

export function formatPricePerKwh(price: number): string {
  return `₹${price.toFixed(1)}/kWh`;
}
