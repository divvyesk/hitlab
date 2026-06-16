"use client";

import { motion } from "framer-motion";
import { Clock, Music2, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { LabelWithHelp } from "@/components/ui/label-with-help";
import {
  formatGenreLabel,
  formatSongStructureLabel,
  getSongStructureDescription,
  type FeatureHelpKey,
} from "@/lib/feature-help";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/glass-card";
import {
  cdrGenreOptions,
  songStructureOptions,
  type SongInput,
} from "@/lib/prediction";

interface PredictionFormProps {
  input: SongInput;
  onChange: (input: SongInput) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
}

function SliderField({
  label,
  helpKey,
  value,
  onChange,
  min = 0,
  max = 100,
  unit = "%",
  icon,
}: {
  label: string;
  helpKey?: FeatureHelpKey;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  unit?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-lg bg-spotify-card-gradient p-4 transition-colors hover:brightness-110 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <LabelWithHelp helpKey={helpKey}>{label}</LabelWithHelp>
        </div>
        <span className="font-mono text-sm font-bold text-spotify-green">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v)}
      />
    </motion.div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-spotify-card-gradient p-4 sm:p-5">
      <div>
        <Label>{label}</Label>
        {description && (
          <p className="mt-1 text-xs text-spotify-muted">{description}</p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function PredictionForm({
  input,
  onChange,
  onSubmit,
  isAnalyzing,
}: PredictionFormProps) {
  const update = <K extends keyof SongInput>(key: K, value: SongInput[K]) => {
    onChange({ ...input, [key]: value });
  };

  return (
    <GlassCard glow className="relative overflow-hidden">
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-spotify-green/5 blur-3xl" />
      <div className="relative">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-spotify-icon-gradient">
            <Music2 className="h-5 w-5 text-black" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Studio</h3>
            <p className="text-sm text-spotify-subdued">
              Configure your track from real Billboard data features
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <LabelWithHelp helpKey="genre">Genre</LabelWithHelp>
            <Select
              value={input.cdrGenre}
              onValueChange={(v) => update("cdrGenre", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {cdrGenreOptions.map((g) => (
                  <SelectItem key={g} value={g}>
                    {formatGenreLabel(g)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <LabelWithHelp helpKey="songStructure">Song Structure</LabelWithHelp>
            <Select
              value={input.songStructure}
              onValueChange={(v) => update("songStructure", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select structure" />
              </SelectTrigger>
              <SelectContent>
                {songStructureOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {formatSongStructureLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getSongStructureDescription(input.songStructure) ? (
              <p className="text-xs text-spotify-muted">
                {getSongStructureDescription(input.songStructure)}
              </p>
            ) : null}
          </div>

          <SliderField
            label="BPM"
            helpKey="bpm"
            value={input.bpm}
            min={60}
            max={180}
            unit=""
            icon={<Zap className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("bpm", v)}
          />

          <SliderField
            label="Energy"
            helpKey="energy"
            value={input.energy}
            icon={<Zap className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("energy", v)}
          />

          <SliderField
            label="Danceability"
            helpKey="danceability"
            value={input.danceability}
            icon={<Music2 className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("danceability", v)}
          />

          <SliderField
            label="Happiness"
            helpKey="happiness"
            value={input.happiness}
            icon={<span className="text-sm">☀</span>}
            onChange={(v) => update("happiness", v)}
          />

          <SliderField
            label="Loudness"
            helpKey="loudness"
            value={input.loudnessDb}
            min={-30}
            max={0}
            unit=" dB"
            icon={<Music2 className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("loudnessDb", v)}
          />

          <SliderField
            label="Acousticness"
            helpKey="acousticness"
            value={input.acousticness}
            icon={<Music2 className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("acousticness", v)}
          />

          <SliderField
            label="Song Length"
            helpKey="songLength"
            value={input.lengthSec}
            min={120}
            max={360}
            unit="s"
            icon={<Clock className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("lengthSec", v)}
          />

          <SliderField
            label="Intro Length"
            helpKey="introLength"
            value={input.introLengthSec}
            min={0}
            max={60}
            unit="s"
            icon={<Clock className="h-4 w-4 text-spotify-green" />}
            onChange={(v) => update("introLengthSec", v)}
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <ToggleField
            label="Explicit"
            checked={input.explicit}
            onChange={(v) => update("explicit", v)}
          />
          <ToggleField
            label="Guitar Based"
            checked={input.guitarBased}
            onChange={(v) => update("guitarBased", v)}
          />
          <ToggleField
            label="Bass Based"
            checked={input.bassBased}
            onChange={(v) => update("bassBased", v)}
          />
          <ToggleField
            label="Vocally Based"
            checked={input.vocallyBased}
            onChange={(v) => update("vocallyBased", v)}
          />
          <ToggleField
            label="Rap Verse"
            checked={input.rapVerseNonRap}
            onChange={(v) => update("rapVerseNonRap", v)}
          />
          <ToggleField
            label="Vocal Introduction"
            checked={input.vocalIntroduction}
            onChange={(v) => update("vocalIntroduction", v)}
          />
          <ToggleField
            label="Fade Out"
            checked={input.fadeOut}
            onChange={(v) => update("fadeOut", v)}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSubmit}
          disabled={isAnalyzing}
          className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-spotify-green-gradient text-base font-bold text-black shadow-[0_4px_20px_rgba(29,185,84,0.25)] transition-all hover:shadow-[0_6px_28px_rgba(29,185,84,0.35)] disabled:opacity-70"
        >
          {isAnalyzing ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block h-5 w-5 rounded-full border-2 border-black/30 border-t-black"
              />
              Analyzing track DNA...
            </>
          ) : (
            "Run Hit Prediction"
          )}
        </motion.button>
      </div>
    </GlassCard>
  );
}
