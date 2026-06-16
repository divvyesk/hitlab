"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { HitMeter } from "@/components/studio/HitMeter";
import { SongDnaRadarChart } from "@/components/studio/SongDnaRadarChart";
import type { HitTier, PredictionResult, SongInput } from "@/lib/prediction";
import { formatTierLabel } from "@/lib/prediction-tiers";

const tierOrder: HitTier[] = ["SHORT", "MODERATE", "SUSTAINED"];

interface PredictionResultCardProps {
  result: PredictionResult;
  songInput: SongInput;
}

const tierStyles: Record<string, string> = {
  SUSTAINED:
    "bg-spotify-green-gradient text-black shadow-[0_0_40px_rgba(29,185,84,0.35)]",
  MODERATE:
    "bg-gradient-to-r from-spotify-green/90 to-spotify-green-dark/90 text-white",
  SHORT:
    "bg-spotify-card-gradient text-white border border-white/10",
};

export function PredictionResultCard({
  result,
  songInput,
}: PredictionResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard glow className="relative overflow-hidden text-center">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-spotify-gradient">
          Your Song Analysis
        </p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`my-4 inline-block max-w-full rounded-full px-5 py-3 text-xl font-bold tracking-tight sm:my-6 sm:px-8 sm:py-4 sm:text-3xl md:text-4xl ${tierStyles[result.tier]}`}
        >
          {formatTierLabel(result.tier)}
        </motion.div>

        <p className="mx-auto max-w-md text-xs text-spotify-subdued sm:text-sm">
          {tierOrder
            .map(
              (tier) =>
                `${tier} ${Math.round((result.probabilities[tier] ?? 0) * 100)}%`
            )
            .join(" · ")}
        </p>

        <HitMeter value={result.score} className="mx-auto max-w-md px-2" />

        <div className="mt-6 border-t border-white/5 pt-6 sm:mt-8">
          <SongDnaRadarChart input={songInput} />
        </div>

        <div className="mt-6 rounded-lg bg-spotify-card-gradient p-3 sm:mt-8 sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-spotify-subdued sm:text-xs">
            Chart Performance
          </p>
          <p className="mt-1 text-lg font-bold leading-tight text-white sm:text-2xl">
            {result.chartWeeks}
          </p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
