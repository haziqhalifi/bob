import { AnalysisResultSchema, type AnalysisResult } from "@/types/analysis";

// ─── System Prompt ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are NextStep, an information-to-action engine.

Your job is to analyse unstructured text (emails, messages, notices, bills, etc.) and extract structured actionable information.

CRITICAL RULES:
1. NEVER invent or infer information that is not explicitly stated.
2. If a field is not present in the text, return null for that field.
3. Do NOT assume consequences unless explicitly stated.
4. Do NOT invent deadlines.
5. If the message is purely informational with no required action, set noActionRequired to true.

PRIORITY RULES:
- "high": imminent deadline, explicit negative consequence, required payment, mandatory submission
- "medium": required action exists, deadline exists but not urgent
- "low": informational only, optional, no immediate action required

MULTIPLE ACTIONS:
If multiple actions are required, put the most important in primaryAction and the rest in additionalActions.

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema:
{
  "type": string,           // e.g. "Job Application", "University Notice", "Bill", "Event", "Delivery Update"
  "summary": string,        // one sentence describing what this message is about
  "primaryAction": string | null,   // the single most important thing to do
  "deadline": {
    "raw": string,          // exactly as written in the text
    "normalized": string | null     // ISO-ish readable form e.g. "30 September 2026, 11:59 PM"
  } | null,
  "amount": {
    "value": number | null,
    "currency": string | null,      // e.g. "MYR", "USD"
    "raw": string           // exactly as written
  } | null,
  "location": string | null,
  "consequence": string | null,     // ONLY if explicitly stated
  "priority": "high" | "medium" | "low",
  "priorityReason": string,         // plain-language explanation
  "nextSteps": string[],            // ordered list of concrete steps (empty array if none)
  "additionalActions": [
    { "action": string, "deadline": { "raw": string, "normalized": string | null } | null }
  ] | null,
  "missingInformation": string[],   // things that would be useful but are missing
  "noActionRequired": boolean,
  "noActionMessage": string | null  // friendly message when noActionRequired is true
}`;

// ─── Priority Engine (client-side fallback + explanation) ───────────────────────

export function computePriorityFromResult(result: AnalysisResult): AnalysisResult {
  // Trust AI priority, but ensure priorityReason is never empty
  if (!result.priorityReason) {
    const reasons: Record<string, string> = {
      high: "This requires urgent attention with significant consequences.",
      medium: "This requires action but is not immediately critical.",
      low: "This is informational and requires no immediate action.",
    };
    return { ...result, priorityReason: reasons[result.priority] };
  }
  return result;
}

// ─── Parse & Validate AI Response ──────────────────────────────────────────────

export function parseAndValidate(raw: string): AnalysisResult {
  // Strip markdown code fences if present
  const cleaned = raw
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  const validated = AnalysisResultSchema.parse(parsed);
  return computePriorityFromResult(validated);
}

// ─── Build AI prompt ───────────────────────────────────────────────────────────

export function buildUserPrompt(input: string): string {
  return `Analyse the following text and return the structured JSON response:\n\n---\n${input}\n---`;
}

// ─── Input Validation ──────────────────────────────────────────────────────────

export type InputValidationError =
  | "empty"
  | "too_short"
  | "no_meaningful_content";

export function validateInput(input: string): InputValidationError | null {
  const trimmed = input.trim();
  if (!trimmed) return "empty";
  if (trimmed.length < 10) return "too_short";
  if (/^[^a-z0-9]/i.test(trimmed) && trimmed.length < 20)
    return "no_meaningful_content";
  return null;
}

export const INPUT_ERROR_MESSAGES: Record<InputValidationError, string> = {
  empty: "Please paste a message or text to analyse.",
  too_short: "That's too short to analyse. Please paste more context.",
  no_meaningful_content:
    "We couldn't find enough information in that text. Try pasting the full message.",
};
