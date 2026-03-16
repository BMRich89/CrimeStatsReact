"use client"
import { useState } from "react";
import { CrimeSearchResponse } from "../types/crime";
import { PostcodeInput } from "./PostcodeInput";
import { CrimeMap } from "./CrimeMap";

export function CrimePostcodeSearch() {
  const [searchResponse, setSearchResponse] = useState<CrimeSearchResponse | null>(null);

  return (
    <>
      <PostcodeInput onCrimesLoaded={setSearchResponse} />
      {searchResponse && searchResponse.crimes.length > 0 && (
        <CrimeMap
          crimes={searchResponse.crimes}
          searchRadiusMetres={searchResponse.searchRadiusMetres}
          searchCentreLat={searchResponse.searchCentreLat}
          searchCentreLng={searchResponse.searchCentreLng}
        />
      )}
    </>
  );
}

