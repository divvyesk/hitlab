#!/usr/bin/env python3
"""Train HitTier production model using dictionary-selected, leakage-free features."""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from column_map import COLUMN_MAP
from tier_utils import create_hit_tier

ML_DIR = Path(__file__).resolve().parent
ROOT = ML_DIR.parent
FEATURE_CONFIG_PATH = ML_DIR / "feature_config.json"

TIER_TO_HIT = {
    1: ("SHORT", "1–2 weeks"),
    2: ("MODERATE", "3–4 weeks"),
    3: ("SUSTAINED", "5+ weeks"),
}

FEATURE_LABELS = {
    "bpm": "BPM",
    "energy": "Energy",
    "danceability": "Danceability",
    "happiness": "Happiness",
    "loudness_db": "Loudness",
    "acousticness": "Acousticness",
    "length_sec": "Song Length",
    "intro_length_sec": "Intro Length",
    "cdr_genre": "Genre",
    "song_structure": "Structure",
    "explicit": "Explicit",
    "cover": "Cover",
    "sample": "Sample",
    "live": "Live",
    "fade_out": "Fade Out",
    "rap_verse_non_rap": "Rap Verse",
    "vocal_introduction": "Vocal Intro",
    "multiple_lead_vocalists": "Multi Vocalist",
    "guitar_based": "Guitar Based",
    "bass_based": "Bass Based",
    "vocally_based": "Vocally Based",
    "artist_is_only_songwriter": "Solo Songwriter",
}


def load_feature_config() -> dict:
    return json.loads(FEATURE_CONFIG_PATH.read_text())


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-path", type=Path, default=ROOT / "src/data/data.csv")
    parser.add_argument("--output-dir", type=Path, default=ML_DIR / "artifacts")
    parser.add_argument("--random-state", type=int, default=42)
    return parser.parse_args()


def load_dataset(path: Path, config: dict) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")
    df = pd.read_csv(path).rename(columns=COLUMN_MAP)
    if len(df) == 0:
        raise ValueError("Dataset is empty.")
    df[config["target_column"]] = (
        df["weeks_at_number_one"].astype(int).map(create_hit_tier)
    )
    print(f"Loaded {len(df):,} rows")
    return df


def build_feature_matrix(
    df: pd.DataFrame, config: dict
) -> tuple[pd.DataFrame, pd.Series, list[str], list[str], list[str]]:
    numeric = config["numeric_features"]
    binary = config["binary_features"]
    categorical = config["categorical_features"]
    features = numeric + binary + categorical

    missing = [c for c in features if c not in df.columns]
    if missing:
        raise ValueError(f"Missing feature columns: {missing}")

    X = df[features].copy()
    for col in binary:
        X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0).astype(int)

    y = df[config["target_column"]]
    print("Using features:")
    print("  numeric:", ", ".join(numeric))
    print("  binary:", ", ".join(binary))
    print("  categorical:", ", ".join(categorical))
    print("  dropped leakage:", ", ".join(config["leakage_columns"]))
    return X, y, numeric, binary, categorical


def build_preprocessing_pipeline(
    numeric: list[str], binary: list[str], categorical: list[str]
) -> ColumnTransformer:
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler()),
    ])
    binary_pipe = Pipeline([("imputer", SimpleImputer(strategy="most_frequent"))])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
    ])
    return ColumnTransformer([
        ("numeric", numeric_pipe, numeric),
        ("binary", binary_pipe, binary),
        ("categorical", categorical_pipe, categorical),
    ])


def build_training_pipeline(
    numeric: list[str], binary: list[str], categorical: list[str]
) -> Pipeline:
    return Pipeline([
        ("preprocessor", build_preprocessing_pipeline(numeric, binary, categorical)),
        ("classifier", RandomForestClassifier(
            n_estimators=400,
            min_samples_split=3,
            min_samples_leaf=1,
            class_weight="balanced_subsample",
            random_state=42,
            n_jobs=-1,
        )),
    ])


