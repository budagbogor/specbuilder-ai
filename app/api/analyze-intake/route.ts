import {
  AppError,
  errorResponse,
  successResponse,
  validationErrorFromZod,
} from "@/lib/api/http";
import { analyzeIntake } from "@/lib/services/analyzeIntakeService";
import {
  enforceRateLimit,
  resolveRateLimitKey,
} from "@/lib/services/rateLimitService";
import { intakeSchema } from "@/lib/validators/intakeSchema";

const ANALYZE_RATE_LIMIT = Number(process.env.AI_ANALYZE_RATE_LIMIT ?? 12);
const ANALYZE_RATE_LIMIT_WINDOW_MS = Number(
  process.env.AI_ANALYZE_RATE_LIMIT_WINDOW_MS ?? 60_000,
);

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      key: resolveRateLimitKey(request, "analyze-intake"),
      limit: Number.isFinite(ANALYZE_RATE_LIMIT) ? ANALYZE_RATE_LIMIT : 12,
      windowMs: Number.isFinite(ANALYZE_RATE_LIMIT_WINDOW_MS)
        ? ANALYZE_RATE_LIMIT_WINDOW_MS
        : 60_000,
    });

    const rawBody: unknown = await request.json().catch(() => {
      throw new AppError({
        code: "INVALID_JSON",
        message: "Invalid JSON body.",
        status: 400,
      });
    });
    const validationResult = intakeSchema.safeParse(rawBody);

    if (!validationResult.success) {
      return errorResponse(
        validationErrorFromZod(validationResult.error, "Invalid intake payload."),
      );
    }

    const result = await analyzeIntake(validationResult.data);

    return successResponse(result.data, {
      meta: {
        source: result.source,
      },
    });
  } catch (error) {
    return errorResponse(error, {
      message: "Unexpected error while analyzing intake.",
    });
  }
}
