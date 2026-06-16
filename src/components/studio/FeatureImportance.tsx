"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import type { FeatureImportance } from "@/lib/prediction";

interface FeatureImportancePanelProps {
  features: FeatureImportance[];
  predictionKey: string;
}

export function FeatureImportancePanel({
  features,
  predictionKey,
}: FeatureImportancePanelProps) {
  const topFeatures = features.slice(0, 5);

  return (
    <motion.div
      key={predictionKey}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassCard glow className="relative overflow-hidden">
        <div className="absolute -left-16 top-0 h-32 w-32 rounded-full bg-spotify-green/5 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-spotify-gradient">
            Why This Prediction?
          </p>
          <p className="mt-3 text-sm leading-relaxed text-spotify-subdued">
            These are the musical characteristics that most influenced the
            AI&apos;s prediction.
          </p>

          <div className="mt-6 space-y-4">
            {topFeatures.map((feature, i) => (
              <motion.div
                key={`${predictionKey}-${feature.name}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <span className="w-24 shrink-0 text-sm font-medium text-white sm:w-28">
                  {feature.label}
                </span>

                <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-gradient-to-r from-spotify-highlight to-spotify-card">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${feature.value}%` }}
                    transition={{
                      delay: 0.12 + i * 0.07,
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-y-0 left-0 rounded-full bg-spotify-progress-gradient shadow-[0_0_12px_rgba(29,185,84,0.35)]"
                  />
                </div>

                <span className="w-10 shrink-0 text-right font-mono text-sm font-bold text-spotify-green">
                  {feature.value}%
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
