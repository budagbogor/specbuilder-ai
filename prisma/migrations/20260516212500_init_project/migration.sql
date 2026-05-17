-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "intakeJson" JSONB NOT NULL,
    "clarificationQuestions" JSONB,
    "clarificationAnswers" JSONB,
    "brd" TEXT,
    "prd" TEXT,
    "srs" TEXT,
    "agent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
