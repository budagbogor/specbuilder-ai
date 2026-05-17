import { z } from "zod";

const requiredText = (fieldLabel: string) =>
  z.string().trim().min(1, `${fieldLabel} is required`);

const optionalText = z.string().trim().optional();

export const intakeSchema = z.object({
  // Basic Project Info
  projectName: requiredText("projectName"),
  projectType: requiredText("projectType"),
  projectDescription: requiredText("projectDescription"),
  projectStage: optionalText,
  platformTarget: optionalText,
  industry: optionalText,

  // Business Context
  businessProblem: requiredText("businessProblem"),
  businessGoals: requiredText("businessGoals"),
  targetMarket: optionalText,
  stakeholders: optionalText,
  revenueModel: optionalText,
  successMetrics: optionalText,
  budgetRange: optionalText,
  timelineExpectation: optionalText,

  // Product Context
  targetUsers: requiredText("targetUsers"),
  userPersonas: optionalText,
  mainFeatures: requiredText("mainFeatures"),
  userRoles: optionalText,
  userJourney: optionalText,
  productScope: optionalText,
  outOfScope: optionalText,
  competitorReferences: optionalText,

  // Technical Context
  preferredTechStack: requiredText("preferredTechStack"),
  frontendPreference: optionalText,
  backendPreference: optionalText,
  databasePreference: optionalText,
  authenticationNeeds: optionalText,
  apiIntegrations: optionalText,
  thirdPartyServices: optionalText,
  deploymentTarget: optionalText,
  scalabilityNeeds: optionalText,

  // Security & Compliance
  securityRequirements: optionalText,
  privacyRequirements: optionalText,
  complianceNeeds: optionalText,
  userDataTypes: optionalText,
  accessControlRules: optionalText,
  backupRequirements: optionalText,

  // AI Agent Rules
  codingStyle: optionalText,
  folderStructurePreference: optionalText,
  testingPreference: optionalText,
  documentationPreference: optionalText,
  gitWorkflow: optionalText,
  aiAgentBehavior: optionalText,
  restrictedActions: optionalText,
  definitionOfDone: optionalText,
});

export type IntakeSchemaInput = z.input<typeof intakeSchema>;
export type IntakeSchemaValues = z.infer<typeof intakeSchema>;
