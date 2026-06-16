export type FeatureHelpKey =
  | "genre"
  | "songStructure"
  | "bpm"
  | "energy"
  | "danceability"
  | "happiness"
  | "loudness"
  | "acousticness"
  | "songLength"
  | "introLength";

const SONG_STRUCTURE_DESCRIPTIONS: Record<string, string> = {
  A1: "Only verses with no refrain",
  A2: "Verses with a refrain at the beginning or end",
  A3: "Lyrical intro, then verses with a refrain at the beginning or end",
  A4: "Lyrical intro, then verses with no refrain",
  C1: "Verse and chorus",
  C2: "Lyrical intro, verse, and chorus",
  C3: "Verse, pre-chorus, chorus",
  C4: "Verse, pre-chorus, chorus, post-chorus",
  C5: "Verse, chorus, post-chorus",
  C6: "Intro, verse, pre-chorus, chorus",
  C7: "Intro, verse, pre-chorus, chorus, post-chorus",
  D1: "Verse with a refrain at the beginning or end and a bridge",
  D3: "Lyrical intro, then a verse with a refrain at the beginning or end and a bridge",
  E1: "Verse, chorus, and bridge",
  E2: "Verse with a refrain at the beginning or end, then a chorus and a bridge",
  E3: "Verse, pre-chorus, chorus, and bridge",
  E4: "Verse, pre-chorus, chorus, post-chorus, and bridge",
  E5: "Verse, chorus, post-chorus, and bridge",
  E6: "Intro, verse, chorus, bridge",
  E7: "Verse with a refrain at the beginning or end, then a pre-chorus, chorus, and bridge",
  F: "Four or more sections",
  I: "Instrumental",
};

const SONG_STRUCTURE_V_SUFFIX =
  "If a code ends with V, the song is a non-rap track with a single rap verse.";

const SONG_STRUCTURE_LEGEND = Object.entries(SONG_STRUCTURE_DESCRIPTIONS)
  .map(([code, description]) => `${code}: ${description}`)
  .join("\n");

export const FEATURE_HELP: Record<
  FeatureHelpKey,
  { title: string; description: string }
> = {
  genre: {
    title: "Genre",
    description:
      "Genre as assigned by Chris Dalla Riva and Vinnie Christopher for Billboard #1 hits. A slash (/) joins subcategories within one genre (e.g. Folk/Country). A plus (+) in the dropdown means the song spans multiple genres (stored as semicolon-separated values in the dataset).",
  },
  songStructure: {
    title: "Song Structure",
    description: `${SONG_STRUCTURE_LEGEND}\n\n${SONG_STRUCTURE_V_SUFFIX}`,
  },
  bpm: {
    title: "BPM",
    description: "Beats per minute as provided by Spotify.",
  },
  energy: {
    title: "Energy",
    description:
      "Energy measure from 0 to 100 as provided by Spotify. Higher values mean a more intense, active feel.",
  },
  danceability: {
    title: "Danceability",
    description:
      "Danceability measure from 0 to 100 as provided by Spotify. Higher values mean the track is easier to dance to.",
  },
  happiness: {
    title: "Happiness",
    description:
      "Happiness measure from 0 to 100 as provided by Spotify. Higher values mean a more positive, cheerful mood.",
  },
  loudness: {
    title: "Loudness",
    description:
      "Loudness measured in decibels as provided by Spotify. Typical values range from about -30 dB (quiet) to 0 dB (loud).",
  },
  acousticness: {
    title: "Acousticness",
    description:
      "Probability between 0 and 100 that a song is acoustic, as provided by Spotify. Higher values mean more acoustic instrumentation.",
  },
  songLength: {
    title: "Song Length",
    description: "Total song length in seconds.",
  },
  introLength: {
    title: "Intro Length",
    description:
      "Length of time, in seconds, before the first verse or chorus at the beginning of the song. Hooks are classified as introductions even if they repeat throughout.",
  },
};

export function formatGenreLabel(value: string): string {
  return value.replace(/;/g, " + ");
}

function getStructureBaseCode(code: string): string {
  return code.endsWith("V") ? code.slice(0, -1) : code;
}

export function getSongStructureDescription(code: string): string | undefined {
  const base = getStructureBaseCode(code);
  const baseDescription = SONG_STRUCTURE_DESCRIPTIONS[base];
  if (!baseDescription) {
    return undefined;
  }

  if (code.endsWith("V")) {
    return `${baseDescription}. Includes a rap verse in a non-rap song.`;
  }

  return baseDescription;
}

export function formatSongStructureLabel(code: string): string {
  const description = getSongStructureDescription(code);
  if (!description) {
    return code;
  }

  return `${code} — ${description}`;
}
