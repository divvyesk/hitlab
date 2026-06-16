"use client";

import { useCallback, useState } from "react";
import { AppMobileNav } from "@/components/layout/AppMobileNav";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Footer } from "@/components/layout/Footer";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { FeatureImportancePanel } from "@/components/studio/FeatureImportance";
import { PredictionForm } from "@/components/studio/PredictionForm";
import { PredictionResultCard } from "@/components/studio/PredictionResult";
import { SimilarSongsSection } from "@/components/studio/SimilarSongs";
import { WhatIfStudio } from "@/components/studio/WhatIfStudio";
import { SectionHeader } from "@/components/ui/section-header";
import { DemoPresets } from "@/components/studio/DemoPresets";
import { demoPresets } from "@/lib/demo-presets";
import {
  defaultSongInput,
  predictHit,
  type PredictionResult,
  type SongInput,
} from "@/lib/prediction";

export function AppDashboard() {
  const [songInput, setSongInput] = useState<SongInput>(defaultSongInput);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const runPrediction = useCallback(
    async (input: SongInput, presetId: string | null = null) => {
      setSongInput(input);
      setActivePresetId(presetId);
      setIsAnalyzing(true);
      try {
        const prediction = await predictHit(input);
        setResult(prediction);
      } catch {
        setResult(null);
      } finally {
        setIsAnalyzing(false);
      }
    },
    []
  );

  const handleSubmit = useCallback(() => {
    runPrediction(songInput);
  }, [runPrediction, songInput]);

  const handleSelectPreset = useCallback(
    (presetId: string) => {
      const preset = demoPresets.find((item) => item.id === presetId);
      if (preset) {
        runPrediction(preset.input, presetId);
      }
    },
    [runPrediction]
  );

  const handleInputChange = useCallback((input: SongInput) => {
    setSongInput(input);
    setActivePresetId(null);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-spotify-surface text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(29,185,84,0.04),transparent_50%)]" />
      <AppNavbar />
      <AppMobileNav />

      <main className="relative pt-[4.5rem] pb-24 sm:pt-24 md:pb-0">
        <section
          id="studio"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-24"
        >
          <SectionHeader
            eyebrow="Prediction Studio"
            title="Your AI hit laboratory"
            description="Fine-tune every sonic characteristic and let our model reveal your song's chart potential."
          />

          <DemoPresets
            onSelectPreset={handleSelectPreset}
            isAnalyzing={isAnalyzing}
            activePresetId={activePresetId}
          />

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
            <PredictionForm
              input={songInput}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              isAnalyzing={isAnalyzing}
            />
            {result && !isAnalyzing ? (
              <div className="flex flex-col gap-6">
                <PredictionResultCard result={result} songInput={songInput} />
                <FeatureImportancePanel
                  features={result.featureImportance}
                  predictionKey={`${result.tier}-${result.confidence}-${result.score}`}
                />
              </div>
            ) : (
              <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-white/10 bg-spotify-elevated-gradient p-8 sm:min-h-[320px] sm:p-12">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-spotify-icon-gradient sm:h-16 sm:w-16">
                    <span className="text-xl sm:text-2xl">🎵</span>
                  </div>
                  <p className="text-base font-bold text-white sm:text-lg">
                    Awaiting analysis
                  </p>
                  <p className="mt-2 text-sm text-spotify-subdued">
                    Configure your track and run a prediction
                  </p>
                </div>
              </div>
            )}
          </div>

          {result && !isAnalyzing && (
            <div className="mt-8 sm:mt-12">
              <SimilarSongsSection songInput={songInput} />
            </div>
          )}
        </section>

        <section
          id="what-if"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-24"
        >
          <SectionHeader
            eyebrow="Experiment"
            title="What-if studio"
            description="Tweak energy and intro length in real time — watch your hit probability evolve like a music scientist."
          />
          <WhatIfStudio />
        </section>

        <section
          id="analytics"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-24"
        >
          <SectionHeader
            eyebrow="Insights"
            title="Chart intelligence"
            description="Explore decades of Billboard data — genre dominance, tempo shifts, and the energy-popularity sweet spot."
          />
          <AnalyticsDashboard />
        </section>
      </main>

      <Footer />
    </div>
  );
}
