"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface WaveBar {
  id: string;
  height: number;
  duration: number;
  delay: number;
  opacity: number;
}

function createWaveBars(count: number, layer: number): WaveBar[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.85);
    const wave =
      Math.sin(i * 0.38 + layer * 1.7) * 0.22 +
      Math.cos(i * 0.11 + layer) * 0.14;
    const height = Math.round((18 + envelope * 62 + wave * 18) * 10) / 10;
    const duration =
      Math.round((3.2 + (i % 13) * 0.18 + layer * 0.4) * 10) / 10;
    const delay = Math.round((i * 0.035 + layer * 0.6) * 10) / 10;
    const opacity = Math.round((0.25 + envelope * 0.45) * 100) / 100;

    return { id: `${layer}-${i}`, height, duration, delay, opacity };
  });
}

const PRIMARY_BARS = createWaveBars(100, 0);
const DEPTH_BARS = createWaveBars(72, 1);
const AMBIENT_BARS = createWaveBars(48, 2);

function WaveLayer({
  bars,
  className,
  maxHeight = "85%",
}: {
  bars: WaveBar[];
  className?: string;
  maxHeight?: string;
}) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 flex items-end justify-center gap-[2px] md:gap-[3px] ${className ?? ""}`}
      style={{ height: maxHeight }}
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="waveform-bar min-w-[2px] flex-1 rounded-full"
          style={
            {
              "--bar-height": `${bar.height}%`,
              "--bar-opacity": bar.opacity,
              animationDuration: `${bar.duration}s`,
              animationDelay: `${bar.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function WaveformBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <WaveLayer
        bars={AMBIENT_BARS}
        maxHeight="100%"
        className="opacity-30 blur-[2px]"
      />
      <WaveLayer
        bars={DEPTH_BARS}
        maxHeight="92%"
        className="opacity-50 blur-[1px]"
      />
      <WaveLayer bars={PRIMARY_BARS} maxHeight="88%" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_80%,rgba(29,185,84,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_30%_at_20%_20%,rgba(29,185,84,0.06),transparent_60%)]" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-spotify-base/40 to-spotify-base/90" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#121212_75%)]" />

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-spotify-base to-transparent" />
    </div>
  );
}

export function HeroGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <div className="absolute left-1/2 top-[55%] h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(29,185,84,0.15)_0%,transparent_70%)] blur-[140px]" />
      </motion.div>
    </div>
  );
}

export function useMouseParallax(strength = 12) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * strength;
      setOffset({ x, y });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [strength]);

  return offset;
}
