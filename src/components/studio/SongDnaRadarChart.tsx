"use client";

import { motion } from "framer-motion";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { getSongDnaRadarData, type SongInput } from "@/lib/prediction";
import { cn } from "@/lib/utils";

interface SongDnaRadarChartProps {
  input: SongInput;
  className?: string;
}

export function SongDnaRadarChart({ input, className }: SongDnaRadarChartProps) {
  const data = getSongDnaRadarData(input);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className={cn("w-full", className)}
    >
      <div className="mb-4 text-left">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-spotify-subdued">
          Song DNA
        </p>
        <p className="mt-1 text-sm text-spotify-muted">
          Your track vs. predicted hit average
        </p>
      </div>

      <div className="h-56 w-full min-w-0 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid
              stroke="rgba(255,255,255,0.08)"
              radialLines={false}
            />
            <PolarAngleAxis
              dataKey="trait"
              tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Hit average"
              dataKey="hitAvg"
              stroke="rgba(255,255,255,0.35)"
              fill="rgba(255,255,255,0.06)"
              fillOpacity={1}
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <Radar
              name="Your song"
              dataKey="user"
              stroke="#1db954"
              fill="rgba(29,185,84,0.25)"
              fillOpacity={1}
              strokeWidth={2.5}
            />
            <Legend
              wrapperStyle={{ paddingTop: 12 }}
              formatter={(value) => (
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
