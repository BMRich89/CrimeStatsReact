import React, { useState } from 'react';
import { GeoJSON } from 'react-leaflet';

const CrimeMap = ({ crimes }) => {
    const [selectedCategories, setSelectedCategories] = useState([]);

    const handleCategoryClick = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    const filteredCrimes = selectedCategories.length > 0 
        ? crimes.filter(crime => selectedCategories.includes(crime.category)) 
        : crimes;

    const clearAllSelections = () => {
        setSelectedCategories([]);
    };

    // Render legend
    const categories = [...new Set(crimes.map(crime => crime.category))];
    const legend = (
        <div className="legend">
            {categories.map(category => (
                <div key={category} className={`legend-badge ${selectedCategories.includes(category) ? 'selected' : ''}`} onClick={() => handleCategoryClick(category)}>
                    {category}
                </div>
            ))}
            <button onClick={clearAllSelections}>Clear All</button>
        </div>
    );

    return (
        <div>
            {legend}
            <GeoJSON 
                data={filteredCrimes} 
            />
        </div>
    );
};

export default CrimeMap;