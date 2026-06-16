"""Similar-song retrieval using the production 22-feature space."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

import joblib

from inference import (
    ARTIFACTS,
    ValidationError,
    load_artifacts,
    to_feature_row,
    validate_payload,
)


@lru_cache(maxsize=1)
def load_similarity_model() -> dict[str, Any]:
    model_path = ARTIFACTS / "similarity_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(
            f"Missing similarity model. Run build_similarity.py first: {model_path}"
        )
    return joblib.load(model_path)


def find_similar(payload: dict, k: int = 5) -> dict:
    validate_payload(payload)
    similarity_data = load_similarity_model()
    preprocessor, _ = load_artifacts()

    X = to_feature_row(payload)
    X_transformed = preprocessor.transform(X)

    neighbors = similarity_data["neighbors"]
    songs = similarity_data["songs"]
    distances, indices = neighbors.kneighbors(X_transformed, n_neighbors=k)

    matches = []
    for distance, index in zip(distances[0], indices[0]):
        meta = songs[int(index)]
        matches.append({
            "song": meta["song"],
            "artist": meta["artist"],
            "genre": meta["genre"],
            "tier": meta["tier"],
            "similarity": round(max(0.0, 1.0 - float(distance)), 4),
        })

    return {"songs": matches}
