import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import path from "node:path";

const WORKER_SCRIPT = path.join(process.cwd(), "ml", "predict_worker.py");
const PREDICT_TIMEOUT_MS = 3_000;
const STARTUP_TIMEOUT_MS = 10_000;

interface WorkerResponse {
  id?: string;
  ready?: boolean;
  result?: {
    tier?: string;
    confidence?: number;
    probabilities?: Record<string, number>;
    songs?: Array<{
      song: string;
      artist: string;
      genre: string;
      tier: string;
      similarity: number;
    }>;
  };
  error?: string;
  status?: number;
}

type PendingRequest = {
  resolve: (value: WorkerResponse) => void;
  reject: (reason: Error) => void;
  timer: NodeJS.Timeout;
  startedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __hitlabPredictWorker: LocalPredictWorker | undefined;
}

export interface PredictWorkerResult {
  tier?: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  songs?: Array<{
    song: string;
    artist: string;
    genre: string;
    tier: string;
    similarity: number;
  }>;
}

export interface PredictWorkerClient {
  predict(
    payload: Record<string, unknown>
  ): Promise<NonNullable<PredictWorkerResult>>;
  findSimilarSongs(
    payload: Record<string, unknown>
  ): Promise<NonNullable<PredictWorkerResult>>;
}

function log(stage: string, detail?: Record<string, unknown>): void {
  console.error(
    `[predict-worker] ${stage}`,
    detail ? JSON.stringify(detail) : ""
  );
}

class RemotePredictWorker implements PredictWorkerClient {
  constructor(private readonly baseUrl: string) {}

  async predict(
    payload: Record<string, unknown>
  ): Promise<NonNullable<PredictWorkerResult>> {
    return this.post("/predict", payload, (result) => {
      if (!result.tier || result.confidence === undefined || !result.probabilities) {
        throw new Error("ML service returned an empty prediction");
      }
    });
  }

  async findSimilarSongs(
    payload: Record<string, unknown>
  ): Promise<NonNullable<PredictWorkerResult>> {
    return this.post("/similar", payload, (result) => {
      if (!result.songs?.length) {
        throw new Error("ML service returned no similar songs");
      }
    });
  }

  private async post(
    path: string,
    payload: Record<string, unknown>,
    validate: (result: PredictWorkerResult) => void
  ): Promise<NonNullable<PredictWorkerResult>> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as PredictWorkerResult & { error?: string };
    if (!response.ok) {
      throw new Error(data.error ?? `ML service request failed (${response.status})`);
    }

    validate(data);
    return data;
  }
}

class LocalPredictWorker implements PredictWorkerClient {
  private process: ChildProcessWithoutNullStreams | null = null;
  private ready = false;
  private starting: Promise<void> | null = null;
  private buffer = "";
  private pending = new Map<string, PendingRequest>();
  private startupResolve: (() => void) | null = null;
  private startupReject: ((error: Error) => void) | null = null;

  async predict(
    payload: Record<string, unknown>
  ): Promise<NonNullable<WorkerResponse["result"]>> {
    const result = await this.request("predict", payload);
    if (!result.tier || result.confidence === undefined || !result.probabilities) {
      throw new Error("Prediction worker returned an empty result");
    }
    return result;
  }

  async findSimilarSongs(
    payload: Record<string, unknown>
  ): Promise<NonNullable<WorkerResponse["result"]>> {
    const result = await this.request("similar", payload);
    if (!result.songs?.length) {
      throw new Error("Similarity worker returned no matches");
    }
    return result;
  }

  private async request(
    action: "predict" | "similar",
    payload: Record<string, unknown>
  ): Promise<NonNullable<WorkerResponse["result"]>> {
    await this.ensureReady();

    if (!this.isProcessAlive()) {
      log("request:dead-process-restart", { action });
      this.reset();
      await this.ensureReady();
    }

    const id = crypto.randomUUID();
    log("request:sent", { id, action });

    const response = await new Promise<WorkerResponse>((resolve, reject) => {
      const startedAt = performance.now();
      const timer = setTimeout(() => {
        this.pending.delete(id);
        log("request:timeout", {
          id,
          action,
          elapsedMs: Math.round(performance.now() - startedAt),
          pendingCount: this.pending.size,
          processAlive: this.isProcessAlive(),
        });
        reject(
          new Error(
            action === "similar"
              ? "Similar songs lookup timed out"
              : "Prediction timed out"
          )
        );
      }, PREDICT_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timer, startedAt });

      const wrote = this.process?.stdin.write(
        `${JSON.stringify({ id, action, payload })}\n`,
        (error) => {
          if (error) {
            clearTimeout(timer);
            this.pending.delete(id);
            log("request:stdin-write-failed", {
              id,
              action,
              error: error.message,
            });
            this.reset();
            reject(error);
          }
        }
      );

      if (wrote === false) {
        log("request:stdin-backpressure", { id, action });
      }
    });

