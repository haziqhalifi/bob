# NextStep

> Information tells you what happened. NextStep tells you what to do next.

---

## The Problem

Every day, people receive dozens of messages — emails, university notices, bills, event invitations, job offers — and lose track of what actually needs to be done. The information is there, but it is buried in paragraphs of text. Most people either miss deadlines, forget to act, or waste time re-reading messages trying to figure out what matters. Generic AI tools make this worse by producing summaries instead of actions.

## The Solution

NextStep is a focused information-to-action engine. You paste any message and it tells you exactly what to do, when to do it, and what happens if you don't. It identifies the primary action, extracts the deadline, assesses the priority, and surfaces the consequence — all in a structured, scannable format.

The core insight:

> Most tools tell you what a message says. NextStep tells you what you need to do.

---

## Demo

```
Input:
"Congratulations! Please complete the technical assessment by 30 September 2026
 at 11:59 PM. Candidates who fail to complete the assessment will not proceed."

Output:
┌─────────────────────────────────────────┐
│ JOB APPLICATION                         │
│ Technical assessment invitation         │
├─────────────────────────────────────────┤
│ ✅ NEXT ACTION                          │
│  Complete the technical assessment      │
│                                         │
│ ⏰ DEADLINE                             │
│  30 September 2026, 11:59 PM            │
│                                         │
│ 🔴 HIGH PRIORITY                        │
│  Fixed deadline with explicit           │
│  consequence if missed.                 │
│                                         │
│ ⚠️ CONSEQUENCE                          │
│  Application will not proceed           │
├─────────────────────────────────────────┤
│ NEXT STEPS                              │
│  1. Open the assessment link            │
│  2. Complete all questions              │
│  3. Submit before deadline              │
│  4. Confirm submission                  │
└─────────────────────────────────────────┘
```

---

## How It Works

```
Unstructured Information (email, notice, bill, message)
                    ↓
           Input Validation
                    ↓
           AI Analysis (GPT-4o-mini)
                    ↓
        Structured Extraction (JSON)
                    ↓
         Zod Schema Validation
                    ↓
         Normalisation + Priority
                    ↓
    Action · Deadline · Priority · Consequence
```

If the message requires no action (e.g. "Your parcel has been delivered"), NextStep returns **No Action Required** rather than inventing a task.

---

## Key Features

- **Detect required actions** — identifies exactly what needs to be done
- **Extract deadlines** — preserves the original text and normalises where possible
- **Extract consequences** — only when explicitly stated, never invented
- **Prioritise actions** — high / medium / low with a plain-language reason
- **Generate next steps** — ordered, concrete steps
- **Detect no-action messages** — returns informational-only state correctly
- **Multiple action support** — primary action + additional actions
- **Schema validation** — all AI output validated with Zod before display
- **Mobile responsive** — works on laptop, tablet and mobile

---

## Example Inputs

| Category | Description |
|---|---|
| Job Application | Technical assessment deadline |
| University | Slide submission deadline |
| Bill | Electricity bill due date |
| Event | IBM AI Meetup registration |
| No Action | Parcel delivery confirmation |

---

## Built With IBM Bob

IBM Bob was used throughout the entire development lifecycle of NextStep — not just for generating code, but for planning architecture, designing schemas, writing tests, and reviewing edge cases.

See **[BOB_USAGE.md](./BOB_USAGE.md)** for the full development log.

Bob accelerated:
- **Planning** — Designing the structured extraction pipeline and schema before writing any code
- **Coding** — Generating the Zod schema, API route, analysis library, and all React components
- **Testing** — Writing the full test suite covering 8 test categories and 25 test cases
- **Debugging** — Identifying edge cases (relative dates, null fields, invalid AI JSON, informational messages)
- **Documentation** — Producing README, BOB_USAGE.md, JUDGING_CHECKLIST.md, and inline code comments

---

## Architecture

```
nextstep/
├── app/
│   ├── page.tsx              # Main page — input, examples, result
│   ├── layout.tsx            # Root layout + metadata
│   └── api/
│       └── analyze/
│           └── route.ts      # POST /api/analyze — AI pipeline
├── components/
│   ├── ResultCard.tsx        # Structured result UI
│   ├── LoadingState.tsx      # Multi-step loading animation
│   └── EmptyState.tsx        # Pre-analysis guidance
├── lib/
│   ├── analyzer.ts           # parseAndValidate, validateInput, prompts
│   └── examples.ts           # 5 built-in demo examples
├── types/
│   └── analysis.ts           # Zod schema + TypeScript types
└── tests/
    └── analyzer.test.ts      # 25 unit tests
```

**Technology stack:**

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| AI | OpenAI GPT-4o-mini |
| Validation | Zod |
| Styling | Tailwind CSS v4 |
| Testing | Jest + ts-jest |

---

## Running Locally

### Prerequisites

- Node.js 18+
- An OpenAI API key

### Setup

```bash
git clone <repo-url>
cd nextstep
npm install
```

Copy the environment file:

```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:

```
OPENAI_API_KEY=sk-...
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Testing

```bash
npm test
```

This runs 25 unit tests covering:

- Input validation
- JSON parsing and Zod schema validation
- Action extraction
- Deadline extraction
- Amount extraction
- Consequence extraction
- No-action detection
- Missing field handling
- Multiple action support
- Invalid/malformed AI output
- Priority engine

---

## Future Improvements

The following integrations are **not yet implemented** but represent natural next steps:

- **Gmail integration** — analyse emails directly from inbox
- **WhatsApp** — process forwarded messages
- **Calendar export** — generate `.ics` from extracted deadlines
- **Push notifications** — remind user before deadline
- **OCR / screenshot** — analyse images of messages
- **Local history** — save past analyses in browser storage
- **Batch mode** — analyse multiple messages at once

---

## Project Structure

```
/
├── README.md
├── BOB_USAGE.md
├── JUDGING_CHECKLIST.md
├── .env.example
├── app/
├── components/
├── lib/
├── types/
├── tests/
└── package.json
```
