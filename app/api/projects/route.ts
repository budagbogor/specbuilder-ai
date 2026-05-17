import { errorResponse, successResponse } from "@/lib/api/http";
import { listProjects } from "@/lib/services/projectService";

export async function GET() {
  try {
    const projects = await listProjects();
    return successResponse(projects);
  } catch (error) {
    return errorResponse(error, {
      message: "Failed to fetch projects.",
    });
  }
}
