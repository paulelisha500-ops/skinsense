import type { Metadata } from "next";
import { Conditions } from "@/components/sections/Conditions";
import { CtaBand } from "@/components/sections/CtaBand";
import { FaqTeaser } from "@/components/sections/FaqTeaser";
import { Gallery } from "@/components/sections/Gallery";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { PrivacySafety } from "@/components/sections/PrivacySafety";
import { Progress } from "@/components/sections/Progress";
import { ResultPreview } from "@/components/sections/ResultPreview";
import { Routine } from "@/components/sections/Routine";
import { StatsStrip } from "@/components/sections/StatsStrip";
import { SITE_DESCRIPTION, pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({ description: SITE_DESCRIPTION, path: "/" });

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <Conditions />
      <ResultPreview />
      <Routine />
      <Progress />
      <PrivacySafety />
      <FaqTeaser />
      <Gallery />
      <CtaBand />
    </>
  );
}
