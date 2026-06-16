#!/usr/bin/env python3
"""Build normalized billboard_hits.csv from data.csv."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd

from column_map import COLUMN_MAP

ROOT = Path(__file__).resolve().parents[1]
FEATURE_CONFIG_PATH = Path(__file__).resolve().parent / "feature_config.json"


def load_feature_config() -> dict:
    return json.loads(FEATURE_CONFIG_PATH.read_text())


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    renamed = df.rename(columns=COLUMN_MAP)
    for col in renamed.columns:
        if col in {"song", "artist", "date", "cdr_genre", "song_structure", "simplified_key"}:
            renamed[col] = renamed[col].astype(str).replace({"nan": "", "N/A": ""})
    return renamed


def compute_defaults(df: pd.DataFrame, config: dict) -> dict:
    defaults: dict = {}
    for col in config["numeric_features"]:
        defaults[col] = float(pd.to_numeric(df[col], errors="coerce").median())
    for col in config["binary_features"]:
        series = pd.to_numeric(df[col], errors="coerce").fillna(0)
        defaults[col] = int(round(series.mean()))
    for col in config["categorical_features"]:
        mode = df[col].astype(str).replace({"": "Unknown", "nan": "Unknown"}).mode()
        defaults[col] = mode.iloc[0] if len(mode) else "Unknown"
    return defaults


def compute_hit_averages(df: pd.DataFrame) -> dict:
    numeric = ["energy", "danceability", "happiness", "acousticness"]
    return {
        col: round(float(pd.to_numeric(df[col], errors="coerce").median()), 1)
        for col in numeric
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=ROOT / "src/data/data.csv")
    parser.add_argument("--out", type=Path, default=ROOT / "src/data/billboard_hits.csv")
    parser.add_argument(
        "--defaults-out",
        type=Path,
        default=Path(__file__).resolve().parent / "artifacts" / "feature_defaults.json",
    )
    args = parser.parse_args()

    config = load_feature_config()
    df = pd.read_csv(args.input)
    normalized = normalize_dataframe(df)

    args.out.parent.mkdir(parents=True, exist_ok=True)
    normalized.to_csv(args.out, index=False)

    defaults = compute_defaults(normalized, config)
    hit_averages = compute_hit_averages(normalized)
    ui_options = {
        "cdr_genre": sorted(
            normalized["cdr_genre"].astype(str).replace({"": "Unknown", "nan": "Unknown"}).unique()
        ),
        "song_structure": sorted(
            normalized["song_structure"]
            .astype(str)
            .replace({"": "Unknown", "nan": "Unknown", "N/A": "Unknown"})
            .unique()
        ),
    }

    config["ui_options"] = ui_options
    FEATURE_CONFIG_PATH.write_text(json.dumps(config, indent=2) + "\n")

    args.defaults_out.parent.mkdir(parents=True, exist_ok=True)
    payload = {"defaults": defaults, "hit_averages": hit_averages, "ui_options": ui_options}
    args.defaults_out.write_text(json.dumps(payload, indent=2) + "\n")

    print(f"Wrote {len(normalized):,} rows -> {args.out}")
    print(f"Wrote defaults -> {args.defaults_out}")


if __name__ == "__main__":
    main()
