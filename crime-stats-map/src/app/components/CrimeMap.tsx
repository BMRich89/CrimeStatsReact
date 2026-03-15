"use client"
import React from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';

export type Crime = {
  id?: string;
  category?: string;
  month?: string;
  location?: {
    latitude: string;
    longitude: string;
    street?: {
      name?: string;
    };
  };
};

type CrimeMapProps = {
  crimes?: Crime[];
  searchRadiusMetres?: number;
  searchCentreLat?: number;
  searchCentreLng?: number;
};

const DEFAULT_RADIUS_METRES = 1609; // 1 mile

const containerStyle = {
  width: '40vw',
  height: '40vw',
  margin: 'auto 10vw',
};

const circleOptions = {
  fillColor: '#4285F4',
  fillOpacity: 0.1,
  strokeColor: '#4285F4',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};

export function CrimeMap({ crimes = [], searchRadiusMetres, searchCentreLat, searchCentreLng }: CrimeMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const centre = React.useMemo(() => {
    if (searchCentreLat !== undefined && searchCentreLng !== undefined) {
      return { lat: searchCentreLat, lng: searchCentreLng };
    }
    // Only attempt to find first crime if crimes array has items
    if (crimes && crimes.length > 0) {
      const first = crimes.find(
        (c) => c.location?.latitude && c.location?.longitude
      );
      if (first) {
        return {
          lat: parseFloat(first.location!.latitude),
          lng: parseFloat(first.location!.longitude),
        };
      }
    }
    // fallback: central London
    return { lat: 51.5074, lng: -0.1278 };
  }, [crimes, searchCentreLat, searchCentreLng]);

  const radiusMetres = searchRadiusMetres ?? DEFAULT_RADIUS_METRES;

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={centre}
      zoom={13}
    >
      {/* Only render the search radius circle if we have crime data */}
      {crimes && crimes.length > 0 && (
        <Circle center={centre} radius={radiusMetres} options={circleOptions} />
      )}
      {/* Render crime markers */}
      {crimes && crimes.map((crime, index) => {
        if (!crime.location?.latitude || !crime.location?.longitude) return null;
        return (
          <Marker
            key={crime.id ?? index}
            position={{
              lat: parseFloat(crime.location.latitude),
              lng: parseFloat(crime.location.longitude),
            }}
            title={crime.category}
          />
        );
      })}
    </GoogleMap>
  ) : (
    <></>
  );
}

export default CrimeMap;