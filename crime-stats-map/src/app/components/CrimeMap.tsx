import React from 'react';
import { Marker } from 'google-maps-react';

const icon = {
  url: 'path/to/icon.png', // URL for the marker icon
  origin: new google.maps.Point(0, 0), // Origin of the image
  anchor: new google.maps.Point(15, 50), // Anchor point of the image
  scaledSize: new google.maps.Size(30, 30) // Size to scale the image to
};

const CrimeMap = () => {
  return (
    <Marker
      position={{ lat: 37.567, lng: -122.321 }}
      icon={icon}
    />
  );
};

export default CrimeMap;