    if (response.error) {
      const error = new Error(response.error) as Error & { status?: number };
      error.status = response.status ?? 500;
      throw error;
    }

    if (!response.result) {
      throw new Error("Worker returned an empty result");
    }

    return response.result;
  }

  private async ensureReady(): Promise<void> {
    if (this.ready && this.isProcessAlive()) {
      return;
    }

    if (this.ready && !this.isProcessAlive()) {
      log("ensureReady:stale-ready-flag");
      this.reset();
    }

    if (!this.starting) {
      this.starting = this.start();
    }

    await this.starting;
  }

  private isProcessAlive(): boolean {
    return (
      this.process !== null &&
      this.process.exitCode === null &&
      this.process.signalCode === null &&
      !this.process.killed
    );
  }

  private async start(): Promise<void> {
    this.reset();

    log("start:spawning", { script: WORKER_SCRIPT, cwd: process.cwd() });
    const startedAt = performance.now();

    const child = spawn("python3", ["-u", WORKER_SCRIPT], {
      cwd: process.cwd(),
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    this.process = child;

    child.stdout.on("data", (chunk: Buffer) => {
      this.handleStdout(chunk.toString());
    });

    child.stderr.on("data", (chunk: Buffer) => {
      log("python-stderr", { message: chunk.toString().trim() });
    });

    child.on("error", (error) => {
      log("process:error", { message: error.message });
      this.rejectStartup(error);
      this.rejectAll(error);
      this.reset();
    });

    child.on("close", (code, signal) => {
      log("process:closed", { code, signal, pendingCount: this.pending.size });
      const error = new Error("Prediction worker exited unexpectedly");
      this.rejectStartup(error);
      this.rejectAll(error);
      this.reset();
    });

    await new Promise<void>((resolve, reject) => {
      this.startupResolve = resolve;
      this.startupReject = reject;

      const timer = setTimeout(() => {
        log("start:timeout", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        reject(new Error("Prediction worker failed to start"));
      }, STARTUP_TIMEOUT_MS);

      const originalResolve = resolve;
      this.startupResolve = () => {
        clearTimeout(timer);
        log("start:ready", {
          elapsedMs: Math.round(performance.now() - startedAt),
        });
        originalResolve();
      };
      this.startupReject = (error: Error) => {
        clearTimeout(timer);
        log("start:failed", { message: error.message });
        reject(error);
      };
    }).catch((error) => {
      this.reset();
      throw error;
    });
  }

  private handleStdout(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      let message: WorkerResponse;
      try {
        message = JSON.parse(line) as WorkerResponse;
      } catch {
        log("stdout:parse-error", { line: line.slice(0, 200) });
        continue;
      }

      if (!this.ready && message.ready) {
        this.ready = true;
        this.startupResolve?.();
        this.startupResolve = null;
        this.startupReject = null;
        continue;
      }

      if (!this.ready && message.error) {
        const error = new Error(message.error);
        this.startupReject?.(error);
        this.startupResolve = null;
        this.startupReject = null;
        continue;
      }

      if (!message.id) {
        continue;
      }

      const pending = this.pending.get(message.id);
      if (!pending) {
        log("stdout:orphan-response", { id: message.id });
        continue;
      }

      clearTimeout(pending.timer);
      this.pending.delete(message.id);
      log("request:response-received", {
        id: message.id,
        elapsedMs: Math.round(performance.now() - pending.startedAt),
        hasError: Boolean(message.error),
        tier: message.result?.tier,
        matchCount: message.result?.songs?.length ?? 0,
      });
      pending.resolve(message);
    }
  }

  private rejectStartup(error: Error): void {
    this.startupReject?.(error);
    this.startupResolve = null;
    this.startupReject = null;
  }

  private rejectAll(error: Error): void {
    for (const [id, pending] of this.pending.entries()) {
      clearTimeout(pending.timer);
      pending.reject(error);
      this.pending.delete(id);
    }
  }

  private reset(): void {
    if (this.process && this.isProcessAlive()) {
      this.process.kill();
    }

    this.ready = false;
    this.starting = null;
    this.process = null;
    this.buffer = "";
    this.startupResolve = null;
    this.startupReject = null;
  }
}

export function getPredictWorker(): PredictWorkerClient {
  const remoteUrl = process.env.ML_SERVICE_URL?.replace(/\/$/, "");
  if (remoteUrl) {
    return new RemotePredictWorker(remoteUrl);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "ML_SERVICE_URL is required on Vercel. Deploy ml/server.py separately and set the env var."
    );
  }

  if (process.env.RAILWAY_ENVIRONMENT && !process.env.ML_SERVICE_URL) {
    throw new Error(
      "ML_SERVICE_URL is required on Railway when using separate services. For the unified Dockerfile deploy, ML_SERVICE_URL is set automatically."
    );
  }

  if (!globalThis.__hitlabPredictWorker) {
    globalThis.__hitlabPredictWorker = new LocalPredictWorker();
  }

  return globalThis.__hitlabPredictWorker;
}
