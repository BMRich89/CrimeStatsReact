// Other imports...
import React from 'react';
import { Circle } from 'some-library'; // Adjust import as necessary

const CrimeMap = ({ centre }) => {
    return (
        <Circle 
            center={{ lat: centre.lat, lng: centre.lng }} // Updated center property
            radius={500} // Adjust radius as needed
            // Other properties...
        />
    );
};

export default CrimeMap;