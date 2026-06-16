import featureDefaults from "@/data/feature_defaults.json";
import type {
  HitTier,
  PredictionApiResponse,
  SongInputPayload,
} from "@/lib/prediction-schema";

export type { HitTier, SongInputPayload as SongInput };

export interface FeatureImportance {
  name: string;
  value: number;
  label: string;
}

export interface PredictionResult {
  tier: HitTier;
  confidence: number;
  probabilities: Record<HitTier, number>;
  chartWeeks: string;
  featureImportance: FeatureImportance[];
  score: number;
}

const defaults = featureDefaults.defaults;

export const defaultSongInput: SongInputPayload = {
  cdrGenre: defaults.cdr_genre,
  songStructure: defaults.song_structure,
  bpm: defaults.bpm,
  energy: defaults.energy,
  danceability: defaults.danceability,
  happiness: defaults.happiness,
  loudnessDb: defaults.loudness_db,
  acousticness: defaults.acousticness,
  lengthSec: defaults.length_sec,
  introLengthSec: defaults.intro_length_sec,
  explicit: Boolean(defaults.explicit),
  guitarBased: Boolean(defaults.guitar_based),
  bassBased: Boolean(defaults.bass_based),
  vocallyBased: Boolean(defaults.vocally_based),
  rapVerseNonRap: Boolean(defaults.rap_verse_non_rap),
  vocalIntroduction: Boolean(defaults.vocal_introduction),
  fadeOut: Boolean(defaults.fade_out),
};

export const cdrGenreOptions = featureDefaults.ui_options.cdr_genre;
export const songStructureOptions = featureDefaults.ui_options.song_structure;

/** Average DNA profile of Billboard #1 hits (training-set medians). */
export const hitSongAverageDna = featureDefaults.hit_averages;

export interface SongDnaRadarPoint {
  trait: string;
  user: number;
  hitAvg: number;
}

export function getSongDnaRadarData(input: SongInputPayload): SongDnaRadarPoint[] {
  return [
    { trait: "Energy", user: input.energy, hitAvg: hitSongAverageDna.energy },
    {
      trait: "Danceability",
      user: input.danceability,
      hitAvg: hitSongAverageDna.danceability,
    },
    {
      trait: "Happiness",
      user: input.happiness,
      hitAvg: hitSongAverageDna.happiness,
    },
    {
      trait: "Acousticness",
      user: input.acousticness,
      hitAvg: hitSongAverageDna.acousticness,
    },
  ];
}

export async function predictHit(
  input: SongInputPayload
): Promise<PredictionResult> {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as PredictionApiResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Prediction failed");
  }

  return {
    tier: data.tier,
    confidence: data.confidence,
    probabilities: data.probabilities,
    chartWeeks: data.chartWeeks,
    score: data.score,
    featureImportance: data.featureImportance,
  };
}
