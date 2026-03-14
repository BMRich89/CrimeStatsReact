"use client"
import { useState } from "react";
import { CrimeMap, Crime } from "./CrimeMap";
import { PostcodeInput } from "./PostcodeInput";

type CrimeSearchResponse = {
  crimes: Crime[];
  searchRadiusMetres?: number;
  searchCentreLat?: number;
  searchCentreLng?: number;
};

export function CrimePostcodeSearch() {

  const [postcode, setPostCode] = useState("");
  const [crimeData, setCrimeData] = useState<CrimeSearchResponse>({ crimes: [] });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (formData.get("postcode") === null || formData.get("postcode") === "") {
      return;
    }
    const postcodeValue = formData.get("postcode") as string;
    const cleanedPostcode = postcodeValue.replace(/\s+/g, '');
    fetch(`/api/crime?postcode=${cleanedPostcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data: CrimeSearchResponse) => {
      setCrimeData(data);
    })
    .catch(() => {
      // Handle the error, e.g., show an error message to the user
    });
  };

  return (<>
    <form method="post" onSubmit={handleSubmit}>
      <PostcodeInput Postcode={postcode} SetPostcode={(p: string) => setPostCode(p)} />
    </form>
    <CrimeMap
      crimes={crimeData.crimes}
      searchRadiusMetres={crimeData.searchRadiusMetres}
      searchCentreLat={crimeData.searchCentreLat}
      searchCentreLng={crimeData.searchCentreLng}
    />
  </>
  );
}

