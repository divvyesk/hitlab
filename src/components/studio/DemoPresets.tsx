"use client";

import { motion } from "framer-motion";
import { Disc3, Loader2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { demoPresets } from "@/lib/demo-presets";
import { cn } from "@/lib/utils";

interface DemoPresetsProps {
  onSelectPreset: (presetId: string) => void;
  isAnalyzing: boolean;
  activePresetId: string | null;
}

export function DemoPresets({
  onSelectPreset,
  isAnalyzing,
  activePresetId,
}: DemoPresetsProps) {
  return (
    <section className="mb-8 sm:mb-10">
      <div className="mb-5 px-1 sm:mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-spotify-green" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-spotify-gradient">
            Try Example Songs
          </p>
        </div>
        <p className="mt-2 text-sm text-spotify-subdued">
          Load a curated Billboard-style profile and run an instant prediction.
        </p>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 lg:grid-cols-3 xl:grid-cols-5">
        {demoPresets.map((preset, index) => {
          const isActive = activePresetId === preset.id;
          const isLoading = isActive && isAnalyzing;

          return (
            <motion.button
              key={preset.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isAnalyzing}
              onClick={() => onSelectPreset(preset.id)}
              className={cn(
                "group min-w-[72vw] shrink-0 snap-center text-left sm:min-w-0",
                isAnalyzing && !isActive && "opacity-60"
              )}
            >
              <GlassCard
                glow={isActive}
                className={cn(
                  "relative h-full overflow-hidden p-0 transition-all duration-300",
                  "group-hover:ring-1 group-hover:ring-spotify-green/25",
                  isActive && "ring-1 ring-spotify-green/40"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-28 items-center justify-center bg-gradient-to-br sm:h-32",
                    preset.gradient
                  )}
                >
                  <Disc3 className="h-12 w-12 text-white/20 transition-transform duration-500 group-hover:rotate-180 sm:h-14 sm:w-14" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="truncate text-base font-bold text-white">
                      {preset.name}
                    </p>
                  </div>
                  {isLoading ? (
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-spotify-green" />
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2 p-4">
                  <p className="line-clamp-2 text-xs leading-relaxed text-spotify-subdued sm:text-sm">
                    {preset.description}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center text-xs font-semibold uppercase tracking-wide transition-colors",
                      isActive
                        ? "text-spotify-green"
                        : "text-spotify-muted group-hover:text-white"
                    )}
                  >
                    {isLoading ? "Analyzing..." : "Try preset"}
                  </span>
                </div>
              </GlassCard>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
