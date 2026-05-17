import { z } from "zod";
import { AppError } from "@/lib/api/http";
import { prisma } from "@/lib/prisma";

export type ProjectsListItem = {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProjectDetail = {
  id: string;
  name: string;
  type: string;
  description: string;
  intake: unknown;
  clarificationQuestions: unknown;
  clarificationAnswers: unknown;
  brd: string;
  prd: string;
  srs: string;
  agent: string;
  createdAt: Date;
  updatedAt: Date;
};

const updateDocumentsSchema = z
  .object({
    brd: z.string().trim().optional(),
    prd: z.string().trim().optional(),
    srs: z.string().trim().optional(),
    agent: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      data.brd !== undefined ||
      data.prd !== undefined ||
      data.srs !== undefined ||
      data.agent !== undefined,
    { message: "At least one document field must be provided." },
  );

type ProjectRow = {
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
};

function mapToProjectDetail(project: ProjectRow): ProjectDetail {
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

export function parseUpdateDocumentsPayload(payload: unknown) {
  const parsedPayload = updateDocumentsSchema.safeParse(payload);

  if (!parsedPayload.success) {
    throw new AppError({
      code: "VALIDATION_ERROR",
      message: "Invalid update documents payload.",
      status: 422,
      details: parsedPayload.error.flatten(),
    });
  }

  return parsedPayload.data;
}

export async function listProjects(): Promise<ProjectsListItem[]> {
  return prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      type: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getProjectDetailById(id: string): Promise<ProjectDetail> {
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
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
      status: 404,
    });
  }

  return mapToProjectDetail(project);
}

export async function updateProjectDocuments(params: {
  id: string;
  data: ReturnType<typeof parseUpdateDocumentsPayload>;
}): Promise<ProjectDetail> {
  const existingProject = await prisma.project.findUnique({
    where: { id: params.id },
    select: { id: true },
  });

  if (!existingProject) {
    throw new AppError({
      code: "PROJECT_NOT_FOUND",
      message: "Project not found.",
      status: 404,
    });
  }

  const updatedProject = await prisma.project.update({
    where: { id: params.id },
    data: {
      ...(params.data.brd !== undefined ? { brd: params.data.brd } : {}),
      ...(params.data.prd !== undefined ? { prd: params.data.prd } : {}),
      ...(params.data.srs !== undefined ? { srs: params.data.srs } : {}),
      ...(params.data.agent !== undefined ? { agent: params.data.agent } : {}),
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

  return mapToProjectDetail(updatedProject);
}
