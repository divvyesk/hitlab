#!/usr/bin/env python3
"""Run inference for a single song feature vector."""

from __future__ import annotations

import json
import sys

from inference import ValidationError, predict


def main() -> int:
    try:
        payload = json.loads(sys.stdin.read() or "{}")
        print(json.dumps(predict(payload)))
        return 0
    except ValidationError as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stdout)
        return 1
    except Exception as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stdout)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
