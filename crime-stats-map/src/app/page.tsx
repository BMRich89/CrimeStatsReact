"use client";
import { PageContainer } from "./components/PageContainer";
import { TitleBar } from "./components/Titlebar";
import { CrimePostcodeSearch } from "./components/CrimePostcodeSearch";

export default function Home() {
  return (
    <PageContainer>
      <TitleBar title="Postcode Health Checker" />
      <CrimePostcodeSearch />
    </PageContainer>
  );
}
