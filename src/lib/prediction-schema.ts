import { z } from "zod";
import featureDefaults from "@/data/feature_defaults.json";

const cdrGenreOptions = featureDefaults.ui_options.cdr_genre as [
  string,
  ...string[],
];
const songStructureOptions = featureDefaults.ui_options.song_structure as [
  string,
  ...string[],
];

export const songInputSchema = z.object({
  cdrGenre: z.enum(cdrGenreOptions, {
    error: "cdrGenre must be one of the allowed genre values",
  }),
  songStructure: z.enum(songStructureOptions, {
    error: "songStructure must be one of the allowed structure values",
  }),
  bpm: z
    .number({ error: "bpm must be a number" })
    .min(40, "bpm must be between 40 and 220")
    .max(220, "bpm must be between 40 and 220"),
  energy: z
    .number({ error: "energy must be a number" })
    .min(0, "energy must be between 0 and 100")
    .max(100, "energy must be between 0 and 100"),
  danceability: z
    .number({ error: "danceability must be a number" })
    .min(0, "danceability must be between 0 and 100")
    .max(100, "danceability must be between 0 and 100"),
  happiness: z
    .number({ error: "happiness must be a number" })
    .min(0, "happiness must be between 0 and 100")
    .max(100, "happiness must be between 0 and 100"),
  loudnessDb: z
    .number({ error: "loudnessDb must be a number" })
    .min(-60, "loudnessDb must be between -60 and 0")
    .max(0, "loudnessDb must be between -60 and 0"),
  acousticness: z
    .number({ error: "acousticness must be a number" })
    .min(0, "acousticness must be between 0 and 100")
    .max(100, "acousticness must be between 0 and 100"),
  lengthSec: z
    .number({ error: "lengthSec must be a number" })
    .min(60, "lengthSec must be between 60 and 600")
    .max(600, "lengthSec must be between 60 and 600"),
  introLengthSec: z
    .number({ error: "introLengthSec must be a number" })
    .min(0, "introLengthSec must be between 0 and 120")
    .max(120, "introLengthSec must be between 0 and 120"),
  explicit: z.boolean({ error: "explicit must be a boolean" }),
  guitarBased: z.boolean({ error: "guitarBased must be a boolean" }),
  bassBased: z.boolean({ error: "bassBased must be a boolean" }),
  vocallyBased: z.boolean({ error: "vocallyBased must be a boolean" }),
  rapVerseNonRap: z.boolean({ error: "rapVerseNonRap must be a boolean" }),
  vocalIntroduction: z.boolean({
    error: "vocalIntroduction must be a boolean",
  }),
  fadeOut: z.boolean({ error: "fadeOut must be a boolean" }),
});

export type SongInputPayload = z.infer<typeof songInputSchema>;

export type HitTier = "SHORT" | "MODERATE" | "SUSTAINED";

export interface PredictionApiResponse {
  tier: HitTier;
  confidence: number;
  probabilities: Record<HitTier, number>;
  chartWeeks: string;
  score: number;
  featureImportance: Array<{
    name: string;
    label: string;
    value: number;
  }>;
}
