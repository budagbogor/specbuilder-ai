import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { generateDocuments } from "@/lib/generators/generateDocuments";
import { prisma } from "@/lib/prisma";
import { intakeSchema } from "@/lib/validators/intakeSchema";

type GenerateRequestBody = {
  intake?: unknown;
  clarificationQuestions?: unknown;
  clarificationAnswers?: unknown;
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

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const intakeValidation = intakeSchema.safeParse(body.intake);

    if (!intakeValidation.success) {
      const fieldErrors = intakeValidation.error.flatten().fieldErrors;
      const firstError =
        Object.values(fieldErrors).flat().find((message) => Boolean(message)) ??
        "Invalid intake payload.";

      return NextResponse.json(
        {
          success: false,
          error: firstError,
        },
        { status: 400 },
      );
    }

    const intake = intakeValidation.data;

    const generated = await generateDocuments({
      intake,
      clarificationQuestions: body.clarificationQuestions,
      clarificationAnswers: body.clarificationAnswers,
    });

    const clarificationQuestionsJson = toNullableJsonInput(body.clarificationQuestions);
    const clarificationAnswersJson = toNullableJsonInput(body.clarificationAnswers);

    const project = await prisma.project.create({
      data: {
        name: intake.projectName,
        type: intake.projectType,
        description: intake.projectDescription,
        intakeJson: toRequiredJsonInput(intake),
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

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        brd: generated.brd,
        prd: generated.prd,
        srs: generated.srs,
        agent: generated.agent,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unexpected error while generating documents.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
