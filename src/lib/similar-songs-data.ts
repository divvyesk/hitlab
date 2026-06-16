import { defaultSongInput, type SongInput } from "./prediction";

export interface SimilarSong {
  id: string;
  title: string;
  artist: string;
  genre: string;
  chartPerformance: string;
  gradient: string;
  traits: {
    cdrGenre: string;
    bpm: number;
    energy: number;
    danceability: number;
    happiness: number;
    acousticness: number;
  };
}

export const similarSongsCatalog: SimilarSong[] = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    genre: "Synth-pop",
    chartPerformance: "#1 · 90 weeks",
    gradient: "from-red-900/90 via-red-700/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Pop;Electronic/Dance",
      bpm: 171,
      energy: 85,
      danceability: 51,
      happiness: 33,
      acousticness: 1,
    },
  },
  {
    id: "2",
    title: "Shape of You",
    artist: "Ed Sheeran",
    genre: "Dance-pop",
    chartPerformance: "#1 · 59 weeks",
    gradient: "from-emerald-900/90 via-teal-800/70 to-spotify-green/40",
    traits: {
      cdrGenre: "Pop",
      bpm: 96,
      energy: 65,
      danceability: 83,
      happiness: 93,
      acousticness: 58,
    },
  },
  {
    id: "3",
    title: "Uptown Funk",
    artist: "Bruno Mars",
    genre: "Funk-pop",
    chartPerformance: "#1 · 49 weeks",
    gradient: "from-amber-900/90 via-orange-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Funk/Soul;Pop",
      bpm: 115,
      energy: 86,
      danceability: 86,
      happiness: 92,
      acousticness: 6,
    },
  },
  {
    id: "4",
    title: "Levitating",
    artist: "Dua Lipa",
    genre: "Disco-pop",
    chartPerformance: "#2 · 77 weeks",
    gradient: "from-purple-900/90 via-violet-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Pop;Electronic/Dance",
      bpm: 103,
      energy: 83,
      danceability: 79,
      happiness: 90,
      acousticness: 3,
    },
  },
  {
    id: "5",
    title: "God's Plan",
    artist: "Drake",
    genre: "Hip-hop",
    chartPerformance: "#1 · 39 weeks",
    gradient: "from-blue-900/90 via-indigo-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Hip Hop",
      bpm: 77,
      energy: 56,
      danceability: 68,
      happiness: 43,
      acousticness: 11,
    },
  },
  {
    id: "6",
    title: "Bad Guy",
    artist: "Billie Eilish",
    genre: "Electropop",
    chartPerformance: "#1 · 52 weeks",
    gradient: "from-lime-900/90 via-green-800/70 to-spotify-green/50",
    traits: {
      cdrGenre: "Electronic/Dance",
      bpm: 135,
      energy: 43,
      danceability: 70,
      happiness: 56,
      acousticness: 33,
    },
  },
  {
    id: "7",
    title: "Old Town Road",
    artist: "Lil Nas X",
    genre: "Country-trap",
    chartPerformance: "#1 · 19 weeks",
    gradient: "from-yellow-900/90 via-amber-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Hip Hop",
      bpm: 136,
      energy: 44,
      danceability: 87,
      happiness: 89,
      acousticness: 1,
    },
  },
  {
    id: "8",
    title: "Rockstar",
    artist: "Post Malone",
    genre: "Hip-hop",
    chartPerformance: "#1 · 25 weeks",
    gradient: "from-stone-900/90 via-zinc-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Hip Hop",
      bpm: 80,
      energy: 56,
      danceability: 75,
      happiness: 41,
      acousticness: 8,
    },
  },
  {
    id: "9",
    title: "Circles",
    artist: "Post Malone",
    genre: "Pop-rock",
    chartPerformance: "#1 · 39 weeks",
    gradient: "from-sky-900/90 via-blue-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Pop;Rock",
      bpm: 120,
      energy: 59,
      danceability: 57,
      happiness: 46,
      acousticness: 43,
    },
  },
  {
    id: "10",
    title: "Despacito",
    artist: "Luis Fonsi",
    genre: "Latin pop",
    chartPerformance: "#1 · 52 weeks",
    gradient: "from-rose-900/90 via-pink-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Latin",
      bpm: 89,
      energy: 65,
      danceability: 82,
      happiness: 89,
      acousticness: 35,
    },
  },
  {
    id: "11",
    title: "Starboy",
    artist: "The Weeknd",
    genre: "R&B",
    chartPerformance: "#1 · 21 weeks",
    gradient: "from-neutral-900/90 via-stone-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Funk/Soul;Pop",
      bpm: 108,
      energy: 59,
      danceability: 67,
      happiness: 49,
      acousticness: 8,
    },
  },
  {
    id: "12",
    title: "Don't Start Now",
    artist: "Dua Lipa",
    genre: "Disco",
    chartPerformance: "#2 · 41 weeks",
    gradient: "from-fuchsia-900/90 via-purple-800/70 to-spotify-green/30",
    traits: {
      cdrGenre: "Pop;Electronic/Dance",
      bpm: 124,
      energy: 79,
      danceability: 79,
      happiness: 66,
      acousticness: 1,
    },
  },
];

function traitDistance(input: SongInput, song: SimilarSong): number {
  const t = song.traits;
  const genrePenalty = input.cdrGenre === t.cdrGenre ? 0 : 10;

  return (
    Math.abs(input.bpm - t.bpm) * 0.12 +
    Math.abs(input.energy - t.energy) * 0.2 +
    Math.abs(input.danceability - t.danceability) * 0.22 +
    Math.abs(input.happiness - t.happiness) * 0.12 +
    Math.abs(input.acousticness - t.acousticness) * 0.1 +
    genrePenalty
  );
}

export function getSimilarSongs(input: SongInput, limit = 6): SimilarSong[] {
  return [...similarSongsCatalog]
    .map((song) => ({ song, distance: traitDistance(input, song) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ song }) => song);
}

/** Baseline song profile for the What-If studio sliders. */
export const whatIfBaselineInput: SongInput = {
  ...defaultSongInput,
  cdrGenre: "Rock",
  songStructure: "C1",
  bpm: 90,
  energy: 60,
  danceability: 52,
  happiness: 48,
  acousticness: 45,
  lengthSec: 200,
  introLengthSec: 12,
  guitarBased: true,
  bassBased: false,
};
