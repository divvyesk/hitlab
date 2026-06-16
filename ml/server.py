#!/usr/bin/env python3
"""HTTP inference service for HitLab ML. Deploy as a Railway service."""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from inference import ValidationError, load_artifacts, predict
from similarity import find_similar, load_similarity_model


class Handler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        return

    def _read_json(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b"{}"
        return json.loads(body.decode("utf-8"))

    def _send(self, status: int, payload: dict) -> None:
        data = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        if self.path.rstrip("/") == "/health":
            self._send(200, {"ok": True})
            return
        self._send(404, {"error": "Not found"})

    def do_POST(self) -> None:
        try:
            payload = self._read_json()
            path = self.path.rstrip("/")

            if path == "/predict":
                self._send(200, predict(payload))
                return

            if path == "/similar":
                self._send(200, find_similar(payload))
                return

            self._send(404, {"error": "Not found"})
        except ValidationError as exc:
            self._send(400, {"error": str(exc)})
        except Exception as exc:
            self._send(500, {"error": str(exc)})


def main() -> None:
    load_artifacts()
    load_similarity_model()
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    print(f"HitLab ML service listening on :{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