def grouped_importances(
    preprocessor: ColumnTransformer,
    classifier: RandomForestClassifier,
) -> list[tuple[str, float]]:
    transformed_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_
    grouped: dict[str, float] = {}

    for name, value in zip(transformed_names, importances):
        base = name
        for prefix in ("numeric__", "binary__", "categorical__"):
            if name.startswith(prefix):
                base = name[len(prefix):]
                break
        if base.startswith("cdr_genre_") or base.startswith("song_structure_"):
            parent = "cdr_genre" if base.startswith("cdr_genre_") else "song_structure"
            grouped[parent] = grouped.get(parent, 0.0) + float(value)
        else:
            grouped[base] = grouped.get(base, 0.0) + float(value)

    return sorted(grouped.items(), key=lambda item: item[1], reverse=True)


def aggregate_importances(
    preprocessor: ColumnTransformer,
    classifier: RandomForestClassifier,
    top_n: int = 5,
) -> list[dict]:
    ordered = grouped_importances(preprocessor, classifier)
    total = sum(value for _, value in ordered) or 1.0
    return [
        {
            "name": key,
            "label": FEATURE_LABELS.get(key, key.replace("_", " ").title()),
            "value": round((value / total) * 100),
        }
        for key, value in ordered[:top_n]
    ]


def aggregate_importances_detailed(
    preprocessor: ColumnTransformer,
    classifier: RandomForestClassifier,
    top_n: int = 20,
) -> list[dict]:
    ordered = grouped_importances(preprocessor, classifier)
    total = sum(value for _, value in ordered) or 1.0
    return [
        {
            "rank": index + 1,
            "name": key,
            "label": FEATURE_LABELS.get(key, key.replace("_", " ").title()),
            "importance": round(value, 6),
            "importance_pct": round((value / total) * 100, 2),
        }
        for index, (key, value) in enumerate(ordered[:top_n])
    ]


def tier_ids(config: dict) -> list[int]:
    return list(range(1, len(config["tier_labels"]) + 1))


def tier_mean_weeks(df: pd.DataFrame, config: dict) -> dict[str, float]:
    labels = config["tier_labels"]
    tier_ids = list(range(1, len(labels) + 1))
    means: dict[str, float] = {}

    for tier_id, label in zip(tier_ids, labels):
        weeks = df.loc[df[config["target_column"]] == tier_id, "weeks_at_number_one"]
        means[label] = round(float(weeks.mean()), 2) if len(weeks) else 0.0

    return means


def class_distribution(y: pd.Series, config: dict) -> dict:
    labels = config["tier_labels"]
    ids = tier_ids(config)
    total = len(y) or 1
    distribution = {}
    for tier_id, label in zip(ids, labels):
        count = int((y == tier_id).sum())
        distribution[label] = {
            "tier_id": tier_id,
            "count": count,
            "pct": round((count / total) * 100, 2),
        }
    return distribution


def cross_validate(
    pipeline: Pipeline,
    X: pd.DataFrame,
    y: pd.Series,
    config: dict,
    n_splits: int = 5,
    random_state: int = 42,
) -> dict:
    labels = tier_ids(config)
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    y_pred = cross_val_predict(pipeline, X, y, cv=cv, n_jobs=-1)
    cm = confusion_matrix(y, y_pred, labels=labels)
    metrics = {
        "accuracy": round(float(accuracy_score(y, y_pred)), 4),
        "balanced_accuracy": round(float(balanced_accuracy_score(y, y_pred)), 4),
        "macro_f1": round(
            float(f1_score(y, y_pred, labels=labels, average="macro", zero_division=0)),
            4,
        ),
    }

    print(f"\n5-fold Stratified Cross Validation (n_splits={n_splits})")
    print(f"Accuracy:          {metrics['accuracy']:.4f}")
    print(f"Balanced Accuracy: {metrics['balanced_accuracy']:.4f}")
    print(f"Macro F1:          {metrics['macro_f1']:.4f}\n")
    print(classification_report(
        y, y_pred, labels=labels, target_names=config["tier_labels"], zero_division=0
    ))
    print("Confusion Matrix (rows = actual, cols = predicted):")
    print(cm)

    return {
        "cv_folds": n_splits,
        "random_state": random_state,
        "metrics": metrics,
        "confusion_matrix": {
            "labels": config["tier_labels"],
            "tier_ids": labels,
            "matrix": cm.tolist(),
            "description": "rows = actual, cols = predicted (out-of-fold predictions)",
        },
        "class_distribution": class_distribution(y, config),
    }


