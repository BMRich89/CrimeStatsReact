"use client";
import { useState } from "react";
import { PageContainer } from "./components/PageContainer";
import { TitleBar } from "./components/Titlebar";
import { PostcodeInput } from "./components/PostcodeInput";
import { CrimeMap } from "./components/CrimeMap";
import { Crime } from "./types/crime";

export default function Home() {
  const [crimes, setCrimes] = useState<Crime[]>([]);

  return (
    <PageContainer>
      <TitleBar title="Crime Stats Map"/>
      <PostcodeInput onCrimesLoaded={setCrimes} />
      {crimes.length > 0 && (
        <div className="px-4">
          <p className="text-center text-sm text-gray-600 mb-2">
            {crimes.length} crime{crimes.length !== 1 ? "s" : ""} found
          </p>
          <CrimeMap crimes={crimes} />
        </div>
      )}
      {crimes.length === 0 && (
        <div className="flex items-center justify-center mt-8 text-gray-400">
          Enter a postcode above to see nearby crimes on the map.
        </div>
      )}
    </PageContainer>
  );
}
