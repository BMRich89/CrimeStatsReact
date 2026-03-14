"use client";
import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Circle, Marker, InfoWindow } from "@react-google-maps/api";
import { Crime } from "../types/crime";

type CrimeMapProps = {
  crimes: Crime[];
};

const RADIUS_METRES = 1609; // ~1 mile
const MARKER_WIDTH = 21;
const MARKER_HEIGHT = 34;

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
  // Google Maps Chart API coloured pin — falls back gracefully if blocked
  const hex = colour.replace("#", "");
  return `https://chart.googleapis.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|${hex}|ffffff`;
}

export function CrimeMap({ crimes }: CrimeMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  // Derive map centre from the first valid crime location
  const centre = React.useMemo(() => {
    const first = crimes.find(
      (c) => c.location?.latitude && c.location?.longitude
    );
    if (!first) return { lat: 51.5074, lng: -0.1278 }; // London fallback
    return {
      lat: parseFloat(first.location.latitude),
      lng: parseFloat(first.location.longitude),
    };
  }, [crimes]);

  const onUnmount = useCallback(() => {
    // no-op; required by @react-google-maps/api to avoid stale map refs
  }, []);

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
        Showing <strong>{crimes.length}</strong> crimes
      </p>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={centre}
        zoom={14}
        onUnmount={onUnmount}
      >
        {/* 1-mile radius circle */}
        <Circle
          center={centre}
          radius={RADIUS_METRES}
          options={{
            strokeColor: "#1d4ed8",
            strokeOpacity: 0.7,
            strokeWeight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        />

        {/* Crime markers */}
        {crimes.map((crime, index) => {
          if (!crime.location?.latitude || !crime.location?.longitude) return null;
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
                scaledSize: new window.google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
              }}
              onClick={() => setSelectedCrime(crime)}
            />
          );
        })}

        {/* Info window for selected crime */}
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

      {/* Colour legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(CATEGORY_COLOURS).map(([cat, colour]) => (
          <span
            key={cat}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border"
            style={{ borderColor: colour, color: colour }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: colour }}
            />
            {cat.replace(/-/g, " ")}
          </span>
        ))}
      </div>
    </div>
  );
}
