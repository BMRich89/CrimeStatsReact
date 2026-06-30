"use client";
import { PageContainer } from "./components/PageContainer";
import { TitleBar } from "./components/Titlebar";
import { HomePage } from "./components/NewHomePageConcept";

export default function Home() {
  return (
    <PageContainer>
      <TitleBar title="Postcode Health Checker" />
      <HomePage />
    </PageContainer>
  );
}
