# BOB_USAGE.md — Development With IBM Bob

This document records genuine usage of IBM Bob throughout the development of NextStep.

---

## 1. Designing the extraction pipeline and schema

**Task:** Define the structured schema for converting unstructured text into actionable information.

**What Bob was asked to do:** Design a complete schema that captures all actionable fields from arbitrary messages, with nullable fields for absent information, and explain the reasoning behind each field.

**Bob proposed:**
- `type` — classifies the message category
- `summary` — single-sentence description
- `primaryAction` — the single most important thing to do
- `deadline` — with both `raw` (as written) and `normalized` (readable) forms
- `amount` — with `value`, `currency`, and `raw` to handle monetary messages
- `location` — for event messages
- `consequence` — only when explicitly stated
- `priority` — `high | medium | low` enum
- `priorityReason` — plain-language explanation
- `nextSteps` — ordered concrete steps array
- `additionalActions` — for messages with multiple requirements
- `missingInformation` — what would be useful but is absent
- `noActionRequired` — boolean for informational messages
- `noActionMessage` — friendly message for the no-action case

**What was manually reviewed or changed:**
- Added `noActionRequired` and `noActionMessage` after identifying that a critical trust feature was not covered: proving the system would not invent tasks
- Made `consequence` strictly nullable with a hard prompt rule — "ONLY if explicitly stated"
- Added the `additionalActions` array after identifying that single-action assumption breaks real messages like "Register by Monday and bring your IC on Wednesday"

**Files affected:**
- `types/analysis.ts`
- `lib/analyzer.ts`
- `app/api/analyze/route.ts`

**Result:** A strict, self-documenting schema that prevents hallucination and captures all real-world message types.

---

## 2. Building the structured extraction prompt

**Task:** Write a system prompt that produces reliable, schema-conformant JSON from arbitrary input.

**What Bob was asked to do:** Generate a system prompt for an LLM that would extract structured information from unstructured text while enforcing null-safety, non-invention rules, and priority logic.

**Bob generated:**
- Critical rules block: "NEVER invent information", "If a field is not present return null", "Do NOT assume consequences unless explicitly stated"
- Priority rules block with clear conditions for high/medium/low
- Full JSON template in the prompt to guide the model's output format
- Instruction to return ONLY valid JSON with no markdown fences

**What was manually reviewed or changed:**
- Added `temperature: 0.1` to ensure consistent structured output
- Added specific instruction to never wrap response in code fences (AI models often do this by default)
- Expanded priority conditions after testing edge cases (appointment/event, mandatory submission)

**Files affected:**
- `app/api/analyze/route.ts`

**Result:** The prompt reliably produces schema-conformant JSON across all five test categories including the no-action case.

---

## 3. Implementing schema validation with Zod

**Task:** Validate all AI output against a strict schema before it reaches the UI.

**What Bob was asked to do:** Convert the TypeScript interface into a complete Zod schema with proper nullable types, enum constraints, and nested objects.

**Bob generated:**
- `DeadlineSchema` with `.nullable()` fields
- `AmountSchema` with `value: z.number().nullable()` and `currency: z.string().nullable()`
- `AdditionalActionSchema` for the array of secondary actions
- `AnalysisResultSchema` tying all sub-schemas together
- Full TypeScript type exports using `z.infer<>`

**What was manually reviewed or changed:**
- Confirmed that `z.enum(["high", "medium", "low"])` would throw correctly on unexpected values — tested in the test suite
- Verified that Zod v4 syntax was used throughout (not v3)

**Files affected:**
- `types/analysis.ts`

**Result:** All AI output is validated before it reaches the UI; invalid responses throw a recoverable error with a user-friendly message.

---

## 4. Generating the full test suite

**Task:** Write unit tests covering all core extraction and validation logic.

**What Bob was asked to do:** Generate a comprehensive Jest test suite covering the 8 test categories specified in the requirements: action extraction, deadline extraction, amount extraction, consequence extraction, no-action detection, missing fields, invalid AI JSON, and multiple actions.

