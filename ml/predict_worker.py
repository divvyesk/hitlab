#!/usr/bin/env python3
"""Long-lived inference worker. Reads one JSON request per line on stdin."""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path

from inference import ARTIFACTS, ValidationError, load_artifacts, predict
from similarity import find_similar, load_similarity_model


def log(stage: str, **detail: object) -> None:
    payload = {"stage": stage, **detail}
    print(f"[predict_worker] {json.dumps(payload)}", file=sys.stderr, flush=True)


def verify_artifacts() -> None:
    required = (
        "model.pkl",
        "preprocessing_pipeline.pkl",
        "feature_schema.json",
        "similarity_model.pkl",
    )
    missing = [name for name in required if not (ARTIFACTS / name).exists()]
    if missing:
        raise FileNotFoundError(f"Missing artifacts: {', '.join(missing)}")


def main() -> int:
    started_at = time.perf_counter()
    log("startup", artifacts_dir=str(ARTIFACTS))

    try:
        verify_artifacts()
        load_artifacts()
        load_similarity_model()
    except Exception as exc:
        log("startup_failed", error=str(exc))
        print(json.dumps({"error": f"Failed to load model artifacts: {exc}"}), flush=True)
        return 1

    log(
        "ready",
        elapsed_ms=round((time.perf_counter() - started_at) * 1000, 1),
    )
    print(json.dumps({"ready": True}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        request_id = None
        request_started_at = time.perf_counter()
        try:
            message = json.loads(line)
            request_id = message.get("id")
            action = message.get("action", "predict")
            payload = message.get("payload", {})
            log("request_received", request_id=request_id, action=action)

            if action == "similar":
                result = find_similar(payload)
            else:
                result = predict(payload)

            response = {"id": request_id, "result": result}
            log(
                "request_complete",
                request_id=request_id,
                action=action,
                tier=result.get("tier"),
                match_count=len(result.get("songs", [])),
                elapsed_ms=round((time.perf_counter() - request_started_at) * 1000, 1),
            )
        except ValidationError as exc:
            log(
                "request_validation_error",
                request_id=request_id,
                error=str(exc),
            )
            response = {"id": request_id, "error": str(exc), "status": 400}
        except Exception as exc:
            log(
                "request_failed",
                request_id=request_id,
                error=str(exc),
                elapsed_ms=round((time.perf_counter() - request_started_at) * 1000, 1),
            )
            response = {
                "id": request_id,
                "error": str(exc),
                "status": 500,
            }

        print(json.dumps(response), flush=True)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
