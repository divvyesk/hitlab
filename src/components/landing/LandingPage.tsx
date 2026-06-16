"use client";

import { LandingNavbar } from "@/components/layout/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";

export function LandingPage() {
  return (
    <div className="relative h-[100dvh] overflow-hidden bg-spotify-surface text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(29,185,84,0.04),transparent_50%)]" />
      <LandingNavbar />
      <main className="relative h-full pt-[4.5rem] sm:pt-20">
        <HeroSection />
      </main>
    </div>
  );
}
