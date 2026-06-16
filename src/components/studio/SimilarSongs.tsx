"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Disc3, Loader2, Music2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import type { SongInput } from "@/lib/prediction";
import {
  fetchSimilarSongs,
  gradientForSong,
  tierBadgeStyles,
  type SimilarSongMatch,
} from "@/lib/similar-songs";

interface SimilarSongsSectionProps {
  songInput: SongInput;
}

export function SimilarSongsSection({ songInput }: SimilarSongsSectionProps) {
  const [songs, setSongs] = useState<SimilarSongMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const matches = await fetchSimilarSongs(songInput);
        if (!cancelled) {
          setSongs(matches);
        }
      } catch (err) {
        if (!cancelled) {
          setSongs([]);
          setError(
            err instanceof Error ? err.message : "Could not load similar songs"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [songInput]);

  return (
    <section className="overflow-hidden">
      <div className="mb-6 px-1 text-center sm:mb-8 sm:text-left">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-spotify-gradient">
          Similar Billboard Hits
        </p>
        <h3 className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
          Songs with matching DNA
        </h3>
        <p className="mt-2 text-sm text-spotify-subdued">
          Top 5 nearest neighbors from 1,000+ Billboard #1 hits in the
          production feature space
        </p>
      </div>

      {loading ? (
        <GlassCard className="flex min-h-[220px] items-center justify-center">
          <div className="flex items-center gap-3 text-spotify-subdued">
            <Loader2 className="h-5 w-5 animate-spin text-spotify-green" />
            <span>Finding similar Billboard hits...</span>
          </div>
        </GlassCard>
      ) : error ? (
        <GlassCard className="flex min-h-[220px] items-center justify-center text-center">
          <div>
            <Music2 className="mx-auto mb-3 h-8 w-8 text-spotify-subdued" />
            <p className="font-medium text-white">No similar songs available</p>
            <p className="mt-2 text-sm text-spotify-subdued">{error}</p>
          </div>
        </GlassCard>
      ) : songs.length === 0 ? (
        <GlassCard className="flex min-h-[220px] items-center justify-center text-center">
          <div>
            <Music2 className="mx-auto mb-3 h-8 w-8 text-spotify-subdued" />
            <p className="font-medium text-white">No similar songs found</p>
            <p className="mt-2 text-sm text-spotify-subdued">
              Try adjusting your track features and run another prediction.
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {songs.map((song, i) => (
            <motion.div
              key={`${song.song}-${song.artist}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <GlassCard className="h-full overflow-hidden p-0 transition-all group-hover:ring-1 group-hover:ring-spotify-green/20">
                <div
                  className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${gradientForSong(song.song)}`}
                >
                  <Disc3 className="h-14 w-14 text-white/25 transition-transform duration-500 group-hover:rotate-180" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="truncate text-base font-bold text-white">
                      {song.song}
                    </p>
                    <p className="truncate text-sm text-white/70">
                      {song.artist}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-spotify-subdued">Genre</span>
                    <span className="truncate text-right text-white">
                      {song.genre}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-spotify-subdued">Tier</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${tierBadgeStyles[song.tier]}`}
                    >
                      {song.tier}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-spotify-subdued">Similarity</span>
                    <span className="font-mono font-bold text-spotify-green">
                      {Math.round(song.similarity * 100)}%
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
