"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HitMeterProps {
  value: number;
  className?: string;
}

export function HitMeter({ value, className }: HitMeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("relative px-1 pt-2", className)}>
      <p className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-spotify-subdued">
        Hit Probability
      </p>

      <div className="relative h-16">
        <motion.div
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
          initial={{ left: "0%" }}
          animate={{ left: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
        >
          <motion.span
            className="text-3xl font-bold tabular-nums text-spotify-green sm:text-4xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {Math.round(clamped)}
            <span className="text-xl sm:text-2xl">%</span>
          </motion.span>
          <div className="mt-1 h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-spotify-green" />
        </motion.div>
      </div>

      <div className="relative mt-1">
        <div className="h-2 overflow-hidden rounded-full bg-white/5 shadow-inner">
          <div className="h-full w-full bg-gradient-to-r from-[#e91429]/70 via-spotify-green/90 to-[#1ed760]" />
        </div>
        <div className="mt-3 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-spotify-subdued sm:text-xs">
          <span>Flop</span>
          <span className="text-spotify-muted">Hit</span>
          <span className="text-spotify-green">Mega Hit</span>
        </div>
      </div>
    </div>
  );
}
