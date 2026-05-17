import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: ApiErrorPayload;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class AppError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: unknown;

  constructor(params: {
    code: string;
    message: string;
    status?: number;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.code = params.code;
    this.status = params.status ?? 500;
    this.details = params.details;
  }
}

export function validationErrorFromZod(
  error: ZodError,
  message = "Request validation failed.",
): AppError {
  return new AppError({
    code: "VALIDATION_ERROR",
    message,
    status: 422,
    details: error.flatten(),
  });
}

function toAppError(
  error: unknown,
  fallback: {
    code: string;
    message: string;
    status: number;
  },
): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof ZodError) {
    return validationErrorFromZod(error);
  }

  return new AppError({
    code: fallback.code,
    message:
      error instanceof Error && error.message.trim().length > 0
        ? error.message
        : fallback.message,
    status: fallback.status,
  });
}

export function successResponse<T>(
  data: T,
  options?: {
    status?: number;
    meta?: Record<string, unknown>;
  },
) {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (options?.meta) {
    body.meta = options.meta;
  }

  return NextResponse.json(body, {
    status: options?.status ?? 200,
  });
}

export function errorResponse(
  error: unknown,
  fallback?: {
    code?: string;
    message?: string;
    status?: number;
  },
) {
  const resolvedError = toAppError(error, {
    code: fallback?.code ?? "INTERNAL_ERROR",
    message: fallback?.message ?? "Unexpected server error.",
    status: fallback?.status ?? 500,
  });

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: resolvedError.code,
      message: resolvedError.message,
      ...(resolvedError.details !== undefined
        ? { details: resolvedError.details }
        : {}),
    },
  };

  return NextResponse.json(body, {
    status: resolvedError.status,
  });
}
