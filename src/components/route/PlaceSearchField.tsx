'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { LocateFixed } from 'lucide-react';
import { searchLocalPlaces, isInIndia, type PlaceValue } from '@/lib/placesCatalog';

export type { PlaceValue };

export type PlaceSearchHandle = {
  getQuery: () => string;
  resolve: () => Promise<PlaceValue | null>;
};

interface Props {
  label: string;
  placeholder: string;
  value: PlaceValue | null;
  onChange: (place: PlaceValue | null) => void;
  onQueryChange?: (query: string) => void;
  allowCurrentLocation?: boolean;
}

function resultToPlace(result: google.maps.GeocoderResult, fallbackName: string): PlaceValue | null {
  const loc = result.geometry?.location;
  if (!loc) return null;
  const lat = loc.lat();
  const lng = loc.lng();
  if (!isInIndia(lat, lng)) return null;
  const name =
    result.address_components?.find((c) => c.types.includes('locality'))?.long_name ||
    result.address_components?.[0]?.long_name ||
    fallbackName;
  return { name, address: result.formatted_address, lat, lng };
}

function geocodeQuery(query: string): Promise<PlaceValue[]> {
  return new Promise((resolve) => {
    if (!window.google?.maps?.Geocoder) {
      resolve([]);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: query,
        componentRestrictions: { country: 'IN' },
        region: 'in',
      },
      (results, status) => {
        if (status !== 'OK' || !results?.length) {
          resolve([]);
          return;
        }
        const places = results
          .map((r) => resultToPlace(r, query))
          .filter((p): p is PlaceValue => p !== null);
        resolve(places);
      },
    );
  });
}

