import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import { Crime } from '../types/crime';

const CATEGORY_COLORS: Record<string, string> = {
  'anti-social-behaviour':    '#ef4444',
  'bicycle-theft':            '#f97316',
  'burglary':                 '#eab308',
  'criminal-damage-arson':    '#22c55e',
  'drugs':                    '#14b8a6',
  'other-crime':              '#6366f1',
  'other-theft':              '#ec4899',
  'possession-of-weapons':    '#dc2626',
  'public-order':             '#f59e0b',
  'robbery':                  '#7c3aed',
  'shoplifting':              '#0ea5e9',
  'theft-from-the-person':    '#84cc16',
  'vehicle-crime':            '#06b6d4',
  'violent-crime':            '#e11d48',
  'violence-and-sexual-offences': '#be123c',
};

const getCategoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? '#6b7280';

// SVG path for a 16 px-diameter circle, used as a map marker symbol
const CIRCLE_PATH = 'M -8 0 A 8 8 0 1 0 8 0 A 8 8 0 1 0 -8 0';

const makePinIcon = (color: string) => {
  const size = 20;
  const r = 8;
  const cx = size / 2;
  const cy = size / 2;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${cx}' cy='${cy}' r='${r}' fill='${color}' stroke='#ffffff' stroke-width='2'/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

type CrimeMapProps = {
  crimes: Crime[];
  searchRadiusMetres?: number;
  searchCentreLat?: number;
  searchCentreLng?: number;
};

const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

// Bournemouth pier – a sensible fallback centre for UK crime data
const DEFAULT_CENTER_LAT = 50.7527;
const DEFAULT_CENTER_LNG = -1.8683;
const DEFAULT_ZOOM_LEVEL = 14;

export function CrimeMap({ crimes, searchRadiusMetres, searchCentreLat, searchCentreLng }: CrimeMapProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [activeCrime, setActiveCrime] = useState<Crime | null>(null);
  const [activeGroup, setActiveGroup] = useState<Crime[] | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const center = {
    lat: searchCentreLat ?? DEFAULT_CENTER_LAT,
    lng: searchCentreLng ?? DEFAULT_CENTER_LNG,
  };

  // InfoWindow options (offset vertically so marker remains visible)
  const infoWindowOptions = isLoaded && (window as any).google
    ? { pixelOffset: new (window as any).google.maps.Size(0, -15) }
    : undefined;

  const categories = [...new Set(crimes.map((crime) => crime.category))];

  const categoryCounts = crimes.reduce<Record<string, number>>((acc, crime) => {
    acc[crime.category] = (acc[crime.category] ?? 0) + 1;
    return acc;
  }, {});

  const filteredCrimes =
    selectedCategories.length > 0
      ? crimes.filter((crime) => selectedCategories.includes(crime.category))
      : crimes;

  const toggleCategory = (category: string) => {
    // Multi-select: toggle category membership in the selected list
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Assign a stable key to every crime (some crimes have an empty persistent_id)
  const crimeKeys = React.useMemo(
    () => new Map(crimes.map((crime, index) => [crime, crime.persistent_id || `crime-${index}`])),
    [crimes]
  );

  // Pre-parse coordinates once so Markers and InfoWindow both reuse the same values
  const crimePositions = React.useMemo(
    () =>
      new Map(
        crimes.map((crime) => [
          crimeKeys.get(crime)!,
          {
            lat: parseFloat(crime.location.latitude),
            lng: parseFloat(crime.location.longitude),
          },
        ])
      ),
    [crimes, crimeKeys]
  );

  // Helper: build a data URL SVG for a multi-colour pie marker
  const makeMultiPinIcon = (categories: string[]) => {
    const size = 28;
    const r = 10;
    const cx = size / 2;
    const cy = size / 2;
    const total = categories.length;
    const segments = categories.map((cat, i) => {
      const start = (i / total) * Math.PI * 2 - Math.PI / 2;
      const end = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      const large = end - start > Math.PI ? 1 : 0;
      const color = getCategoryColor(cat);
      return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${color}" stroke="#ffffff" stroke-width="0.5"/>`;
    }).join('');

    const outer = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#fff" stroke-width="1"/>`;
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${segments}${outer}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // Group filtered crimes by exact lat/lng (memoized at top-level to avoid conditional hooks)
  const groupedLocations = React.useMemo(() => {
    const groups = new Map<string, { pos: { lat: number; lng: number }; crimes: Crime[] }>();
    for (const crime of filteredCrimes) {
      const lat = parseFloat(crime.location.latitude);
      const lng = parseFloat(crime.location.longitude);
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      const entry = groups.get(key);
      if (entry) entry.crimes.push(crime);
      else groups.set(key, { pos: { lat, lng }, crimes: [crime] });
    }
    return Array.from(groups.values());
  }, [filteredCrimes]);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="md:w-1/2">
        {isLoaded ? (
            <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={DEFAULT_ZOOM_LEVEL}
              onClick={() => { setActiveCrime(null); setActiveGroup(null); }}
          >
            {groupedLocations.map((g, idx) => {
              if (g.crimes.length === 1) {
                const crime = g.crimes[0];
                return (
                  <Marker
                    key={crimeKeys.get(crime) ?? `crime-${idx}`}
                    position={g.pos}
                    title={crime.category}
                    icon={makePinIcon(getCategoryColor(crime.category))}
                    onClick={() => { setActiveCrime(crime); setActiveGroup(null); }}
                  />
                );
              }

              const cats = Array.from(new Set(g.crimes.map((c) => c.category)));
              // If all crimes here share the same category, show a normal coloured pin
              if (cats.length === 1) {
                const color = getCategoryColor(cats[0]);
                return (
                  <Marker
                    key={`group-${idx}-${g.crimes.length}`}
                    position={g.pos}
                    title={`${g.crimes.length} crimes (${cats[0].replace(/-/g, ' ')})`}
                    icon={makePinIcon(color)}
                    onClick={() => { setActiveGroup(g.crimes); setActiveCrime(null); }}
                  />
                );
              }

              const icon = makeMultiPinIcon(cats);
              return (
                <Marker
                  key={`group-${idx}-${g.crimes.length}`}
                  position={g.pos}
                  title={`${g.crimes.length} crimes`}
                  icon={icon}
                  onClick={() => { setActiveGroup(g.crimes); setActiveCrime(null); }}
                />
              );
            })}
            {searchRadiusMetres && (
              <Circle
                center={center}
                radius={searchRadiusMetres}
                options={{
                  fillColor: '#2563eb',
                  fillOpacity: 0.12,
                  strokeColor: '#2563eb',
                  strokeOpacity: 0.7,
                  strokeWeight: 2,
                }}
              />
            )}
            {activeCrime && (
              <InfoWindow
                position={crimePositions.get(crimeKeys.get(activeCrime)!)!}
                onCloseClick={() => setActiveCrime(null)}
                options={infoWindowOptions}
              >
                <div className="text-sm text-gray-900">
                  <p className="font-semibold capitalize mb-1">
                    {activeCrime.category.replace(/-/g, ' ')}
                  </p>
                  <p className="text-gray-700">{activeCrime.location.street.name}</p>
                  <p className="text-gray-600">{activeCrime.month}</p>
                  {activeCrime.outcome_status && (
                    <p className="mt-1 text-gray-600">{activeCrime.outcome_status.category}</p>
                  )}
                </div>
              </InfoWindow>
            )}
            {activeGroup && (
              <InfoWindow
                position={{
                  lat: parseFloat(activeGroup[0].location.latitude),
                  lng: parseFloat(activeGroup[0].location.longitude),
                }}
                onCloseClick={() => setActiveGroup(null)}
                options={infoWindowOptions}
              >
                <div className="text-sm text-gray-900">
                  <p className="font-semibold mb-2">{activeGroup.length} crimes at this location</p>
                  <ul className="text-xs space-y-1 max-h-48 overflow-auto">
                    {activeGroup.map((c, i) => (
                      <li key={c.persistent_id || i} className="border-b pb-1">
                        <div className="font-medium capitalize">{c.category.replace(/-/g, ' ')}</div>
                        <div className="text-gray-600">{c.location.street.name} — {c.month}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : (
          <div className="h-[500px] flex items-center justify-center bg-gray-100 rounded">
            Loading map…
          </div>
        )}
      </div>

      <div className="md:w-1/2 flex flex-col gap-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Categories</h2>
            {selectedCategories.length > 0 && (
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => setSelectedCategories([])}
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm border capitalize font-medium ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-900 border-gray-300'
                  }`}
                >
                  <span
                    className="inline-block w-3 h-3 rounded-full flex-shrink-0 border-2"
                    style={
                      isSelected
                        ? { backgroundColor: getCategoryColor(category), borderColor: 'transparent' }
                        : { backgroundColor: 'transparent', borderColor: getCategoryColor(category) }
                    }
                  />
                  {category.replace(/-/g, ' ')} ({categoryCounts[category]})
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-bold mb-2">
            Crime List ({filteredCrimes.length})
          </h2>
          <ul className="space-y-2">
            {filteredCrimes.map((crime) => (
              <li key={crimeKeys.get(crime)} className="p-2 border rounded bg-white flex items-start gap-2">
                <span
                  className="mt-1 inline-block w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(crime.category) }}
                />
                <div>
                  <span className="font-semibold capitalize text-gray-900">
                    {crime.category.replace(/-/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-700 block">
                    {crime.location.street.name} — {crime.month}
                  </span>
                  {crime.outcome_status && (
                    <span className="text-sm text-gray-600">
                      {crime.outcome_status.category}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}