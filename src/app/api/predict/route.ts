import featureDefaults from "@/data/feature_defaults.json";
import featureSchema from "../../../../ml/artifacts/feature_schema.json";
import { NextResponse } from "next/server";
import { getPredictWorker } from "@/lib/predict-worker";
import { songInputSchema, type HitTier } from "@/lib/prediction-schema";
import { TIER_CHART_WEEKS } from "@/lib/prediction-tiers";

const TIER_SCORE_WEIGHTS: Record<string, number> = {
  SHORT: 33,
  MODERATE: 66,
  SUSTAINED: 100,
};

function scoreFromProbabilities(probabilities: Record<string, number>): number {
  return Math.round(
    Object.entries(probabilities).reduce(
      (total, [tier, probability]) =>
        total + probability * (TIER_SCORE_WEIGHTS[tier] ?? 0),
      0
    ) * 100
  ) / 100;
}

function log(stage: string, detail?: Record<string, unknown>): void {
  console.error(`[api/predict] ${stage}`, detail ? JSON.stringify(detail) : "");
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

    log("worker_predict_start");
    const worker = getPredictWorker();
    const result = await worker.predict(parsed.data);
    log("worker_predict_complete", {
      tier: result?.tier,
      elapsedMs: Math.round(performance.now() - startedAt),
    });

    if (
      !result?.tier ||
      result.confidence === undefined ||
      !result.probabilities
    ) {
      return NextResponse.json(
        { error: "Prediction failed. Please try again." },
        { status: 500 }
      );
    }

    const tier = result.tier as HitTier;
    const response = {
      tier,
      confidence: result.confidence,
      probabilities: result.probabilities,
      chartWeeks: TIER_CHART_WEEKS[tier] ?? "Unknown",
      score: scoreFromProbabilities(result.probabilities),
      featureImportance: featureSchema.top_importances,
    };

    const elapsedMs = performance.now() - startedAt;
    return NextResponse.json(response, {
      headers: {
        "X-Prediction-Duration-Ms": elapsedMs.toFixed(1),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Prediction failed. Please try again.";
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
