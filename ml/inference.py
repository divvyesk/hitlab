"""Cached model inference for HitLab predictions."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from tier_utils import create_hit_tier

ML_DIR = Path(__file__).resolve().parent
ARTIFACTS = ML_DIR / "artifacts"

CAMEL_TO_SNAKE = {
    "cdrGenre": "cdr_genre",
    "songStructure": "song_structure",
    "bpm": "bpm",
    "energy": "energy",
    "danceability": "danceability",
    "happiness": "happiness",
    "loudnessDb": "loudness_db",
    "acousticness": "acousticness",
    "lengthSec": "length_sec",
    "introLengthSec": "intro_length_sec",
    "explicit": "explicit",
    "guitarBased": "guitar_based",
    "bassBased": "bass_based",
    "vocallyBased": "vocally_based",
    "rapVerseNonRap": "rap_verse_non_rap",
    "vocalIntroduction": "vocal_introduction",
    "fadeOut": "fade_out",
}

NUMERIC_RANGES: dict[str, tuple[float, float]] = {
    "bpm": (40, 220),
    "energy": (0, 100),
    "danceability": (0, 100),
    "happiness": (0, 100),
    "loudness_db": (-60, 0),
    "acousticness": (0, 100),
    "length_sec": (60, 600),
    "intro_length_sec": (0, 120),
}


class ValidationError(ValueError):
    """Raised when request payload fails schema validation."""


@lru_cache(maxsize=1)
def load_schema() -> dict:
    return json.loads((ARTIFACTS / "feature_schema.json").read_text())


@lru_cache(maxsize=1)
def load_defaults() -> dict:
    return json.loads((ARTIFACTS / "feature_defaults.json").read_text())


@lru_cache(maxsize=1)
def load_artifacts() -> tuple[Any, Any]:
    import sys
    import time

    started_at = time.perf_counter()
    preprocessor_path = ARTIFACTS / "preprocessing_pipeline.pkl"
    model_path = ARTIFACTS / "model.pkl"
    schema_path = ARTIFACTS / "feature_schema.json"

    for path in (preprocessor_path, model_path, schema_path):
        if not path.exists():
            raise FileNotFoundError(f"Missing artifact: {path}")

    preprocessor = joblib.load(preprocessor_path)
    classifier = joblib.load(model_path)
    schema = load_schema()
    tier_labels = schema.get("tier_labels", [])
    classes = [int(cls) for cls in classifier.classes_]

    print(
        f"[inference] artifacts_loaded elapsed_ms={round((time.perf_counter() - started_at) * 1000, 1)} "
        f"tier_labels={tier_labels} classes={classes}",
        file=sys.stderr,
        flush=True,
    )

    if tier_labels != ["SHORT", "MODERATE", "SUSTAINED"]:
        raise ValueError(f"Unexpected tier_labels in feature_schema.json: {tier_labels}")

    if classes != [1, 2, 3]:
        raise ValueError(f"Unexpected classifier classes: {classes}")

    return preprocessor, classifier


def validate_payload(payload: dict) -> None:
    if not isinstance(payload, dict):
        raise ValidationError("Request body must be a JSON object")

    schema = load_schema()
    defaults_data = load_defaults()
    ui_options = defaults_data.get("ui_options", {})

    for camel, snake in CAMEL_TO_SNAKE.items():
        if camel not in payload:
            continue

        value = payload[camel]
        if snake in schema["numeric_features"]:
            if not isinstance(value, (int, float)) or isinstance(value, bool):
                raise ValidationError(f"{camel} must be a number")
            low, high = NUMERIC_RANGES[snake]
            if not low <= float(value) <= high:
                raise ValidationError(f"{camel} must be between {low} and {high}")
        elif snake in schema["binary_features"]:
            if not isinstance(value, bool):
                raise ValidationError(f"{camel} must be a boolean")
        elif snake in schema["categorical_features"]:
            if not isinstance(value, str) or not value.strip():
                raise ValidationError(f"{camel} must be a non-empty string")
            allowed = ui_options.get(snake, [])
            if allowed and value not in allowed:
                raise ValidationError(f"{camel} must be one of the allowed values")

    required_categorical = {"cdrGenre", "songStructure"}
    required_numeric = {
        "bpm",
        "energy",
        "danceability",
        "happiness",
        "loudnessDb",
        "acousticness",
        "lengthSec",
        "introLengthSec",
    }
    required_binary = {
        "explicit",
        "guitarBased",
        "bassBased",
        "vocallyBased",
        "rapVerseNonRap",
        "vocalIntroduction",
        "fadeOut",
    }

    missing = sorted(
        (required_categorical | required_numeric | required_binary) - payload.keys()
    )
    if missing:
        raise ValidationError(f"Missing required fields: {', '.join(missing)}")


def to_feature_row(payload: dict) -> pd.DataFrame:
    schema = load_schema()
    defaults = load_defaults()["defaults"]
    row: dict[str, Any] = {}

    all_features = (
        schema["numeric_features"]
        + schema["binary_features"]
        + schema["categorical_features"]
    )

    for feature in all_features:
        row[feature] = defaults.get(feature)

    for camel, snake in CAMEL_TO_SNAKE.items():
        if camel in payload and payload[camel] is not None:
            row[snake] = payload[camel]

    for feature in schema["binary_features"]:
        row[feature] = int(bool(row.get(feature, 0)))

    return pd.DataFrame([row])


def tier_from_probabilities(
    proba_by_label: dict[str, float],
    schema: dict,
    classes: list[int],
    probabilities: Any,
) -> tuple[str, int]:
    tier_labels = schema["tier_labels"]
    label_by_id = {index + 1: label for index, label in enumerate(tier_labels)}
    tier_mean_weeks = schema.get("tier_mean_weeks")

    if tier_mean_weeks:
        expected_weeks = sum(
            proba_by_label[label] * float(tier_mean_weeks[label])
            for label in tier_labels
            if label in tier_mean_weeks
        )
        tier_id = create_hit_tier(round(expected_weeks))
        return label_by_id[tier_id], tier_id

    tier_id = int(classes[int(probabilities.argmax())])
    return label_by_id[tier_id], tier_id


def predict(payload: dict) -> dict:
    validate_payload(payload)
    schema = load_schema()
    preprocessor, classifier = load_artifacts()

    X = to_feature_row(payload)
    X_transformed = preprocessor.transform(X)
    probabilities = classifier.predict_proba(X_transformed)[0]
    classes = [int(cls) for cls in classifier.classes_]

    tier_labels = schema["tier_labels"]
    label_by_id = {index + 1: label for index, label in enumerate(tier_labels)}
    proba_by_label = {
        label_by_id[tier_class]: round(float(probability), 4)
        for tier_class, probability in zip(classes, probabilities)
        if tier_class in label_by_id
    }

    for label in tier_labels:
        proba_by_label.setdefault(label, 0.0)

    tier, _tier_id = tier_from_probabilities(
        proba_by_label, schema, classes, probabilities
    )
    confidence = round(float(max(probabilities)), 4)

    return {
        "tier": tier,
        "confidence": confidence,
        "probabilities": proba_by_label,
    }
