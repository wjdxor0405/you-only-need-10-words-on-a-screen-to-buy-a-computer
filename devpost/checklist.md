---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Edit a list of parts and see a verdict with evidence for each**
  Becomes usable: Both programs run. The app opens on ② Confirm parts, prefilled with the sample quote's lines. Edit, delete, or add lines, press "Check prices", and ③ Results shows the summary and one collapsed row per part. Clicking a row expands the typical price, the listings, the rule, the sample-data label, and the swap-risk note where it applies. Every verdict appears: Reasonable, Worth questioning, Unusually low, and Can't verify (not in sample / name too vague).
  Why now: This is the unique kernel (price evidence and an honest "can't verify"), and it doesn't depend on the model. Building it first means the core of the demo works even if model reading turns out to be hard. Setting up both programs belongs here too.
  PRD ref: `prd.md > Price Verdicts`, `prd.md > Swap-Risk Flag`, `prd.md > The Core Journey` (steps 2–3), `prd.md > Look and Feel`
  Spec ref: `spec.md > Verdict Engine (server)`, `spec.md > Matcher (server)`, `spec.md > API (server)` (`/api/check`), `spec.md > Data Model`, `spec.md > Confirm Parts Step`, `spec.md > Results Step`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Scaffold `server/` (uv: fastapi, uvicorn, python-multipart, openai, pytest) and `web/` (Vite React TS, `/api` proxy). Write `models.py`, `verdict.py` (cents + `Fraction`, `RULE_TEXT`), `matcher.py` (aliases, vague-name check), and `prices.json` (10–15 real products, Store A/B/C, 3–5 listings each). Add `POST /api/check`, plus `types.ts`, `api.ts`, `styles.css`, `App.tsx`, `ConfirmStep`, `ResultsStep`, and `ResultRow`. Design the sample quote lines in `sampleQuote.ts` to hit every verdict. Add `.env.example` and a minimal README run section.
  Verify (mechanical): `uv run pytest` passes, including the boundary tests (+10% → Reasonable, +11% → Worth questioning, −30% → Reasonable, −31% → Unusually low) and the matcher tests (alias, vague, not in sample). `curl` `/api/check` with the sample lines returns every verdict, plus `swap_risk: true` on "SSD 1TB". `npm run build` passes with no type errors. Both dev servers start, and the page at :5173 loads.
  Learner check: Start both programs and open http://localhost:5173. Press "Check prices" and confirm there is at least one row of each verdict. Open the amber and gray rows and judge whether a beginner would understand *why*. Change one price so it goes from Reasonable to Worth questioning, then check again.
  Commit: `Add price verdicts with evidence for confirmed part lines`

- [ ] **2. Paste a quote as text and the model reads it into part lines**
  Becomes usable: The app opens on ① Upload with the step bar. Paste a quote, or press "Try a sample quote", then press "Read quote". The model fills ② with the lines it read, which you confirm and check as in slice 1. Earlier steps can be clicked to go back.
  Why now: The model is the riskiest unknown (`gpt-6-luna`'s name, structured output, SDK version). Verifying it with text first separates "does the model call work" from "can it read images."
  PRD ref: `prd.md > Reading the Quote`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries` (First use)
  Spec ref: `spec.md > Quote Reader (server)`, `spec.md > External Services and Dependencies`, `spec.md > API (server)` (`/api/read`), `spec.md > Step Bar`, `spec.md > Upload Step`, `spec.md > Stack` (unverified model)
  Build: Run a one-call probe to confirm the model name, structured output, and image input (fix `OPENAI_MODEL` if needed). Write `quote_reader.py` (prompt written from scratch, `responses.parse` → `ReadResult`) and add the text path of `POST /api/read`. Add `StepBar`, `UploadStep` (text box, "Read quote", "Try a sample quote", loading state), and three-step navigation in `App.tsx`.
  Verify (mechanical): The probe script's real call returns a parsed `ReadResult`. `curl` `/api/read` with the sample quote text returns the same lines as `sampleQuote.ts` (part type, name, and price all match). `npm run build` passes.
  Learner check: Open the app, press "Try a sample quote" → "Read quote", and confirm the lines in ② match the quote. Then paste a quote of your own (any format) and see whether it reads correctly.
  Commit: `Read pasted quotes into part lines with the model`

- [ ] **3. Upload a screenshot, with clear messages when reading fails**
  Becomes usable: Drop a screenshot (PNG/JPEG/WebP, up to 5 MB) into ① and it is read just like text. If the image isn't a quote or is blurry, ② shows the couldn't-read message and a way back. If the server or model fails, ① shows "Reading failed" and the text box still works. `samples/sample-quote.png` exists for the demo.
  Why now: Image input reuses the model call verified in slice 2, so it's lower risk. With failure states added, the full demo path is complete.
  PRD ref: `prd.md > Reading the Quote`, `prd.md > States and Boundaries` (Couldn't read / Partly read)
  Spec ref: `spec.md > Upload Step`, `spec.md > Confirm Parts Step`, `spec.md > Quote Reader (server)`, `spec.md > API (server)`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Add the image path of `/api/read` (type and 5 MB checks, base64 data URL), the drop area in `UploadStep`, the couldn't-read state in `ConfirmStep`, and the read-failure message in ①. Render the sample quote as a shop-style table and save the screenshot as `samples/sample-quote.png`. Complete the README run instructions.
  Verify (mechanical): `curl` `/api/read` with `sample-quote.png` returns the same lines as the text input. A non-quote image returns `problem`. A `.gif` or a file over 5 MB is rejected with a plain message. With a wrong `OPENAI_MODEL`, a request returns an error the screen can display. `npm run build` passes.
  Learner check: Drag `samples/sample-quote.png` in and go all the way to ③ (the demo run). Then drop an unrelated photo and check that the message makes sense.
  Commit: `Read quote screenshots and show reading failures`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1 (the verdict and evidence screen; does it convince?)
  Feedback: "Only text" → added a price range bar (quoted vs. reasonable range, typical, listings) and part-type icons; awaiting the learner's retry.
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions

- Server port 8000 → 8010 — port 8000 was already taken by another app on the learner's machine.
- Matcher rejects an alias followed by a model-variant suffix (Ti, Super, XT, X3D, X, K, F…) — plain "name contains alias" would judge an RTX 4060 Ti against RTX 4060 prices.
- Sample data has 17 products instead of 10–15 — a few extra so edits in step ② still find matches.
