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
      <TitleBar title="Crime Stats Map" />
      <PostcodeInput onCrimesLoaded={setCrimes} />
      {crimes.length > 0 && <CrimeMap crimes={crimes} />}
    </PageContainer>
  );
}
