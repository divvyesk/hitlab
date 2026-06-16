import type { HitTier, SongInputPayload } from "@/lib/prediction-schema";

export interface SimilarSongMatch {
  song: string;
  artist: string;
  genre: string;
  tier: HitTier;
  similarity: number;
}

export interface SimilarSongsResponse {
  songs: SimilarSongMatch[];
}

export async function fetchSimilarSongs(
  input: SongInputPayload
): Promise<SimilarSongMatch[]> {
  const response = await fetch("/api/similar-songs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as SimilarSongsResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Similar songs lookup failed");
  }

  return data.songs;
}

const GRADIENTS = [
  "from-red-900/90 via-red-700/70 to-spotify-green/30",
  "from-emerald-900/90 via-teal-800/70 to-spotify-green/40",
  "from-amber-900/90 via-orange-800/70 to-spotify-green/30",
  "from-purple-900/90 via-violet-800/70 to-spotify-green/30",
  "from-blue-900/90 via-indigo-800/70 to-spotify-green/30",
  "from-lime-900/90 via-green-800/70 to-spotify-green/50",
  "from-rose-900/90 via-pink-800/70 to-spotify-green/30",
  "from-sky-900/90 via-blue-800/70 to-spotify-green/30",
];

export function gradientForSong(song: string): string {
  let hash = 0;
  for (let i = 0; i < song.length; i += 1) {
    hash = (hash + song.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  }
  return GRADIENTS[hash];
}

export const tierBadgeStyles: Record<HitTier, string> = {
  SUSTAINED: "bg-spotify-green/20 text-spotify-green",
  MODERATE: "bg-white/10 text-white",
  SHORT: "bg-white/5 text-spotify-subdued",
};
