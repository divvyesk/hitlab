#!/usr/bin/env python3
"""Build cosine NearestNeighbors index over the production 22-feature space."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib
import pandas as pd
from sklearn.neighbors import NearestNeighbors

from column_map import COLUMN_MAP

ML_DIR = Path(__file__).resolve().parent
ROOT = ML_DIR.parent
ARTIFACTS = ML_DIR / "artifacts"
FEATURE_CONFIG_PATH = ML_DIR / "feature_config.json"

TIER_LABELS = ["SHORT", "MODERATE", "SUSTAINED"]


def create_hit_tier(weeks: int) -> int:
    if weeks <= 2:
        return 1
    if weeks <= 4:
        return 2
    return 3


def tier_label(weeks: int) -> str:
    return TIER_LABELS[create_hit_tier(weeks) - 1]


def load_feature_config() -> dict:
    return json.loads(FEATURE_CONFIG_PATH.read_text())


def build_feature_matrix(df: pd.DataFrame, config: dict) -> pd.DataFrame:
    numeric = config["numeric_features"]
    binary = config["binary_features"]
    categorical = config["categorical_features"]
    features = numeric + binary + categorical

    missing = [col for col in features if col not in df.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")

    X = df[features].copy()
    for col in binary:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0).astype(int)
    return X


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", type=Path, default=ROOT / "src/data/data.csv")
    parser.add_argument("--output-path", type=Path, default=ARTIFACTS / "similarity_model.pkl")
    args = parser.parse_args()

    try:
        config = load_feature_config()
        preprocessor_path = ARTIFACTS / "preprocessing_pipeline.pkl"
        if not preprocessor_path.exists():
            raise FileNotFoundError(
                f"Missing preprocessing pipeline. Run train.py first: {preprocessor_path}"
            )

        df = pd.read_csv(args.data_path).rename(columns=COLUMN_MAP)
        if len(df) == 0:
            raise ValueError("Dataset is empty.")

        X = build_feature_matrix(df, config)
        preprocessor = joblib.load(preprocessor_path)
        X_transformed = preprocessor.transform(X)

        neighbors = NearestNeighbors(
            n_neighbors=5,
            metric="cosine",
            algorithm="brute",
        )
        neighbors.fit(X_transformed)

        songs = []
        for row in df.itertuples(index=False):
            row_dict = row._asdict()
            weeks = int(pd.to_numeric(row_dict["weeks_at_number_one"], errors="coerce") or 1)
            genre = str(row_dict.get("cdr_genre", "") or "Unknown").replace("nan", "Unknown")
            songs.append({
                "song": str(row_dict.get("song", "") or "Unknown"),
                "artist": str(row_dict.get("artist", "") or "Unknown"),
                "genre": genre,
                "tier": tier_label(weeks),
            })

        payload = {
            "neighbors": neighbors,
            "songs": songs,
            "feature_count": len(config["numeric_features"])
            + len(config["binary_features"])
            + len(config["categorical_features"]),
            "dataset_rows": len(df),
            "metric": "cosine",
        }

        args.output_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(payload, args.output_path)

        print(f"Built similarity index for {len(df):,} songs")
        print(f"Feature space: {payload['feature_count']} features")
        print(f"Saved -> {args.output_path}")
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
