import {
  HistoryClient,
  type ProjectDetail,
  type ProjectsListItem,
} from "@/components/history/HistoryClient";
import { prisma } from "@/lib/prisma";

function toListItem(item: {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}): ProjectsListItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function toProjectDetail(item: {
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
}): ProjectDetail {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    description: item.description,
    intake: item.intakeJson,
    clarificationQuestions: item.clarificationQuestions,
    clarificationAnswers: item.clarificationAnswers,
    brd: item.brd ?? "",
    prd: item.prd ?? "",
    srs: item.srs ?? "",
    agent: item.agent ?? "",
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export default async function HistoryPage() {
  const projectsRaw = await prisma.project.findMany({
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

  const initialProjects = projectsRaw.map(toListItem);
  const firstProjectId = initialProjects[0]?.id;

  let initialProjectDetail: ProjectDetail | null = null;
  if (firstProjectId) {
    const projectDetailRaw = await prisma.project.findUnique({
      where: {
        id: firstProjectId,
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

    if (projectDetailRaw) {
      initialProjectDetail = toProjectDetail(projectDetailRaw);
    }
  }

  return (
    <HistoryClient
      initialProjects={initialProjects}
      initialProjectDetail={initialProjectDetail}
    />
  );
}
