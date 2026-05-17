"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  Database,
  FileText,
  Loader2,
  RefreshCcw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { DocumentTabs, type DocumentState } from "@/components/documents/DocumentTabs";
import { DownloadButtons } from "@/components/documents/DownloadButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ProjectsListItem = {
  id: string;
  name: string;
  type: string;
  description: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

function resolveApiErrorMessage<T>(payload: ApiResponse<T>, fallbackMessage: string): string {
  if (payload.success) {
    return fallbackMessage;
  }

  const message = payload.error.message?.trim();
  return message && message.length > 0 ? message : fallbackMessage;
}

type HistoryClientProps = {
  initialProjects: ProjectsListItem[];
  initialProjectDetail: ProjectDetail | null;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function parseDocuments(detail: ProjectDetail): DocumentState {
  return {
    brd: detail.brd ?? "",
    prd: detail.prd ?? "",
    srs: detail.srs ?? "",
    agent: detail.agent ?? "",
  };
}

function areDocumentsEqual(a: DocumentState | null, b: DocumentState | null) {
  if (!a || !b) {
    return false;
  }

  return (
    a.brd === b.brd &&
    a.prd === b.prd &&
    a.srs === b.srs &&
    a.agent === b.agent
  );
}

function renderJson(value: unknown) {
  return JSON.stringify(value ?? null, null, 2);
}

export function HistoryClient({
  initialProjects,
  initialProjectDetail,
}: HistoryClientProps) {
  const [projects, setProjects] = useState<ProjectsListItem[]>(initialProjects);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectDetail?.id ?? initialProjects[0]?.id ?? null,
  );
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(
    initialProjectDetail,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const [editedDocuments, setEditedDocuments] = useState<DocumentState | null>(
    initialProjectDetail ? parseDocuments(initialProjectDetail) : null,
  );
  const [isSavingDocuments, setIsSavingDocuments] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const query = searchQuery.toLowerCase().trim();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query),
    );
  }, [projects, searchQuery]);

  const loadProjectDetail = async (projectId: string) => {
    try {
      setIsLoadingDetail(true);
      setDetailError(null);
      setSaveStatus(null);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "GET",
        cache: "no-store",
      });
      const result = (await response.json()) as ApiResponse<ProjectDetail>;

      if (!response.ok || !result.success) {
        const message = resolveApiErrorMessage(result, "Failed to fetch project detail.");
        throw new Error(message);
      }

      setSelectedProjectId(result.data.id);
      setProjectDetail(result.data);
      setEditedDocuments(parseDocuments(result.data));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while loading detail.";
      setDetailError(message);
      setProjectDetail(null);
      setEditedDocuments(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const loadProjects = async () => {
    try {
      setIsLoadingProjects(true);
      setProjectsError(null);

      const response = await fetch("/api/projects", {
        method: "GET",
        cache: "no-store",
      });
      const result = (await response.json()) as ApiResponse<ProjectsListItem[]>;

      if (!response.ok || !result.success) {
        const message = resolveApiErrorMessage(result, "Failed to fetch project list.");
        throw new Error(message);
      }

      setProjects(result.data);

      if (result.data.length === 0) {
        setSelectedProjectId(null);
        setProjectDetail(null);
        setEditedDocuments(null);
        return;
      }

      const nextProjectId =
        selectedProjectId && result.data.some((item) => item.id === selectedProjectId)
          ? selectedProjectId
          : result.data[0].id;

      if (!projectDetail || projectDetail.id !== nextProjectId) {
        await loadProjectDetail(nextProjectId);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while loading projects.";
      setProjectsError(message);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const openProject = async (projectId: string) => {
    if (projectId === selectedProjectId && projectDetail) {
      return;
    }

    await loadProjectDetail(projectId);
  };

  const deleteProjectById = async (projectId: string) => {
    if (isDeletingProject) {
      return;
    }

    const confirmed = window.confirm(
      "Apakah Anda yakin ingin menghapus project ini? Aksi ini tidak bisa dibatalkan.",
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingProject(true);

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as ApiResponse<{ deleted: boolean }>;

      if (!response.ok || !result.success) {
        const message = resolveApiErrorMessage(result, "Failed to delete project.");
        throw new Error(message);
      }

      const remainingProjects = projects.filter((p) => p.id !== projectId);
      setProjects(remainingProjects);

      if (selectedProjectId === projectId) {
        if (remainingProjects.length > 0) {
          await loadProjectDetail(remainingProjects[0].id);
        } else {
          setSelectedProjectId(null);
          setProjectDetail(null);
          setEditedDocuments(null);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while deleting project.";
      setProjectsError(message);
    } finally {
      setIsDeletingProject(false);
    }
  };

  const saveDocuments = async () => {
    if (!selectedProjectId || !editedDocuments) {
      return;
    }

    try {
      setIsSavingDocuments(true);
      setSaveStatus(null);

      const response = await fetch(`/api/projects/${selectedProjectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedDocuments),
      });

      const result = (await response.json()) as ApiResponse<ProjectDetail>;

      if (!response.ok || !result.success) {
        const message = resolveApiErrorMessage(result, "Failed to update documents.");
        throw new Error(message);
      }

      setProjectDetail(result.data);
      setEditedDocuments(parseDocuments(result.data));
      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project.id === result.data.id
            ? {
                ...project,
                updatedAt: result.data.updatedAt,
              }
            : project,
        ),
      );
      setSaveStatus("Dokumen berhasil diperbarui.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error while saving documents.";
      setSaveStatus(`Gagal menyimpan: ${message}`);
    } finally {
      setIsSavingDocuments(false);
    }
  };

  const currentDocuments = editedDocuments ?? {
    brd: "",
    prd: "",
    srs: "",
    agent: "",
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!projectDetail || !editedDocuments) {
      return false;
    }

    return !areDocumentsEqual(editedDocuments, parseDocuments(projectDetail));
  }, [editedDocuments, projectDetail]);

  return (
    <div className="space-y-6 pb-6">
      <header className="animate-fade-in-up space-y-3">
        <Badge variant="secondary">Project History</Badge>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Saved Specifications
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          Buka project lama, review intake dan klarifikasi, lalu edit dokumen
          BRD/PRD/SRS/AGENT kapan saja.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="animate-fade-in-up delay-100 h-fit">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                History List
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadProjects()}
                disabled={isLoadingProjects}
              >
                {isLoadingProjects ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>Daftar project yang sudah disimpan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                className="pl-9 text-sm"
              />
            </div>

            {projectsError ? (
              <p className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
                {projectsError}
              </p>
            ) : null}

            {!isLoadingProjects && filteredProjects.length === 0 ? (
              <p className="rounded-lg border border-border/70 bg-background/75 px-3 py-2 text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "Tidak ada project yang cocok dengan pencarian."
                  : "Belum ada project tersimpan."}
              </p>
            ) : null}

            <div className="max-h-[480px] space-y-2 overflow-auto">
              {filteredProjects.map((project) => {
                const isActive = project.id === selectedProjectId;
                return (
                  <div
                    key={project.id}
                    className={cn(
                      "group relative rounded-xl border p-3 transition-all duration-200",
                      isActive
                        ? "border-primary/70 bg-primary/10"
                        : "border-border/70 bg-card/70 hover:bg-accent/40 hover:border-border",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => void openProject(project.id)}
                      className="w-full text-left"
                    >
                      <p className="line-clamp-1 text-sm font-semibold">{project.name}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {project.type}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Updated: {formatDate(project.updatedAt)}
                      </p>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteProjectById(project.id);
                      }}
                      disabled={isDeletingProject}
                      title="Hapus project"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {isLoadingDetail ? (
            <Card className="animate-fade-in">
              <CardContent className="flex items-center gap-2 pt-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memuat detail project...
              </CardContent>
            </Card>
          ) : null}

          {!isLoadingDetail && detailError ? (
            <Card>
              <CardContent className="pt-6 text-sm text-red-700 dark:text-red-400">{detailError}</CardContent>
            </Card>
          ) : null}

          {!isLoadingDetail && !detailError && !projectDetail ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Pilih project dari daftar untuk melihat detail.
              </CardContent>
            </Card>
          ) : null}

          {projectDetail ? (
            <>
              <Card className="animate-slide-in-right">
                <CardHeader className="border-b border-border/70">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    {projectDetail.name}
                  </CardTitle>
                  <CardDescription>
                    {projectDetail.type} • Dibuat {formatDate(projectDetail.createdAt)} •
                    Update terakhir {formatDate(projectDetail.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {projectDetail.description}
                  </p>
                </CardContent>
              </Card>

              <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                  <CardHeader className="border-b border-border/70">
                    <CardTitle>Intake JSON</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <pre className="max-h-[360px] overflow-auto rounded-xl border border-border/70 bg-background/75 p-3 text-xs leading-relaxed">
                      {renderJson(projectDetail.intake)}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="border-b border-border/70">
                    <CardTitle>Clarification JSON</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-5">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Questions
                      </p>
                      <pre className="max-h-[160px] overflow-auto rounded-xl border border-border/70 bg-background/75 p-3 text-xs leading-relaxed">
                        {renderJson(projectDetail.clarificationQuestions)}
                      </pre>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                        Answers
                      </p>
                      <pre className="max-h-[160px] overflow-auto rounded-xl border border-border/70 bg-background/75 p-3 text-xs leading-relaxed">
                        {renderJson(projectDetail.clarificationAnswers)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="border-b border-border/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Documents
                      </CardTitle>
                      <CardDescription>
                        Edit dokumen lalu simpan perubahan ke project yang sama.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      onClick={() => void saveDocuments()}
                      disabled={!hasUnsavedChanges || isSavingDocuments}
                    >
                      {isSavingDocuments ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Documents
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-5">
                  {saveStatus ? (
                    <p
                      className={cn(
                        "rounded-lg px-3 py-2 text-sm",
                        saveStatus.startsWith("Gagal")
                          ? "border border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400"
                          : "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
                      )}
                    >
                      {saveStatus}
                    </p>
                  ) : null}

                  <DocumentTabs
                    key={`${projectDetail.id}-${projectDetail.updatedAt}`}
                    initialDocuments={currentDocuments}
                    onDocumentsChange={setEditedDocuments}
                  />

                  <DownloadButtons documents={currentDocuments} />
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
