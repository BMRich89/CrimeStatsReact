"use client";
import React, { useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Crime } from "../types/crime";

type CrimeMapProps = {
  crimes: Crime[];
  searchRadiusMetres?: number;
  searchCentreLat?: number;
  searchCentreLng?: number;
  selectedCategories: Set<string>;
  onCategoryToggle: (category: string) => void;
  onClearAll: () => void;
};

const MARKER_WIDTH = 21;
const MARKER_HEIGHT = 34;
const DEFAULT_SEARCH_RADIUS_METRES = 1609; // ~1 mile

const containerStyle = {
  width: "100%",
  height: "500px",
};

const CATEGORY_COLOURS: Record<string, string> = {
  "violent-crime": "#dc2626",
  "bicycle-theft": "#2563eb",
  burglary: "#d97706",
  "criminal-damage-arson": "#7c3aed",
  drugs: "#059669",
  "other-theft": "#db2777",
  "possession-of-weapons": "#9f1239",
  "public-order": "#ea580c",
  robbery: "#b91c1c",
  shoplifting: "#0891b2",
  "theft-from-the-person": "#6d28d9",
  "vehicle-crime": "#0369a1",
  "other-crime": "#4b5563",
  "anti-social-behaviour": "#ca8a04",
};

function categoryColour(category: string): string {
  return CATEGORY_COLOURS[category] ?? "#4b5563";
}

function buildPinUrl(colour: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="21" height="34" viewBox="0 0 21 34">
    <path fill="${colour}" d="M10.5 0C4.7 0 0 4.7 0 10.5 0 18.2 10.5 34 10.5 34s10.5-15.8 10.5-23.5C21 4.7 16.3 0 10.5 0z"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function CrimeMap({
  crimes,
  searchRadiusMetres,
  searchCentreLat,
  searchCentreLng,
  selectedCategories,
  onCategoryToggle,
  onClearAll,
}: CrimeMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  const centre = React.useMemo(() => {
    if (searchCentreLat !== undefined && searchCentreLng !== undefined) {
      return { lat: searchCentreLat, lng: searchCentreLng };
    }
    const first = crimes.find(
      (c) => c.location?.latitude && c.location?.longitude
    );
    if (!first) return { lat: 51.5074, lng: -0.1278 };
    return {
      lat: parseFloat(first.location.latitude),
      lng: parseFloat(first.location.longitude),
    };
  }, [crimes, searchCentreLat, searchCentreLng]);

  const radiusMetres = searchRadiusMetres ?? DEFAULT_SEARCH_RADIUS_METRES;

  const categoryCounts = React.useMemo(
    () =>
      crimes.reduce<Record<string, number>>((acc, crime) => {
        acc[crime.category] = (acc[crime.category] ?? 0) + 1;
        return acc;
      }, {}),
    [crimes]
  );

  const sortedCategories = React.useMemo(
    () => Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]),
    [categoryCounts]
  );

  const filteredCrimes = React.useMemo(() => {
    if (selectedCategories.size === 0) return crimes;
    return crimes.filter((crime) => selectedCategories.has(crime.category));
  }, [crimes, selectedCategories]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded">
        <p className="text-gray-500">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-sm text-gray-600 mb-2">
        Showing <strong>{filteredCrimes.length}</strong> crimes
      </p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centre}
        zoom={14}
      >
        <Circle
          center={centre}
          radius={radiusMetres}
          options={{
            strokeColor: "#1d4ed8",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        />

        {filteredCrimes.map((crime, index) => {
          if (!crime.location?.latitude || !crime.location?.longitude) {
            return null;
          }
          const position = {
            lat: parseFloat(crime.location.latitude),
            lng: parseFloat(crime.location.longitude),
          };
          const colour = categoryColour(crime.category);
          return (
            <Marker
              key={crime.persistent_id || index}
              position={position}
              icon={{
                url: buildPinUrl(colour),
                origin: new window.google.maps.Point(0, 0),
                anchor: new window.google.maps.Point(
                  MARKER_WIDTH / 2,
                  MARKER_HEIGHT
                ),
                scaledSize: new window.google.maps.Size(
                  MARKER_WIDTH,
                  MARKER_HEIGHT
                ),
              }}
              onClick={() => setSelectedCrime(crime)}
            />
          );
        })}

        {selectedCrime && selectedCrime.location?.latitude && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedCrime.location.latitude),
              lng: parseFloat(selectedCrime.location.longitude),
            }}
            onCloseClick={() => setSelectedCrime(null)}
          >
            <div className="text-sm text-gray-800 space-y-1 max-w-xs">
              <p>
                <strong>Category:</strong>{" "}
                {selectedCrime.category.replace(/-/g, " ")}
              </p>
              <p>
                <strong>Street:</strong>{" "}
                {selectedCrime.location.street?.name ?? "Unknown"}
              </p>
              <p>
                <strong>Month:</strong> {selectedCrime.month}
              </p>
              <p>
                <strong>Outcome:</strong>{" "}
                {selectedCrime.outcome_status?.category ?? "Not recorded"}
              </p>
              {selectedCrime.persistent_id && (
                <p className="text-xs text-gray-500 break-all">
                  <strong>ID:</strong> {selectedCrime.persistent_id}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Colour legend with counts and filtering */}
      <div className="mt-3">
        <div className="flex flex-wrap gap-2">
          {sortedCategories.map(([cat, count]) => {
            const colour = categoryColour(cat);
            const isSelected = selectedCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border cursor-pointer transition-all"
                style={{
                  borderColor: colour,
                  color: colour,
                  backgroundColor: isSelected ? `${colour}20` : "transparent",
                  fontWeight: isSelected ? "bold" : "normal",
                  opacity: isSelected ? 1 : 0.6,
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: colour }}
                />
                {cat.replace(/-/g, " ")}
                <span className="ml-1 font-semibold">{count}</span>
              </button>
            );
          })}
        </div>
        {selectedCategories.size > 0 && (
          <button
            onClick={onClearAll}
            className="mt-2 px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded text-gray-800"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  );
}