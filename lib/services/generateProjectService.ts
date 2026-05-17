import { Prisma } from "@/generated/prisma/client";
import { AppError } from "@/lib/api/http";
import { sanitizePromptInput } from "@/lib/ai/sanitizePromptInput";
import { generateDocuments } from "@/lib/generators/generateDocuments";
import { prisma } from "@/lib/prisma";
import { intakeSchema, type IntakeSchemaValues } from "@/lib/validators/intakeSchema";

export type GenerateProjectInput = {
  intake: unknown;
  clarificationQuestions?: unknown;
  clarificationAnswers?: unknown;
};

export type GenerateProjectResult = {
  projectId: string;
  brd: string;
  prd: string;
  srs: string;
  agent: string;
};

function toSafeJson(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    return undefined;
  }

  return JSON.parse(serialized) as unknown;
}

function toRequiredJsonInput(value: unknown): Prisma.InputJsonValue {
  const normalized = toSafeJson(value);
  if (normalized === undefined || normalized === null) {
    return {} as Prisma.InputJsonValue;
  }

  return normalized as Prisma.InputJsonValue;
}

function toNullableJsonInput(
  value: unknown,
): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue | undefined {
  const normalized = toSafeJson(value);

  if (normalized === undefined) {
    return undefined;
  }

  if (normalized === null) {
    return Prisma.JsonNull;
  }

  return normalized as Prisma.InputJsonValue;
}

function normalizeOptionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIntakeForStorage(intake: IntakeSchemaValues): IntakeSchemaValues {
  const normalizedEntries = Object.entries(intake).map(([key, value]) => [
    key,
    normalizeOptionalString(value),
  ]);

  return Object.fromEntries(normalizedEntries) as IntakeSchemaValues;
}

export function parseGenerateProjectInput(input: GenerateProjectInput) {
  const intakeValidation = intakeSchema.safeParse(input.intake);

  if (!intakeValidation.success) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Invalid intake payload.",
      status: 422,
      details: intakeValidation.error.flatten(),
    });
  }

  return {
    intake: normalizeIntakeForStorage(intakeValidation.data),
    clarificationQuestions: input.clarificationQuestions,
    clarificationAnswers: input.clarificationAnswers,
  };
}

export async function generateProject(
  input: ReturnType<typeof parseGenerateProjectInput>,
): Promise<GenerateProjectResult> {
  const sanitizedInput = {
    intake: sanitizePromptInput(input.intake),
    clarificationQuestions: sanitizePromptInput(input.clarificationQuestions ?? null),
    clarificationAnswers: sanitizePromptInput(input.clarificationAnswers ?? null),
  };

  const generated = await generateDocuments({
    intake: sanitizedInput.intake,
    clarificationQuestions: sanitizedInput.clarificationQuestions,
    clarificationAnswers: sanitizedInput.clarificationAnswers,
  });

  const clarificationQuestionsJson = toNullableJsonInput(input.clarificationQuestions);
  const clarificationAnswersJson = toNullableJsonInput(input.clarificationAnswers);

  const project = await prisma.project.create({
    data: {
      name: input.intake.projectName,
      type: input.intake.projectType,
      description: input.intake.projectDescription,
      intakeJson: toRequiredJsonInput(input.intake),
      ...(clarificationQuestionsJson !== undefined
        ? { clarificationQuestions: clarificationQuestionsJson }
        : {}),
      ...(clarificationAnswersJson !== undefined
        ? { clarificationAnswers: clarificationAnswersJson }
        : {}),
      brd: generated.brd,
      prd: generated.prd,
      srs: generated.srs,
      agent: generated.agent,
    },
    select: {
      id: true,
    },
  });

  return {
    projectId: project.id,
    brd: generated.brd,
    prd: generated.prd,
    srs: generated.srs,
    agent: generated.agent,
  };
}
