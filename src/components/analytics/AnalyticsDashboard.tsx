"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import { GlassCard } from "@/components/ui/glass-card";
import { ChartContainer } from "@/components/ui/chart-container";
import {
  bpmTrends,
  energyVsPopularity,
  genreSuccess,
  hitsByDecade,
} from "@/lib/analytics-data";

const chartTooltipStyle = {
  contentStyle: {
    background: "#282828",
    border: "1px solid #333333",
    borderRadius: "8px",
    color: "#fff",
  },
  itemStyle: { color: "#1db954" },
  labelStyle: { color: "#b3b3b3" },
};

const barColors = ["#169c46", "#1aa34a", "#1db954", "#1ed760", "#1db954", "#169c46"];

export function AnalyticsDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className="h-full">
          <h4 className="mb-1 text-lg font-bold text-white">Hits by Decade</h4>
          <p className="mb-6 text-sm text-spotify-subdued">
            Billboard Hot 100 longevity trends
          </p>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hitsByDecade}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="decade"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="hits" radius={[8, 8, 0, 0]}>
                  {hitsByDecade.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <GlassCard className="h-full">
          <h4 className="mb-1 text-lg font-bold text-white">
            Most Successful Genres
          </h4>
          <p className="mb-6 text-sm text-spotify-subdued">
            Average chart performance score
          </p>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={genreSuccess} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  type="category"
                  dataKey="genre"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                  width={60}
                />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                  {genreSuccess.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(141, ${60 + i * 3}%, ${30 + i * 5}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <GlassCard className="h-full">
          <h4 className="mb-1 text-lg font-bold text-white">
            Average BPM Trends
          </h4>
          <p className="mb-6 text-sm text-spotify-subdued">
            Tempo evolution of #1 hits
          </p>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bpmTrends}>
                <defs>
                  <linearGradient id="bpmLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#169c46" />
                    <stop offset="50%" stopColor="#1db954" />
                    <stop offset="100%" stopColor="#1ed760" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  domain={[100, 130]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <Tooltip {...chartTooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="bpm"
                  stroke="url(#bpmLineGradient)"
                  strokeWidth={3}
                  dot={{ fill: "#1db954", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#1ed760" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <GlassCard className="h-full">
          <h4 className="mb-1 text-lg font-bold text-white">
            Energy vs Popularity
          </h4>
          <p className="mb-6 text-sm text-spotify-subdued">
            Correlation in top-charting tracks
          </p>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  type="number"
                  dataKey="energy"
                  name="Energy"
                  domain={[40, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="popularity"
                  name="Popularity"
                  domain={[45, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }}
                />
                <Tooltip {...chartTooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={energyVsPopularity} fill="#1db954">
                  {energyVsPopularity.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(141, ${55 + i * 4}%, ${35 + i * 4}%)`}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </GlassCard>
      </motion.div>
    </div>
  );
}
