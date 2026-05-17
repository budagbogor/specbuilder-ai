import { AppError, errorResponse, successResponse } from "@/lib/api/http";
import {
  getProjectDetailById,
  parseUpdateDocumentsPayload,
  updateProjectDocuments,
} from "@/lib/services/projectService";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const project = await getProjectDetailById(id);
    return successResponse(project);
  } catch (error) {
    return errorResponse(error, {
      message: "Failed to fetch project detail.",
    });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json().catch(() => {
      throw new AppError({
        code: "INVALID_JSON",
        message: "Invalid JSON body.",
        status: 400,
      });
    });
    const parsedPayload = parseUpdateDocumentsPayload(payload);
    const updatedProject = await updateProjectDocuments({
      id,
      data: parsedPayload,
    });

    return successResponse(updatedProject);
  } catch (error) {
    return errorResponse(error, {
      message: "Failed to update project documents.",
    });
  }
}
