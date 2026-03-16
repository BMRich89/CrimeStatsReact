"use client"
import { useState } from "react";
import { Crime } from "../types/crime";
import { PostcodeInput } from "./PostcodeInput";
import { CrimeMap } from "./CrimeMap";

export function CrimePostcodeSearch() {
  const [crimes, setCrimes] = useState<Crime[]>([]);

  return (
    <>
      <PostcodeInput onCrimesLoaded={setCrimes} />
      {crimes.length > 0 && <CrimeMap crimes={crimes} />}
    </>
  );
}

