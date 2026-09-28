# JUDGING_CHECKLIST.md

Pre-submission audit against the IBM Bobathon judging rubric.

---

## IBM Bob

- [x] Bob usage documented in `BOB_USAGE.md`
- [x] Concrete examples included (7 development sessions documented)
- [x] README links to `BOB_USAGE.md`
- [x] Development contributions clearly explained per session (task, what Bob did, what was changed, result)

---

## Technical Implementation

- [x] End-to-end pipeline works (Input → Validation → AI → Zod → UI)
- [x] Structured output used (`AnalysisResult` schema with 12 typed fields)
- [x] Output validation implemented (Zod schema validation on every AI response)
- [x] Edge cases handled (empty, too short, no action, multiple actions, invalid JSON, markdown fences, relative dates, service failure)
- [x] Core logic tested (25 unit tests across 10 describe blocks)
- [x] AI integration meaningfully addresses problem (structured extraction, not summarisation)

---

## Feasibility / NoSlop

- [x] Clear real-world problem (information overload, missed deadlines, unclear actions)
- [x] Solution usable by general users (paste text, click button, get result)
- [x] No unnecessary features (no auth, no database, no social, no dashboard)
- [x] Multiple real-world use cases (Job, University, Bill, Event, No Action)
- [x] Product has credible expansion path (Gmail, WhatsApp, Calendar, OCR — documented in README as future work)
- [x] Core experience is fully working (all 5 demo cases covered)

---

## Presentation

- [x] Demo flow is deterministic (5 example buttons pre-populate textarea; analysis always runs through the real pipeline)
- [x] Project can be explained in one sentence ("Paste any message and instantly know what to do next")
- [x] README is polished (problem, solution, demo, architecture, setup, testing, future)
- [x] Architecture is documented (directory tree + technology table in README)
- [x] Setup instructions work (`npm install && cp .env.example .env.local && npm run dev`)
- [x] Demo can be completed within 90 seconds (3-scene flow: Job → Bill → Parcel Delivered)

---

## Demo Script (90 seconds)

**Scene 1 — Problem (30s)**
- Paste Job Application example
- Say: "Most AI tools would summarise this. But what we actually want to know is: what do I need to do?"
- Click Find My Next Step
- Show: Action, Deadline, Priority, Consequence

**Scene 2 — Generalisation (30s)**
- Click Bill example
- Show: same pipeline, different context — amount extracted, deadline shown, consequence surfaced

**Scene 3 — Trust (30s)**
- Click No Action example
- Show: "No Action Required — This message is informational only"
- Say: "This is important. The system does not invent tasks."
