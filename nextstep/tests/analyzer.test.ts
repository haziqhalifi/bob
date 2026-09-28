import { parseAndValidate, validateInput, computePriorityFromResult } from "../lib/analyzer";
import type { AnalysisResult } from "../types/analysis";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function makeResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  return {
    type: "General",
    summary: "A test message.",
    primaryAction: null,
    deadline: null,
    amount: null,
    location: null,
    consequence: null,
    priority: "low",
    priorityReason: "Informational only.",
    nextSteps: [],
    additionalActions: null,
    missingInformation: [],
    noActionRequired: false,
    noActionMessage: null,
    ...overrides,
  };
}

// ─── validateInput ─────────────────────────────────────────────────────────────

describe("validateInput", () => {
  test("returns 'empty' for empty string", () => {
    expect(validateInput("")).toBe("empty");
    expect(validateInput("   ")).toBe("empty");
  });

  test("returns 'too_short' for very short input", () => {
    expect(validateInput("hi")).toBe("too_short");
    expect(validateInput("ok")).toBe("too_short");
  });

  test("returns null for valid input", () => {
    expect(validateInput("Submit your report before Friday at 5 PM.")).toBeNull();
    expect(validateInput("Your electricity bill of RM 184.60 is due by 5 October.")).toBeNull();
  });
});

// ─── parseAndValidate ──────────────────────────────────────────────────────────

describe("parseAndValidate", () => {
  test("parses valid JSON result", () => {
    const valid = makeResult({
      primaryAction: "Complete technical assessment",
      deadline: { raw: "30 September 2026 at 11:59 PM", normalized: "30 September 2026, 11:59 PM" },
      priority: "high",
      priorityReason: "Fixed deadline with explicit consequence.",
      consequence: "Application will not proceed.",
      noActionRequired: false,
    });
    const json = JSON.stringify(valid);
    const result = parseAndValidate(json);
    expect(result.primaryAction).toBe("Complete technical assessment");
    expect(result.deadline?.normalized).toBe("30 September 2026, 11:59 PM");
    expect(result.priority).toBe("high");
    expect(result.consequence).toBe("Application will not proceed.");
  });

  test("strips markdown code fences before parsing", () => {
    const valid = makeResult({ primaryAction: "Submit report" });
    const fenced = "```json\n" + JSON.stringify(valid) + "\n```";
    const result = parseAndValidate(fenced);
    expect(result.primaryAction).toBe("Submit report");
  });

  test("throws on invalid JSON", () => {
    expect(() => parseAndValidate("not valid json")).toThrow();
  });

  test("throws on JSON that fails Zod schema", () => {
    const badSchema = { type: "Job", summary: "Test", priority: "URGENT" };
    expect(() => parseAndValidate(JSON.stringify(badSchema))).toThrow();
  });
});

// ─── Action extraction ─────────────────────────────────────────────────────────

describe("Action extraction", () => {
  test("primary action is preserved through parse", () => {
    const r = makeResult({ primaryAction: "Submit report" });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.primaryAction).toBe("Submit report");
  });

  test("null primaryAction is preserved (no action required)", () => {
    const r = makeResult({ primaryAction: null, noActionRequired: true });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.primaryAction).toBeNull();
  });
});

// ─── Deadline extraction ───────────────────────────────────────────────────────

describe("Deadline extraction", () => {
  test("deadline with raw and normalized is preserved", () => {
    const r = makeResult({
      deadline: { raw: "Friday at 5 PM", normalized: null },
    });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.deadline?.raw).toBe("Friday at 5 PM");
    expect(parsed.deadline?.normalized).toBeNull();
  });

  test("null deadline is preserved", () => {
    const r = makeResult({ deadline: null });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.deadline).toBeNull();
  });
});

// ─── Amount extraction ─────────────────────────────────────────────────────────

describe("Amount extraction", () => {
  test("amount with currency is preserved", () => {
    const r = makeResult({
      amount: { value: 184.60, currency: "MYR", raw: "RM 184.60" },
    });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.amount?.value).toBe(184.60);
    expect(parsed.amount?.currency).toBe("MYR");
    expect(parsed.amount?.raw).toBe("RM 184.60");
  });

  test("null amount is preserved", () => {
    const r = makeResult({ amount: null });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.amount).toBeNull();
  });
});

// ─── Consequence extraction ────────────────────────────────────────────────────

describe("Consequence extraction", () => {
  test("explicit consequence is preserved", () => {
    const r = makeResult({ consequence: "Service may be interrupted." });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.consequence).toBe("Service may be interrupted.");
  });

  test("null consequence is preserved — never invented", () => {
    const r = makeResult({ consequence: null });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.consequence).toBeNull();
  });
});

// ─── No-action detection ──────────────────────────────────────────────────────

describe("No-action detection", () => {
  test("noActionRequired true returns null primaryAction", () => {
    const r = makeResult({
      primaryAction: null,
      noActionRequired: true,
      noActionMessage: "Your parcel has already been delivered successfully.",
    });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.noActionRequired).toBe(true);
    expect(parsed.primaryAction).toBeNull();
    expect(parsed.noActionMessage).toBe("Your parcel has already been delivered successfully.");
  });
});

// ─── Missing fields ────────────────────────────────────────────────────────────

describe("Missing fields", () => {
  test("missingInformation array is preserved", () => {
    const r = makeResult({ missingInformation: ["Assessment link not provided"] });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.missingInformation).toContain("Assessment link not provided");
  });

  test("empty missingInformation array is valid", () => {
    const r = makeResult({ missingInformation: [] });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.missingInformation).toHaveLength(0);
  });
});

// ─── Multiple actions ─────────────────────────────────────────────────────────

describe("Multiple actions", () => {
  test("additionalActions are preserved", () => {
    const r = makeResult({
      primaryAction: "Register for the event",
      additionalActions: [
        { action: "Bring IC on Wednesday", deadline: { raw: "Wednesday", normalized: null } },
      ],
    });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.additionalActions).toHaveLength(1);
    expect(parsed.additionalActions![0].action).toBe("Bring IC on Wednesday");
  });

  test("null additionalActions is valid", () => {
    const r = makeResult({ additionalActions: null });
    const parsed = parseAndValidate(JSON.stringify(r));
    expect(parsed.additionalActions).toBeNull();
  });
});

// ─── Invalid AI JSON ──────────────────────────────────────────────────────────

describe("Invalid AI JSON handling", () => {
  test("throws on completely malformed AI output", () => {
    const malformed = "Sorry, I cannot complete that request.";
    expect(() => parseAndValidate(malformed)).toThrow();
  });

  test("throws on partial schema — missing required fields", () => {
    const partial = JSON.stringify({ type: "Job", summary: "A test" });
    expect(() => parseAndValidate(partial)).toThrow();
  });

  test("throws on wrong priority enum", () => {
    const bad = JSON.stringify(
      makeResult({ priority: "critical" as "high" })
    );
    expect(() => parseAndValidate(bad)).toThrow();
  });
});

// ─── Priority engine ──────────────────────────────────────────────────────────

describe("computePriorityFromResult", () => {
  test("preserves priorityReason when already set", () => {
    const r = makeResult({ priorityReason: "Fixed deadline." });
    const out = computePriorityFromResult(r);
    expect(out.priorityReason).toBe("Fixed deadline.");
  });

  test("fills in fallback priorityReason when empty", () => {
    const r = makeResult({ priorityReason: "", priority: "high" });
    const out = computePriorityFromResult(r);
    expect(out.priorityReason).toContain("urgent");
  });
});
