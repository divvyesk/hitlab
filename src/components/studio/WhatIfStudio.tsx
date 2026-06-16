"use client";

import { motion } from "framer-motion";
import { FlaskConical, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HitMeter } from "@/components/studio/HitMeter";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  predictHit,
  type PredictionResult,
  type SongInput,
} from "@/lib/prediction";
import { whatIfBaselineInput } from "@/lib/similar-songs-data";
import { formatScore } from "@/lib/utils";
import { formatTierLabel } from "@/lib/prediction-tiers";

export function WhatIfStudio() {
  const [whatIf, setWhatIf] = useState({
    energy: whatIfBaselineInput.energy,
    introLengthSec: whatIfBaselineInput.introLengthSec,
  });
  const [baseResult, setBaseResult] = useState<PredictionResult | null>(null);
  const [modifiedResult, setModifiedResult] = useState<PredictionResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const baselineInput: SongInput = whatIfBaselineInput;

  const modifiedInput: SongInput = useMemo(
    () => ({
      ...whatIfBaselineInput,
      energy: whatIf.energy,
      introLengthSec: whatIf.introLengthSec,
    }),
    [whatIf.energy, whatIf.introLengthSec]
  );

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const [base, modified] = await Promise.all([
          predictHit(baselineInput),
          predictHit(modifiedInput),
        ]);
        if (!cancelled) {
          setBaseResult(base);
          setModifiedResult(modified);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [baselineInput, modifiedInput]);

  const scoreDelta =
    baseResult && modifiedResult
      ? Math.round((modifiedResult.score - baseResult.score) * 100) / 100
      : 0;

  return (
    <GlassCard glow className="relative overflow-hidden">
      <div className="relative mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-icon-gradient">
          <FlaskConical className="h-5 w-5 text-black" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">What-If Studio</h3>
          <p className="text-sm text-spotify-subdued">
            What happens if we change your song?
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-lg bg-spotify-card-gradient p-5">
            <div className="mb-4 flex items-center justify-between">
              <Label>Energy</Label>
              <span className="font-mono text-sm">
                <span className="text-spotify-muted">
                  {whatIfBaselineInput.energy}
                </span>
                <span className="mx-2 text-spotify-highlight">→</span>
                <span className="font-bold text-spotify-green">
                  {whatIf.energy}
                </span>
              </span>
            </div>
            <Slider
              value={[whatIf.energy]}
              min={20}
              max={100}
              step={1}
              onValueChange={([v]) =>
                setWhatIf((prev) => ({ ...prev, energy: v }))
              }
            />
          </div>

          <div className="rounded-lg bg-spotify-card-gradient p-5">
            <div className="mb-4 flex items-center justify-between">
              <Label>Intro Length</Label>
              <span className="font-mono text-sm">
                <span className="text-spotify-muted">
                  {whatIfBaselineInput.introLengthSec}s
                </span>
                <span className="mx-2 text-spotify-highlight">→</span>
                <span className="font-bold text-spotify-green">
                  {whatIf.introLengthSec}s
                </span>
              </span>
            </div>
            <Slider
              value={[whatIf.introLengthSec]}
              min={0}
              max={60}
              step={1}
              onValueChange={([v]) =>
                setWhatIf((prev) => ({ ...prev, introLengthSec: v }))
              }
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <motion.div
            key={`${modifiedResult?.tier ?? "loading"}-${modifiedResult?.score ?? 0}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl bg-spotify-card-gradient p-5 text-center ring-1 ring-spotify-green/10 sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-spotify-subdued">
              Live prediction
            </p>
            {loading || !modifiedResult ? (
              <p className="mt-6 text-sm text-spotify-subdued">Running model...</p>
            ) : (
              <>
                <p className="mt-3 text-2xl font-bold text-spotify-gradient sm:mt-4 sm:text-3xl md:text-4xl">
                  {formatTierLabel(modifiedResult.tier)}
                </p>
                <div className="mt-4 sm:mt-6">
                  <HitMeter value={modifiedResult.score} />
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
                  <TrendingUp
                    className={`h-5 w-5 ${scoreDelta >= 0 ? "text-spotify-green" : "text-red-400"}`}
                  />
                  <span
                    className={`text-lg font-bold ${scoreDelta >= 0 ? "text-spotify-green" : "text-red-400"}`}
                  >
                    {scoreDelta >= 0 ? "+" : ""}
                    {formatScore(scoreDelta)} pts
                  </span>
                  <span className="text-sm text-spotify-subdued sm:text-base">
                    vs baseline
                  </span>
                </div>
                <p className="mt-3 text-xs text-spotify-subdued sm:mt-4 sm:text-sm">
                  {modifiedResult.chartWeeks} on chart
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}