def save_artifacts(
    pipeline: Pipeline,
    config: dict,
    numeric: list[str],
    binary: list[str],
    categorical: list[str],
    cv_metrics: dict[str, float],
    tier_means: dict[str, float],
    output_dir: Path,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    preprocessor = pipeline.named_steps["preprocessor"]
    classifier = pipeline.named_steps["classifier"]

    joblib.dump(preprocessor, output_dir / "preprocessing_pipeline.pkl")
    joblib.dump(classifier, output_dir / "model.pkl")

    meta = {
        "numeric_features": numeric,
        "binary_features": binary,
        "categorical_features": categorical,
        "target_column": config["target_column"],
        "tier_labels": config["tier_labels"],
        "tier_to_hit": {str(k): list(v) for k, v in TIER_TO_HIT.items()},
        "tier_mean_weeks": tier_means,
        "feature_labels": FEATURE_LABELS,
        "accuracy": cv_metrics["accuracy"],
        "top_importances": aggregate_importances(preprocessor, classifier),
    }
    (output_dir / "feature_schema.json").write_text(json.dumps(meta, indent=2) + "\n")
    print(f"Saved artifacts -> {output_dir}")


def save_model_report(
    config: dict,
    cv_report: dict,
    top_importances: list[dict],
    training_rows: int,
    output_dir: Path,
) -> None:
    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "model": "RandomForestClassifier (3-tier HitTier, production)",
        "feature_config": str(FEATURE_CONFIG_PATH.relative_to(ROOT)),
        "data_path": "src/data/data.csv",
        "training_rows": training_rows,
        "training_scope": "full_dataset",
        "target_column": config["target_column"],
        "tier_labels": config["tier_labels"],
        "tier_to_hit": {str(k): list(v) for k, v in TIER_TO_HIT.items()},
        "feature_counts": {
            "numeric": len(config["numeric_features"]),
            "binary": len(config["binary_features"]),
            "categorical": len(config["categorical_features"]),
            "total": (
                len(config["numeric_features"])
                + len(config["binary_features"])
                + len(config["categorical_features"])
            ),
        },
        "evaluation": cv_report,
        "top_20_feature_importances": top_importances,
        "artifacts": [
            "model.pkl",
            "preprocessing_pipeline.pkl",
            "feature_schema.json",
            "model_report.json",
        ],
    }
    report_path = output_dir / "model_report.json"
    report_path.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"Saved model report -> {report_path}")


def main() -> int:
    args = parse_args()
    try:
        config = load_feature_config()
        df = load_dataset(args.data_path, config)
        X, y, numeric, binary, categorical = build_feature_matrix(df, config)
        pipeline = build_training_pipeline(numeric, binary, categorical)

        cv_report = cross_validate(
            pipeline, X, y, config, n_splits=5, random_state=args.random_state
        )
        pipeline.fit(X, y)
        top_importances = aggregate_importances_detailed(
            pipeline.named_steps["preprocessor"],
            pipeline.named_steps["classifier"],
            top_n=20,
        )

        tier_means = tier_mean_weeks(df, config)
        save_artifacts(
            pipeline,
            config,
            numeric,
            binary,
            categorical,
            cv_report["metrics"],
            tier_means,
            args.output_dir,
        )
        save_model_report(config, cv_report, top_importances, len(X), args.output_dir)
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
