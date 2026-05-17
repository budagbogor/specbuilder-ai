import { AppError } from "@/lib/api/http";

type RateLimitCounter = {
  count: number;
  windowStart: number;
};

const globalRateLimitState = globalThis as typeof globalThis & {
  __specbuilderRateLimitMap?: Map<string, RateLimitCounter>;
};

function getRateLimitMap() {
  if (!globalRateLimitState.__specbuilderRateLimitMap) {
    globalRateLimitState.__specbuilderRateLimitMap = new Map<
      string,
      RateLimitCounter
    >();
  }

  return globalRateLimitState.__specbuilderRateLimitMap;
}

export function enforceRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const map = getRateLimitMap();
  const now = Date.now();
  const existing = map.get(params.key);

  if (!existing || now - existing.windowStart >= params.windowMs) {
    map.set(params.key, {
      count: 1,
      windowStart: now,
    });
    return;
  }

  if (existing.count >= params.limit) {
    const retryAfterMs = params.windowMs - (now - existing.windowStart);
    throw new AppError({
      code: "RATE_LIMITED",
      message: "Too many requests. Please retry later.",
      status: 429,
      details: {
        retryAfterMs,
      },
    });
  }

  map.set(params.key, {
    count: existing.count + 1,
    windowStart: existing.windowStart,
  });
}

export function resolveRateLimitKey(request: Request, scope: string): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();
  const fallbackIp = request.headers.get("x-real-ip")?.trim();
  const clientIdentity = firstForwardedIp || fallbackIp || "unknown-client";
  return `${scope}:${clientIdentity}`;
}
