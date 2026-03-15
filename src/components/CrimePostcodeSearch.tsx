import React, { useState } from 'react';
import CrimeMap from './CrimeMap';

const CrimePostcodeSearch = () => {
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = async (postcode) => {
        // Logic to fetch data based on the postcode
        // Assume this returns data if successful
        const data = await fetchData(postcode);
        if (data) {
            setHasSearched(true);
            // handle the received data as needed
        }
    };

    return (
        <div>
            {/* Search input and button for users to search by postcode */}
            <input type='text' placeholder='Enter postcode' />
            <button onClick={() => performSearch(postcode)}>Search</button>

            {/* Render CrimeMap only when hasSearched is true */}
            {hasSearched && <CrimeMap />}
        </div>
    );
};

export default CrimePostcodeSearch;