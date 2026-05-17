import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateDocumentsSchema = z
  .object({
    brd: z.string().optional(),
    prd: z.string().optional(),
    srs: z.string().optional(),
    agent: z.string().optional(),
  })
  .refine(
    (data) =>
      data.brd !== undefined ||
      data.prd !== undefined ||
      data.srs !== undefined ||
      data.agent !== undefined,
    { message: "At least one document field must be provided." },
  );

function toProjectDetailPayload(project: {
  id: string;
  name: string;
  type: string;
  description: string;
  intakeJson: unknown;
  clarificationQuestions: unknown;
  clarificationAnswers: unknown;
  brd: string | null;
  prd: string | null;
  srs: string | null;
  agent: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: project.id,
    name: project.name,
    type: project.type,
    description: project.description,
    intake: project.intakeJson,
    clarificationQuestions: project.clarificationQuestions,
    clarificationAnswers: project.clarificationAnswers,
    brd: project.brd ?? "",
    prd: project.prd ?? "",
    srs: project.srs ?? "",
    agent: project.agent ?? "",
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        intakeJson: true,
        clarificationQuestions: true,
        clarificationAnswers: true,
        brd: true,
        prd: true,
        srs: true,
        agent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: toProjectDetailPayload(project),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch project detail.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const payload = await request.json();
    const parsedPayload = updateDocumentsSchema.safeParse(payload);

    if (!parsedPayload.success) {
      const firstIssue = parsedPayload.error.issues[0]?.message ?? "Invalid payload.";
      return NextResponse.json(
        {
          success: false,
          error: firstIssue,
        },
        { status: 400 },
      );
    }

    const existingProject = await prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found.",
        },
        { status: 404 },
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        ...(parsedPayload.data.brd !== undefined ? { brd: parsedPayload.data.brd } : {}),
        ...(parsedPayload.data.prd !== undefined ? { prd: parsedPayload.data.prd } : {}),
        ...(parsedPayload.data.srs !== undefined ? { srs: parsedPayload.data.srs } : {}),
        ...(parsedPayload.data.agent !== undefined
          ? { agent: parsedPayload.data.agent }
          : {}),
      },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        intakeJson: true,
        clarificationQuestions: true,
        clarificationAnswers: true,
        brd: true,
        prd: true,
        srs: true,
        agent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: toProjectDetailPayload(updatedProject),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update project documents.";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
