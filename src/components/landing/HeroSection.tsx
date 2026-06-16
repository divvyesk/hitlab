"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroGlow,
  useMouseParallax,
  WaveformBackground,
} from "./hero-effects";

export function HeroSection() {
  const parallax = useMouseParallax(8);

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <WaveformBackground />
      <HeroGlow />

      <div className="relative z-10 mx-auto flex flex-1 w-full max-w-5xl flex-col items-center justify-center px-4 pb-6 pt-2 text-center sm:px-6 md:px-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-spotify-gradient sm:mb-6 sm:text-[13px] sm:tracking-[0.28em]"
        >
          HitLab AI
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ x: parallax.x * 0.15, y: parallax.y * 0.15 }}
          className="text-[clamp(2rem,9vw,5.5rem)] font-semibold leading-[1.05] tracking-[-0.03em] sm:leading-[1.02]"
        >
          <span className="text-white">Predict the next</span>
          <br />
          <span className="text-white">Billboard </span>
          <span
            className="text-hit-colorful font-bold"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            HIT
          </span>
          <span className="text-white">.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 max-w-xl text-base leading-relaxed text-spotify-subdued sm:mt-7 sm:text-[clamp(1.05rem,2.5vw,1.35rem)]"
        >
          AI-powered analysis that reveals what makes songs dominate the charts.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:mt-12 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4"
        >
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full sm:h-14 sm:px-10">
              Analyze a Song
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/signup" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="h-12 w-full sm:h-14 sm:px-10">
              <BarChart3 className="h-4 w-4" />
              Explore Data
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
