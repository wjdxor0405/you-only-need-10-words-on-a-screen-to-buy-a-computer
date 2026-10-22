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

- [x] **2. Paste a quote as text and the model reads it into part lines**
  Becomes usable: The app opens on ① Upload with the step bar. Paste a quote, or press "Try a sample quote", then press "Read quote". The model fills ② with the lines it read, which you confirm and check as in slice 1. Earlier steps can be clicked to go back.
  Why now: The model is the riskiest unknown (`gpt-6-luna`'s name, structured output, SDK version). Verifying it with text first separates "does the model call work" from "can it read images."
  PRD ref: `prd.md > Reading the Quote`, `prd.md > Screens and Layout`, `prd.md > States and Boundaries` (First use)
  Spec ref: `spec.md > Quote Reader (server)`, `spec.md > External Services and Dependencies`, `spec.md > API (server)` (`/api/read`), `spec.md > Step Bar`, `spec.md > Upload Step`, `spec.md > Stack` (unverified model)
  Build: Run a one-call probe to confirm the model name, structured output, and image input (fix `OPENAI_MODEL` if needed). Write `quote_reader.py` (prompt written from scratch, `responses.parse` → `ReadResult`) and add the text path of `POST /api/read`. Add `StepBar`, `UploadStep` (text box, "Read quote", "Try a sample quote", loading state), and three-step navigation in `App.tsx`.
  Verify (mechanical): The probe script's real call returns a parsed `ReadResult`. `curl` `/api/read` with the sample quote text returns the same lines as `sampleQuote.ts` (part type, name, and price all match). A kit like "32GB (2x16GB)" stays one line at the kit price, not quantity 2. `npm run build` passes.
  Learner check: Open the app, press "Try a sample quote" → "Read quote", and confirm the lines in ② match the quote. Then paste a quote of your own (any format) and see whether it reads correctly.
  Commit: `Read pasted quotes into part lines with the model`

- [x] **3. Upload a screenshot, with clear messages when reading fails**
  Becomes usable: Drop a screenshot (PNG/JPEG/WebP, up to 5 MB) into ① and it is read just like text. If the image isn't a quote or is blurry, ② shows the couldn't-read message and a way back. If the server or model fails, ① shows "Reading failed" and the text box still works. `samples/sample-quote.png` exists for the demo. On a phone, the image picker opens the photo library.
  Why now: Image input reuses the model call verified in slice 2, so it's lower risk. With failure states added, the full demo path is complete.
  PRD ref: `prd.md > Reading the Quote`, `prd.md > States and Boundaries` (Couldn't read / Partly read)
  Spec ref: `spec.md > Upload Step`, `spec.md > Confirm Parts Step`, `spec.md > Quote Reader (server)`, `spec.md > API (server)`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Add the image path of `/api/read` (type and 5 MB checks, base64 data URL), the drop area in `UploadStep`, the couldn't-read state in `ConfirmStep`, and the read-failure message in ①. Render the sample quote as a shop-style table and save the screenshot as `samples/sample-quote.png`. Complete the README run instructions.
  Verify (mechanical): `curl` `/api/read` with `sample-quote.png` returns the same lines as the text input. A non-quote image returns `problem`. A `.gif` or a file over 5 MB is rejected with a plain message. With a wrong `OPENAI_MODEL`, a request returns an error the screen can display. `npm run build` passes.
  Learner check: Drag `samples/sample-quote.png` in and go all the way to ③ (the demo run). Then drop an unrelated photo and check that the message makes sense.
  Commit: `Read quote screenshots and show reading failures`

- [ ] **4. Large type and one part per screen, readable on a phone**
  Becomes usable: On a phone (or a 360px-wide window), every step reads without zooming: large type, full-width buttons. ② shows one card per line with "Fix". ③ opens on an overview card, then one card per part with Back/Next and "Show proof", then the questions card. Part cards name the part in plain words with its quoted price and a spec label ("Graphics card · $195" / "RTX 4060, 8GB").
  Why now: The learner chose this design after reviewing the judging criteria (reviewers only watch the video, in a small player; the quote arrives on a phone). It reshapes every screen, so it follows the last input path (slice 3) and comes before the final review.
  PRD ref: `prd.md > Large Type and Character Limit`, `prd.md > Look and Feel`, `prd.md > Screens and Layout`, `prd.md > Price Verdicts`, `prd.md > Overview and Questions to Ask the Seller`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Results Step`, `spec.md > Confirm Parts Step`, `spec.md > Verdict Engine (server)`, `spec.md > Data Model`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Add the three type levels (decide 32/24px, read and act 20px, context 16px muted) and tap-size variables to `styles.css`. Add `spec_label` to every product in `prices.json`, and `part_label`, `display_name`, and `advice` to `LineResult`; shorten the `ask_seller` templates to the part type. Add `test_card_text.py` (`CARD_TEXT_LIMIT = 120`). Rework `ResultsStep` into paged cards with `ResultCard` (renamed from `ResultRow`) and "Show proof"; rework `ConfirmStep` into cards with "Fix".
  Verify (mechanical): `pytest` passes, including `test_card_text.py` for every verdict path. `npm run build` passes. A headless browser at 360×740 shows ①, ②, and every ③ card with no sideways scrolling (page scroll width ≤ viewport width), no rendered text has a computed font size under 16px, the verdict phrase is the largest text on each part card, and screenshots are reviewed.
  Learner check: Open the app on your phone (`npm run dev -- --host`, then the Network URL on the same Wi-Fi). Hold it at a normal distance and read every card without zooming. Open "Show proof" on one card, then go back.
  Commit: `Use large type and one part per screen, readable on a phone`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1 (the verdict and evidence screen; does it convince?)
  Feedback: "Only text" → added a price range bar and part-type icons (learner: "looks fine"). Learner also chose a one-sentence overview and "Questions to ask the seller" (fixed-rule questions).
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
- Added a one-sentence overview, "Questions to ask the seller", a price range bar, and part-type icons to Results — the learner's first hands-on check found the evidence screen text-only; the questions use fixed rules so the model never writes evidence.
- Slice 2 verification checks that a RAM kit ("2x16GB") is read as one line at the kit price — a comparable quote reader was seen reading the kit as quantity 2.
- The slice 2 probe confirmed the model name and structured output with text only; image input is checked in slice 3, where the sample screenshot is created.
- Added slice 4 (large type, one part per screen, phone layout) and changed the demo persona to a parent in their 50s buying a PC for their teen — after reviewing the judging criteria (Design, Potential Impact, Innovation, Presentation; reviewers judge from the video alone). A text-size toggle and a native phone app were rejected; a post-delivery parts check stays under Later because it would take most of the remaining time. Measured cost: with full product names, the sample quote's GPU card was 186 characters, so cards get short names and part-type-only seller questions to fit 120.
- Reworded the demo persona by role, not age (a parent paying for a teen's first gaming PC, who may play games but never learned parts or prices), and set three type levels with a 16px floor — the learner flagged that elderly parents rarely buy PCs and that not everything should be big. A search found no data that parents of teens know PC parts poorly or prefer large text, so large type is justified by phone reading, one decision per screen, and the small video player, not by age.
- Cards name a part by plain part name, quoted price, and a hand-written spec label instead of a shortened product name — the learner asked to cut characters through specs and price. Measured on the sample quote, the longest card went from 114 to 110 characters while adding the price and plain part names, and every matched card fits in 100, so no matched name needs cutting. Rejected: model-written spec summaries (breaks "name exactly as written") and regex extraction (CPUs, cases, and coolers have no specs to pull). Cost: brands leave the cards, so a vague line's card states the swap risk itself.
