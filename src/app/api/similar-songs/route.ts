import { NextResponse } from "next/server";
import { getPredictWorker } from "@/lib/predict-worker";
import { songInputSchema } from "@/lib/prediction-schema";

function log(stage: string, detail?: Record<string, unknown>): void {
  console.error(
    `[api/similar-songs] ${stage}`,
    detail ? JSON.stringify(detail) : ""
  );
}

export async function POST(request: Request) {
  const startedAt = performance.now();

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      log("validation_failed", { reason: "invalid_json" });
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = songInputSchema.safeParse(body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const field = issue?.path.join(".") ?? "input";
      log("validation_failed", {
        field,
        message: issue?.message ?? "Invalid input",
      });
      return NextResponse.json(
        { error: `${field}: ${issue?.message ?? "Invalid input"}` },
        { status: 400 }
      );
    }

    const worker = getPredictWorker();
    const result = await worker.findSimilarSongs(parsed.data);

    const response = {
      songs: result.songs?.slice(0, 5) ?? [],
    };

    const elapsedMs = performance.now() - startedAt;
    log("request_complete", {
      matchCount: response.songs.length,
      elapsedMs: Math.round(elapsedMs),
    });

    return NextResponse.json(response, {
      headers: {
        "X-Similar-Songs-Duration-Ms": elapsedMs.toFixed(1),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Similar songs lookup failed. Please try again.";
    const status =
      error instanceof Error && "status" in error
        ? Number((error as Error & { status?: number }).status) || 500
        : 500;

    log("request_failed", {
      message,
      status,
      elapsedMs: Math.round(performance.now() - startedAt),
    });

    return NextResponse.json({ error: message }, { status });
  }
}
