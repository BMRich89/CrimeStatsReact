"use client";
import { useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { Crime } from "../types/crime";

type CrimeMapProps = {
  crimes: Crime[];
};

const SEARCH_RADIUS_METERS = 1609; // 1 mile in metres

const CATEGORY_COLOURS: Record<string, string> = {
  "anti-social-behaviour": "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  "bicycle-theft": "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  "burglary": "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
  "criminal-damage-arson": "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "drugs": "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  "other-crime": "http://maps.google.com/mapfiles/ms/icons/pink-dot.png",
  "other-theft": "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png",
  "possession-of-weapons": "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "public-order": "http://maps.google.com/mapfiles/ms/icons/orange-dot.png",
  "robbery": "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "shoplifting": "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  "theft-from-the-person": "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png",
  "vehicle-crime": "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
  "violent-crime": "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "default": "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
};

function formatCategory(category: string): string {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CrimeMap({ crimes }: CrimeMapProps) {
  const [selectedCrime, setSelectedCrime] = useState<Crime | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const center = useCallback((): google.maps.LatLngLiteral | null => {
    if (crimes.length === 0) return null;
    return {
      lat: parseFloat(crimes[0].location.latitude),
      lng: parseFloat(crimes[0].location.longitude),
    };
  }, [crimes]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-96 text-red-500">
        Failed to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading map…
      </div>
    );
  }

  const mapCenter = center();
  if (!mapCenter) return null;

  return (
    <div className="w-full h-[70vh] mt-4">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={mapCenter}
        zoom={14}
      >
        <Circle
          center={mapCenter}
          radius={SEARCH_RADIUS_METERS}
          options={{
            strokeColor: "#1d4ed8",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
          }}
        />

        {crimes.map((crime) => {
          const position: google.maps.LatLngLiteral = {
            lat: parseFloat(crime.location.latitude),
            lng: parseFloat(crime.location.longitude),
          };
          const icon =
            CATEGORY_COLOURS[crime.category] ?? CATEGORY_COLOURS["default"];

          return (
            <Marker
              key={crime.persistent_id || String(crime.id)}
              position={position}
              icon={icon}
              onClick={() => setSelectedCrime(crime)}
            />
          );
        })}

        {selectedCrime && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedCrime.location.latitude),
              lng: parseFloat(selectedCrime.location.longitude),
            }}
            onCloseClick={() => setSelectedCrime(null)}
          >
            <div className="text-black text-sm max-w-xs">
              <p className="font-bold text-base mb-1">
                {formatCategory(selectedCrime.category)}
              </p>
              <p>
                <span className="font-semibold">Location:</span>{" "}
                {selectedCrime.location.street.name}
              </p>
              <p>
                <span className="font-semibold">Month:</span>{" "}
                {selectedCrime.month}
              </p>
              {selectedCrime.outcome_status && (
                <p>
                  <span className="font-semibold">Outcome:</span>{" "}
                  {selectedCrime.outcome_status.category} (
                  {selectedCrime.outcome_status.date})
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1 break-all">
                ID: {selectedCrime.persistent_id}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
