import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAndValidate, buildUserPrompt, validateInput, INPUT_ERROR_MESSAGES } from "@/lib/analyzer";

const SYSTEM_PROMPT = `You are NextStep, an information-to-action engine.

Your job is to analyse unstructured text (emails, messages, notices, bills, etc.) and extract structured actionable information.

CRITICAL RULES:
1. NEVER invent or infer information that is not explicitly stated.
2. If a field is not present in the text, return null for that field.
3. Do NOT assume consequences unless explicitly stated.
4. Do NOT invent deadlines.
5. If the message is purely informational with no required action, set noActionRequired to true and primaryAction to null.

PRIORITY RULES:
- "high": imminent deadline, explicit negative consequence, required payment, mandatory submission, urgent appointment
- "medium": required action exists, deadline exists but not immediately urgent
- "low": informational only, optional, no immediate action required

MULTIPLE ACTIONS:
If multiple actions are required, put the most important in primaryAction and the rest in additionalActions.

OUTPUT FORMAT — Return ONLY valid JSON with NO markdown fences:
{
  "type": "<string: e.g. Job Application, University Notice, Bill, Event, Delivery Update>",
  "summary": "<one sentence describing what this message is about>",
  "primaryAction": "<string | null>",
  "deadline": {
    "raw": "<exactly as written>",
    "normalized": "<readable form e.g. 30 September 2026, 11:59 PM | null>"
  } | null,
  "amount": {
    "value": <number | null>,
    "currency": "<string | null>",
    "raw": "<exactly as written>"
  } | null,
  "location": "<string | null>",
  "consequence": "<string | null — ONLY if explicitly stated in the text>",
  "priority": "high" | "medium" | "low",
  "priorityReason": "<plain-language explanation of why this priority was assigned>",
  "nextSteps": ["<step 1>", "<step 2>", ...],
  "additionalActions": [
    { "action": "<string>", "deadline": { "raw": "<string>", "normalized": "<string | null>" } | null }
  ] | null,
  "missingInformation": ["<what would be useful but is absent>"],
  "noActionRequired": <boolean>,
  "noActionMessage": "<friendly message when noActionRequired is true | null>"
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input } = body;

    // Input validation
    const validationError = validateInput(input ?? "");
    if (validationError) {
      return NextResponse.json(
        { error: INPUT_ERROR_MESSAGES[validationError], code: validationError },
        { status: 400 }
      );
    }

    // Initialise OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Call AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(input.trim()) },
      ],
      temperature: 0.1, // Low temperature for consistent structured output
      max_tokens: 1000,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent) {
      return NextResponse.json(
        { error: "The AI returned an empty response. Please try again.", code: "empty_response" },
        { status: 502 }
      );
    }

    // Parse and validate against Zod schema
    let result;
    try {
      result = parseAndValidate(rawContent);
    } catch (parseError) {
      console.error("Parse/validation error:", parseError);
      console.error("Raw AI content:", rawContent);
      return NextResponse.json(
        {
          error: "We couldn't understand that information. Try adding more context or checking the text and try again.",
          code: "validation_failed",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ result });
  } catch (err: unknown) {
    console.error("Analysis error:", err);

    // Handle OpenAI API errors
    if (err instanceof Error && err.message.includes("API")) {
      return NextResponse.json(
        { error: "The analysis service is temporarily unavailable. Please try again shortly.", code: "api_error" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again.", code: "unknown_error" },
      { status: 500 }
    );
  }
}
