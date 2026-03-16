import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Crime } from '../types/crime';

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

export function CrimeMap({ crimes, searchCentreLat, searchCentreLng }: CrimeMapProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const center = {
    lat: searchCentreLat ?? 50.7527,
    lng: searchCentreLng ?? -1.8683,
  };

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
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <div className="md:w-1/2">
        {isLoaded ? (
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
            {filteredCrimes.map((crime) => (
              <Marker
                key={crime.persistent_id}
                position={{
                  lat: parseFloat(crime.location.latitude),
                  lng: parseFloat(crime.location.longitude),
                }}
                title={crime.category}
              />
            ))}
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-2 py-1 rounded text-sm border capitalize ${
                  selectedCategories.includes(category)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {category.replace(/-/g, ' ')} ({categoryCounts[category]})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[400px]">
          <h2 className="text-lg font-bold mb-2">
            Crime List ({filteredCrimes.length})
          </h2>
          <ul className="space-y-2">
            {filteredCrimes.map((crime) => (
              <li key={crime.persistent_id} className="p-2 border rounded bg-white">
                <span className="font-semibold capitalize">
                  {crime.category.replace(/-/g, ' ')}
                </span>
                <span className="text-sm text-gray-600 block">
                  {crime.location.street.name} — {crime.month}
                </span>
                {crime.outcome_status && (
                  <span className="text-sm text-gray-500">
                    {crime.outcome_status.category}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}