export const PlaceSearchField = forwardRef<PlaceSearchHandle, Props>(function PlaceSearchField(
  { label, placeholder, value, onChange, onQueryChange, allowCurrentLocation = false },
  ref,
) {
  const places = useMapsLibrary('places');
  const [query, setQuery] = useState(value?.address ?? '');
  const [googlePredictions, setGooglePredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [geoPredictions, setGeoPredictions] = useState<PlaceValue[]>([]);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const sessionRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const attrRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;

  const localPredictions = searchLocalPlaces(query);

  useImperativeHandle(ref, () => ({
    getQuery: () => queryRef.current,
    resolve: async () => {
      const q = queryRef.current.trim();
      if (value && (q === value.address || q === value.name)) return value;
      if (q.length < 2) return null;
      const local = searchLocalPlaces(q, 1)[0];
      if (local) {
        onChange(local);
        setQuery(local.address);
        return local;
      }
      const geo = (await geocodeQuery(q))[0] ?? (await geocodeQuery(`${q}, India`))[0];
      if (geo) {
        onChange(geo);
        setQuery(geo.address);
        return geo;
      }
      return value;
    },
  }));

  useEffect(() => {
    if (value?.address && value.address !== queryRef.current) {
      setQuery(value.address);
      onQueryChange?.(value.address);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.address]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setGeoPredictions([]);
      return;
    }
    const handle = window.setTimeout(() => {
      geocodeQuery(query.trim()).then((places) => {
        setGeoPredictions(places.slice(0, 5));
      });
    }, 280);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    if (!places || query.trim().length < 2) {
      setGooglePredictions([]);
      return;
    }

    const handle = window.setTimeout(() => {
      if (!sessionRef.current) {
        sessionRef.current = new places.AutocompleteSessionToken();
      }
      const service = new places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: query.trim(),
          componentRestrictions: { country: 'in' },
          sessionToken: sessionRef.current,
        },
        (results, status) => {
          if (status !== places.PlacesServiceStatus.OK || !results) {
            setGooglePredictions([]);
            return;
          }
          setGooglePredictions(results);
        },
      );
    }, 220);

    return () => window.clearTimeout(handle);
  }, [places, query]);

  function applyPlace(place: PlaceValue) {
    onChange(place);
    setQuery(place.address);
    onQueryChange?.(place.address);
    setOpen(false);
  }

  function resolveGoogle(prediction: google.maps.places.AutocompletePrediction) {
    if (!places || !attrRef.current) return;
    const service = new places.PlacesService(attrRef.current);
    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'formatted_address', 'geometry'],
        sessionToken: sessionRef.current ?? undefined,
      },
      (place, status) => {
        sessionRef.current = null;
        if (status !== places.PlacesServiceStatus.OK || !place?.geometry?.location) {
          return;
        }
        const loc = place.geometry.location;
        applyPlace({
          name: place.name || prediction.structured_formatting.main_text,
          address: place.formatted_address || prediction.description,
          lat: loc.lat(),
          lng: loc.lng(),
        });
      },
    );
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const fallback: PlaceValue = {
          name: 'Current location',
          address: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
          lat,
          lng,
        };
        if (!window.google?.maps?.Geocoder) {
          setLocating(false);
          applyPlace(fallback);
          return;
        }
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setLocating(false);
          if (status === 'OK' && results?.[0]?.formatted_address) {
            applyPlace({
              name: 'Current location',
              address: results[0].formatted_address,
              lat,
              lng,
            });
            return;
          }
          applyPlace(fallback);
        });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const showList =
    open && (localPredictions.length > 0 || geoPredictions.length > 0 || googlePredictions.length > 0);

  return (
    <div style={{ position: 'relative', zIndex: open ? 30 : 1 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--color-ink-2)',
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <input
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const firstLocal = localPredictions[0] ?? geoPredictions[0];
            if (firstLocal) applyPlace(firstLocal);
            else if (googlePredictions[0]) resolveGoogle(googlePredictions[0]);
          }
        }}
        onChange={(e) => {
          const next = e.target.value;
          setQuery(next);
          onQueryChange?.(next);
          onChange(null);
          setOpen(true);
        }}
        style={{
          width: '100%',
          padding: allowCurrentLocation ? '12px 44px 12px 16px' : '12px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          fontSize: 14,
          color: 'var(--color-ink)',
        }}
      />
      {allowCurrentLocation && (
        <button
          type="button"
          onClick={useCurrentLocation}
          aria-label="Use current location"
          title="Use current location"
          style={{
            position: 'absolute',
            right: 8,
            top: 34,
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            color: 'var(--color-brand-500)',
            cursor: locating ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocateFixed size={18} />
        </button>
      )}
      {showList && (
        <ul
          role="listbox"
          style={{
            marginTop: 4,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {localPredictions.map((place) => (
            <li key={`${place.name}-${place.lat}`} role="none">
              <button
                type="button"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applyPlace(place)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                  {place.name}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                  {place.address}
                </span>
              </button>
            </li>
          ))}
          {geoPredictions
            .filter(
              (g) =>
                !localPredictions.some(
                  (l) => Math.abs(l.lat - g.lat) < 0.02 && Math.abs(l.lng - g.lng) < 0.02,
                ),
            )
            .map((place) => (
              <li key={`geo-${place.address}`} role="none">
                <button
                  type="button"
                  role="option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyPlace(place)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                    {place.name}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    {place.address}
                  </span>
                </button>
              </li>
            ))}
          {googlePredictions
            .filter((p) => !localPredictions.some((l) => p.description.toLowerCase().includes(l.name.toLowerCase())))
            .slice(0, 4)
            .map((p) => (
              <li key={p.place_id} role="none">
                <button
                  type="button"
                  role="option"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => resolveGoogle(p)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--color-ink)' }}>
                    {p.structured_formatting.main_text}
                  </span>
                  <span style={{ display: 'block', fontSize: 12, color: 'var(--color-ink-3)', marginTop: 2 }}>
                    {p.structured_formatting.secondary_text || p.description}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
      <div ref={attrRef} />
    </div>
  );
});
