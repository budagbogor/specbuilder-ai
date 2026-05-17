import { AppError, errorResponse, successResponse } from "@/lib/api/http";
import {
  generateProject,
  parseGenerateProjectInput,
} from "@/lib/services/generateProjectService";
import {
  enforceRateLimit,
  resolveRateLimitKey,
} from "@/lib/services/rateLimitService";

const GENERATE_RATE_LIMIT = Number(process.env.AI_GENERATE_RATE_LIMIT ?? 6);
const GENERATE_RATE_LIMIT_WINDOW_MS = Number(
  process.env.AI_GENERATE_RATE_LIMIT_WINDOW_MS ?? 60_000,
);

export async function POST(request: Request) {
  try {
    enforceRateLimit({
      key: resolveRateLimitKey(request, "generate"),
      limit: Number.isFinite(GENERATE_RATE_LIMIT) ? GENERATE_RATE_LIMIT : 6,
      windowMs: Number.isFinite(GENERATE_RATE_LIMIT_WINDOW_MS)
        ? GENERATE_RATE_LIMIT_WINDOW_MS
        : 60_000,
    });

    const body = (await request.json().catch(() => {
      throw new AppError({
        code: "INVALID_JSON",
        message: "Invalid JSON body.",
        status: 400,
      });
    })) as {
      intake?: unknown;
      clarificationQuestions?: unknown;
      clarificationAnswers?: unknown;
    };

    const parsedInput = parseGenerateProjectInput({
      intake: body.intake,
      clarificationQuestions: body.clarificationQuestions,
      clarificationAnswers: body.clarificationAnswers,
    });

    const result = await generateProject(parsedInput);

    return successResponse(result, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error, {
      message: "Unexpected error while generating documents.",
    });
  }
}