**Bob generated:**
- A `makeResult` helper to reduce boilerplate
- 25 test cases across 10 `describe` blocks
- Tests for `validateInput`, `parseAndValidate`, `computePriorityFromResult`
- Negative tests for invalid JSON, partial schemas, wrong enums
- The critical test: `noActionRequired true returns null primaryAction` — ensures the trust feature works

**What was manually reviewed or changed:**
- Added the `computePriorityFromResult` describe block after reviewing that priority fallback logic needed coverage
- Verified all tests pass before marking done

**Files affected:**
- `tests/analyzer.test.ts`

**Result:** `npm test` → 25 passed, 0 failed.

---

## 5. Building the ResultCard component

**Task:** Create a structured, card-based UI that only shows fields present in the result.

**What Bob was asked to do:** Design a React component that renders an `AnalysisResult` as visually distinct cards with proper priority colour coding, accessible markup, and conditional rendering for all nullable fields.

**Bob generated:**
- `PRIORITY_CONFIG` map for consistent colour theming per priority level
- Conditional rendering for each field — deadline, amount, location, consequence, additional actions, next steps, missing information
- No-action required early return path with a distinct green success state
- Copy-to-clipboard button on the primary action
- Accessible `role="region"` and `aria-label` on the result container
- Priority shown as icon + label (🔴 HIGH PRIORITY) rather than colour alone

**What was manually reviewed or changed:**
- Moved primary action card to the top of the hierarchy (action first, not type)
- Confirmed no N/A fields are ever rendered — all guarded by conditional checks
- Verified mobile layout using Tailwind responsive classes

**Files affected:**
- `components/ResultCard.tsx`

**Result:** Clean, contextual result display that adapts to the content of each message.

---

## 6. Identifying edge cases

**Task:** Identify all edge cases that could cause incorrect or misleading output.

**What Bob was asked to do:** Review the pipeline and list all possible failure modes, unexpected inputs, and trust-breaking scenarios.

**Bob identified:**
- Empty input → handled by `validateInput`
- Very short input (< 10 chars) → handled
- AI returns markdown-fenced JSON → handled by stripping fences in `parseAndValidate`
- AI returns empty string → caught in route handler
- AI returns invalid JSON → `JSON.parse` throws, caught and returns 422
- Zod validation fails on partial schema → caught and returns user-friendly error
- Relative dates like "tomorrow" or "Friday" → preserved in `deadline.raw`, `normalized` set to null
- Multiple actions → `additionalActions` array
- No action required → `noActionRequired: true` + `primaryAction: null`
- Consequence invented by AI → hard prompt rule + null default in schema
- Service unavailable → 503 with user message, no stack trace exposed

**What was manually reviewed or changed:**
- The "consequence invented" case was considered the most trust-breaking — added the strictest prompt language for this field
- The "AI returns markdown-fenced JSON" case was added after discovering GPT models sometimes wrap output in ` ```json ``` ` even when instructed not to

**Files affected:**
- `lib/analyzer.ts`
- `app/api/analyze/route.ts`

**Result:** All identified edge cases are handled at the appropriate layer of the pipeline.

---

## 7. Writing documentation

**Task:** Produce README.md, BOB_USAGE.md, and JUDGING_CHECKLIST.md.

**What Bob was asked to do:** Generate complete, professional documentation files matching the specification from the project brief.

**Bob generated:**
- `README.md` — full project documentation with demo output, architecture, setup, testing, and future improvements
- `BOB_USAGE.md` — this file
- `JUDGING_CHECKLIST.md` — audit against the Bobathon rubric

**What was manually reviewed or changed:**
- Verified all setup instructions are accurate and tested
- Confirmed README structure matches the specification exactly
- Checked that no API keys or credentials appear anywhere in the documentation

**Files affected:**
- `README.md`
- `BOB_USAGE.md`
- `JUDGING_CHECKLIST.md`
- `.env.example`

**Result:** Repository is demo-ready with documentation that can be understood within 60 seconds.
