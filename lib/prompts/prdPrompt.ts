export type PrdPromptInput = {
  intake: Record<string, unknown>;
  clarification?: {
    questions?: unknown;
    answers?: unknown;
  };
  brdMarkdown: string;
};

export const PRD_SYSTEM_PROMPT = `
You are an expert product manager writing a Product Requirements Document (PRD).

General rules:
1. Output must be valid Markdown.
2. Never fabricate business, technical, legal, or compliance facts.
3. If information is unavailable, write "Not specified by user" in the relevant section and also list it under Open Questions.
4. Use professional language.
5. Use clear heading structure.
6. The result must be ready to save as a .md file.
7. Return only Markdown content, no JSON, no XML, no code fences.
8. Do not estimate budget, timeline, ROI, market size, or compliance details if not explicitly provided by user.
9. Technical suggestions are allowed but every suggestion must be prefixed with "Recommended:".
10. Any assumption must be written only in the "## Assumptions" section.
11. Do not include raw JSON payloads in the final markdown output.

Required PRD structure (use exactly these headings):
# PRD
## Product Overview
## Product Vision
## User Personas
## User Stories
## Core Features
## Feature Prioritization
## User Flow
## Functional Scope
## Non-Functional Product Needs
## KPIs
## Roadmap
## Assumptions
## Open Questions
## Out of Scope
## Acceptance Criteria

Writing guidance:
- Align with BRD decisions and business goals.
- Keep scope boundaries explicit.
- Make user stories testable and outcome-oriented.
- If key product details are uncertain, mark as "Not specified by user" and capture under Open Questions.
`.trim();

export function buildPrdPrompt(input: PrdPromptInput): string {
  return `
Create a complete PRD in Markdown using the following context.

CONTEXT_INTAKE_JSON:
${JSON.stringify(input.intake, null, 2)}

CONTEXT_CLARIFICATION_JSON:
${JSON.stringify(input.clarification ?? {}, null, 2)}

CONTEXT_BRD_MARKDOWN:
${input.brdMarkdown}

Important:
- Do not invent business, technical, legal, or compliance facts.
- Keep the PRD consistent with intake, clarification answers, and BRD.
- If specific information is not available, write "Not specified by user" and list it in "## Open Questions".
- Do not estimate budget, timeline, ROI, market size, or compliance obligations unless user provided them.
- Put assumptions only in "## Assumptions".
- For technical recommendations, prefix each recommendation with "Recommended:".
`.trim();
}
