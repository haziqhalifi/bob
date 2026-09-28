import { z } from "zod";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

export const DeadlineSchema = z.object({
  raw: z.string(),
  normalized: z.string().nullable(),
});

export const AmountSchema = z.object({
  value: z.number().nullable(),
  currency: z.string().nullable(),
  raw: z.string(),
});

export const AdditionalActionSchema = z.object({
  action: z.string(),
  deadline: DeadlineSchema.nullable(),
});

export const AnalysisResultSchema = z.object({
  type: z.string(),
  summary: z.string(),
  primaryAction: z.string().nullable(),
  deadline: DeadlineSchema.nullable(),
  amount: AmountSchema.nullable(),
  location: z.string().nullable(),
  consequence: z.string().nullable(),
  priority: z.enum(["high", "medium", "low"]),
  priorityReason: z.string(),
  nextSteps: z.array(z.string()),
  additionalActions: z.array(AdditionalActionSchema).nullable(),
  missingInformation: z.array(z.string()),
  noActionRequired: z.boolean(),
  noActionMessage: z.string().nullable(),
});

// ─── TypeScript Types ───────────────────────────────────────────────────────────

export type Deadline = z.infer<typeof DeadlineSchema>;
export type Amount = z.infer<typeof AmountSchema>;
export type AdditionalAction = z.infer<typeof AdditionalActionSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
