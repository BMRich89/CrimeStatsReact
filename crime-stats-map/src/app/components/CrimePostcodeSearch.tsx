"use client";
import { useState } from "react";
import { CrimeSearchResponse } from "../types/crime";
import { PostcodeInput } from "./PostcodeInput";
import { CrimeMap } from "./CrimeMap";
import { CrimeList } from "./CrimeList";

export function CrimePostcodeSearch() {
  const [searchResponse, setSearchResponse] =
    useState<CrimeSearchResponse | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      const updated = new Set(prev);
      if (updated.has(category)) {
        updated.delete(category);
      } else {
        updated.add(category);
      }
      return updated;
    });
  };

  const handleClearAll = () => {
    setSelectedCategories(new Set());
  };

  const handleCrimesLoaded = (response: CrimeSearchResponse | null) => {
    setSearchResponse(response);
    setSelectedCategories(new Set());
  };

  return (
    <>
      <PostcodeInput onCrimesLoaded={handleCrimesLoaded} />
      {searchResponse && searchResponse.crimes.length > 0 && (
        <>
          <CrimeMap
            crimes={searchResponse.crimes}
            searchRadiusMetres={searchResponse.searchRadiusMetres}
            searchCentreLat={searchResponse.searchCentreLat}
            searchCentreLng={searchResponse.searchCentreLng}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            onClearAll={handleClearAll}
          />
          <CrimeList
            crimes={searchResponse.crimes}
            selectedCategories={selectedCategories}
          />
        </>
      )}
    </>
  );
}

