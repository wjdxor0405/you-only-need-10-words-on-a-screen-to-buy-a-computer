---
doc: spec
status: approved
---

# Quote Check (working title) — Technical Spec

## How This Works, In Plain Language
There are two programs running on your laptop.

- **The screen** (React) is what the user sees in the browser: the three steps, the part list, the results.
- **The server** (FastAPI) does the work the browser shouldn't: it holds the OpenAI key, asks the model to read the quote, and computes the verdicts.

The work is split on purpose:
- **Reading** a quote is messy — every shop formats it differently, and a screenshot is just pixels. A **language model** turns it into a clean list of part lines.
- **Judging** a price is the heart of the app, so it is **plain code**: look up the product in a small sample price file, take the middle price of its listings, and apply +10% / −30%. Same input, same verdict, every time — and the rule shown on screen is exactly the rule the code runs. The model never decides a verdict, so it can't invent evidence.

Between the two, the user checks the part list (step ②). If the model misread a name, the user sees and fixes it before any verdict.

Nothing is saved. Close the tab and it's gone.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Upload.** The user drops a screenshot or pastes text in step ① and presses "Read quote" → the screen sends it to the server's `/api/read` → the server asks the OpenAI model to return part lines in a fixed JSON shape → the screen shows them in step ②.
   - "Try sample" fills in the sample quote; the rest is the same.
2. **Confirm parts.** The user edits, deletes, or adds lines. This happens only in the screen's memory — no server call.
3. **Results.** "Check prices" sends the confirmed lines to `/api/check` → the server matches each name to the sample price file, computes the typical price and the verdict, and adds the swap-risk note → the screen shows an overview card, one card per part, and one card per question for the seller; "Show proof" opens the evidence, and "Ask the seller" opens that part's question.
4. **Done.** The user reads and decides. Going back to step ② and pressing "Check prices" again re-runs step 3 with the edited lines.

```
Browser (React)                     Server (FastAPI)                 Outside
───────────────                     ────────────────                 ───────
① image / text ──POST /api/read──▶  quote_reader.py ──────────────▶  OpenAI model
                ◀── part lines ───  (validates JSON shape)  ◀──────  (reads only)
② edit lines (in memory)
③ lines ───────POST /api/check──▶  matcher.py → verdict.py
                ◀── results ─────   reads data/prices.json (sample)
```

## Stack
Learner-agreed: FastAPI server + React (Vite) screen — the stack the learner already works in; the cost is running two processes.

| Piece | Choice | Docs |
|---|---|---|
| Server language | Python 3.12 (installed), project managed with `uv` | https://docs.astral.sh/uv/ |
| Server framework | FastAPI + Uvicorn | https://fastapi.tiangolo.com/ |
| Upload handling | `python-multipart` (FastAPI needs it for file uploads) | https://fastapi.tiangolo.com/tutorial/request-files/ |
| Model client | `openai` Python SDK, Responses API with structured output | https://platform.openai.com/docs/guides/images-vision · https://platform.openai.com/docs/guides/structured-outputs |
| Tests | `pytest` | https://docs.pytest.org/ |
| Screen | React + TypeScript, built with Vite (Node 22 installed) | https://vite.dev/guide/ · https://react.dev/ |
| Styling | Plain CSS with variables in one file — no UI library | — |

**Unverified — check in the first build step:** the model name. `gpt-6-luna` is the default, but public sources disagree about the 2026 lineup. Confirm with one real call that it accepts an image and returns the structured JSON. If not, change `OPENAI_MODEL` in `.env` to a model that does; no code change.

## Where It Runs and How Someone Tries It
Runs locally only. Deployment: none (learner decision).

Requirements: Python 3.12, `uv`, Node 22, an OpenAI API key.

```
# once
cp .env.example .env            # then put OPENAI_API_KEY in .env
cd server && uv sync
cd ../web && npm install

# every time — two terminals
cd server && uv run uvicorn app.main:app --reload --port 8010
cd web && npm run dev           # open http://localhost:5173
```

The Vite dev server forwards `/api/*` to port 8010, so the browser talks to one address.

**On a phone:** start the screen with `npm run dev -- --host` and open the Network URL it prints, from a phone on the same Wi-Fi.

**For the demo recording:** on a phone (or a phone-sized browser window) → choose `samples/sample-quote.png` → step ② → step ③ → page through the cards; open the proof on one Reasonable card, the Worth questioning card, and a Can't verify card. Submission needs the video plus the public GitHub repo; `6-ship` handles both.

## Look and Feel
From `prd.md > Look and Feel`. Defined as CSS variables in `web/src/styles.css`:

- `--bg` light blue-gray (around `#f4f7fc`); `--surface` white; `--border` pale gray-blue; soft card shadow.
- `--accent` vivid cobalt blue (around `#2f5bff`) for primary buttons and the step dots; white text on it.
- `--ok` green, `--caution` amber, `--bad` red (reserved, not used by any verdict), `--muted` gray for Can't verify.
- Font: `Pretendard, Inter, system-ui, sans-serif` — loaded from a CDN with system fallback.
- Corners about 10px; generous spacing; one column, max width about 720px, centered.
- Large type by default, three levels (`prd.md > Look and Feel`): `--text-verdict` 32px and `--text-number` 24px (decide), `--text-body` 20px (read and act), `--text-meta` 16px in `--muted-text` (context). `--tap` 56px minimum button height; line height about 1.5. Buttons are full width under 560px, except two-button pairs (Back / Next, Delete / Done), which sit side by side, and Fix, which sits beside its price.
- 16px is the floor for all text, including the sample-data label and the proof. Can't-verify reasons and the swap-risk note use `--text-body`, never `--text-meta`.
- Fits 360px wide with a 16px side gutter; no sideways scrolling on any step.
- Copy: short, plain English; at most ten counted words a screen (`prd.md > Large Type and Ten Words a Screen`); no jargon on cards. Verdict text is never color-only — the phrase is always written.
- Light theme only (dark mode is not in the PRD).

## Components

### Step Bar
`web/src/components/StepBar.tsx`. Three dots for Upload → Confirm → Results and the current step's name beside them (one word, not seven); earlier steps' dots are tappable to go back (44px tap area, labeled for screen readers), later ones are not.
PRD ref: `prd.md > Screens and Layout`.

### Upload Step
`web/src/components/UploadStep.tsx`. Title (`App.tsx`, on this step only) and one lead line, which also carries the state: the explanation, "Screenshot ready.", "Quote ready.", "Paste the quote text.", "Reading… a few seconds.", or an error. "Add screenshot" is the image drop area styled as a button (PNG/JPEG/WebP, up to 5 MB; the format hint only appears as an error); once chosen, it shows the screenshot as a thumbnail instead of the file name. "Paste text" opens the text box. A paste folds the box into a chip ("11 lines", with "Edit" to open it again); typing by hand keeps it open. "Try sample" fills in the sample quote, folded. "Read quote" appears once there is an image or text. The full text is kept and sent; only its display is folded.
PRD ref: `prd.md > Reading the Quote`, `prd.md > States and Boundaries` (First use).

### Confirm Parts Step
`web/src/components/ConfirmStep.tsx`. Opens on a summary: "We read 8 parts. Look right?", the `PartIcons` grid with each line's price under its icon (to hold against the quote) and a "+" to add a line, "Fix parts" and "Check prices". "Fix parts" or an icon opens the lines one per screen: the `PartIcons` row (the line on screen filled), part type, the name as read in full, price, and "Fix"; Back and Next page through, and Next on the last line ("Done") returns to the summary. "Fix" turns the card into edit fields (Part, Name, Price ($)) with Delete and Done. A line missing a name or price opens at once, marked red in the icons, and the summary says how many need fixing. The user's lines and prices are marked as not counted. If the server returned no lines, shows the couldn't-read message with "+ Add by hand" and "Try again".
PRD ref: `prd.md > Reading the Quote`, `prd.md > States and Boundaries` (Couldn't read / Partly read).

### Results Step
`web/src/components/ResultsStep.tsx`, `ResultCard.tsx` (renamed from `ResultRow.tsx`), `PriceBar.tsx`, `PartIcons.tsx`, `PartIcon.tsx`; money formatting and the reasonable range in `web/src/money.ts`. One card per screen; `ResultsStep` holds the card index, with large Back and Next buttons.
- Overview card: the one-sentence overview ("4 of 8 parts look reasonable."), "3 questions to ask." when there are any, and the `PartIcons` grid in verdict colors (labeled for screen readers); tapping an icon opens that part.
- Part card: above it, the `PartIcons` row in verdict colors with the part on screen filled, in place of "Part N of M"; tapping an icon jumps to that part. The card: `part_label` · quoted price, verdict phrase, `headline`, and an "Ask the seller" button when `ask_seller` is not null, which opens that part's question card. "Show proof" replaces the card body with the proof, and "Hide proof" brings it back: the name as written, cut to `key_words` with "…" where words were left out ("…RTX 4060…"; tap for the whole name; unmatched names whole), price range bar ("Typical (middle) $299", legend "A store listing"), each listing (store, price, date; the header row is for screen readers only), one range sentence with the band's swatch ("Reasonable: $210–$328, 70–110% of typical.", from `money.reasonableRange` and `rule_text`), and `sample_data_note`; a Can't verify proof shows one reason sentence instead.
- Question cards: one `ask_seller` question per card, in a `.bubble` (sent-message shape, tail at the bottom right). Above it, the `PartIcons` row with the asked-about part filled, and the position line "Ask the seller · 1/3". Below it, "Copy all 3" ("Copy" for one question; the screen's only solid button, so Next is an outline here) copies every question as one message — "Hi! A few quick questions before I decide:", a numbered line each, "Thanks!" — via `clipboard.copyText`, then reads "Copied ✓" (or "Couldn't copy").
- Not-counted elements carry `data-words="skip"` (buttons, step bar, and position are skipped by tag or class), so a browser check can count every screen the same way the README describes.
PRD ref: `prd.md > Price Verdicts`, `prd.md > Swap-Risk Flag`, `prd.md > Large Type and Ten Words a Screen`.

### Quote Reader (server)
`server/app/quote_reader.py`. Turns an image or text into part lines with one OpenAI call.
- Input: image bytes + MIME type, or text.
- Sends the image as a base64 data URL (or the text) with a short instruction: extract each PC part line as `part_type`, `name` exactly as written, `price_usd`; if this isn't a PC parts quote or can't be read, return no lines and a `problem`.
- Asks for structured output matching the `ReadResult` shape (see **Data Model**), so the reply is always valid JSON.
- `part_type` is one of: CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooler, Other.
- The prompt is written from scratch for this project.
PRD ref: `prd.md > Reading the Quote`.

### Matcher (server)
`server/app/matcher.py`. Finds the sample product for a line name, or says why not.
- Normalize: lowercase; drop spaces, hyphens, and punctuation.
- Match if the normalized name contains a normalized alias of exactly one product of the same part type (aliases live in `prices.json`, e.g., `rtx4060`, `geforcertx4060`). More than one product matching → no match, reason "name too vague."
- An alias followed by a model-variant suffix (`ti`, `super`, `xt`, `x3d`, `x`, `k`, `f`, ...) does not count: "RTX 4060 Ti" is not an RTX 4060.
- **Vague-name check** (also drives the swap-risk note): after removing generic words (`ssd`, `nvme`, `hdd`, `psu`, `power supply`, `ram`, `memory`, `ddr4`, `ddr5`, `case`, `cooler`, ...) and sizes/ratings (`1tb`, `650w`, `16gb`, `80+ gold`, ...), nothing that looks like a maker or model is left.
- Results: `matched(product, key_words)`, `vague` → Can't verify "name too vague," `not_found` → Can't verify "not in sample data."
- `key_words` = the words of the name as written that hold the matched alias, widened to whole words: "MSI GeForce RTX 4060 Ventus 2X 8GB" → "RTX 4060". Only the user's own words, so the proof never shows a name the user didn't write; and they are exactly the words that decided the match.
PRD ref: `prd.md > Price Verdicts` (Can't verify), `prd.md > Swap-Risk Flag`.

### Verdict Engine (server)
`server/app/verdict.py`. The kernel. Pure functions, no I/O.
- `typical_price` = median of the product's listing prices.
- Use exact arithmetic so the boundaries are exact: prices in whole cents, and `fractions.Fraction` for the median (an even number of listings can give a half cent):
  - quoted × 100 > typical × 110 → **Worth questioning**
  - quoted × 100 < typical × 70 → **Unusually low**
  - otherwise → **Reasonable**
- Collapsed number: the difference in dollars, e.g., "$12 below typical" / "$25 above typical" / "Matches typical."
- `ask_seller(...)` = one fixed-template question per Worth questioning / Unusually low / too-vague line, naming the part only, in plain words, asking the seller to check rather than to justify, with no number (the typical price is sample data): "Could you check the power supply price for me?", "Could you confirm the graphics card's model and condition?", "Could you tell me the storage's maker and model?"; `None` otherwise.
- `part_label` = the part type in plain words: CPU → "Processor", GPU → "Graphics card", RAM → "Memory", PSU → "Power supply", Cooler → "CPU cooler", Other → "Other part"; Motherboard, Storage, Case unchanged.
- Can't verify headlines: "No model named" (swap risk), "Name too vague" (fits several products), "Not in sample data".
- `WORD_LIMIT = 10` and `count_words(text)` (space-separated runs holding a letter or digit): `part_label` + quoted price + verdict phrase + `headline` must fit (worst case nine), for every verdict path, with prices up to $9,999.99; so must each question, the overview sentences, and the proof's range sentence + `sample_data_note`. A test enforces it; a headless-browser check counts the rendered screens.
- `RULE_TEXT` = "70–110% of typical" (the same band as −30% to +10%). Sent with every result so the screen shows the code's own rule; the proof puts the range in dollars before it: "Reasonable: $210–$328, 70–110% of typical."
PRD ref: `prd.md > Price Verdicts`.

### API (server)
`server/app/main.py`.
- `POST /api/read` — multipart with either `image` (file) or `text` (form field). Returns `ReadResult`. Rejects other file types or files over 5 MB with a plain message.
- `POST /api/check` — JSON `{ "lines": [PartLine, ...] }`. Returns `CheckResult`.
- No other endpoints. Loads `prices.json` once at startup.

## Data Model
Shapes are Pydantic models on the server (`server/app/models.py`) and mirrored as TypeScript types in `web/src/types.ts`.

```
PartLine     { part_type: string, name: string, price_usd: number }
ReadResult   { lines: PartLine[], problem: null | { kind: "unreadable" | "not_a_quote", message: string } }

Listing      { store: string, price_usd: number, date: "YYYY-MM-DD" }
LineResult   { line: PartLine,
               key_words: null | string,       // the words of the name that matched, as written: "RTX 4060"
               verdict: "reasonable" | "worth_questioning" | "unusually_low" | "cant_verify",
               headline: string,                 // e.g. "$12 below typical"
               cant_verify_reason: null | "not_in_sample" | "name_too_vague",
               typical_price_usd: null | number,
               listings: Listing[],
               swap_risk: boolean,
               ask_seller: null | string,      // fixed-rule question, see Verdict Engine; the card's button shows when set
               part_label: string }            // plain part name, e.g. "Graphics card"
CheckResult  { results: LineResult[], rule_text: string, sample_data_note: string }
```

**Sample price file** — `server/data/prices.json`, hand-made, labeled sample:
```
{ "note": "Sample data, not live.",
  "products": [
    { "id": "gpu-rtx4060", "part_type": "GPU", "name": "NVIDIA GeForce RTX 4060 8GB",
      "aliases": ["rtx4060"], "listings": [ { "store": "Store A", "price_usd": 299, "date": "2026-10-01" }, ... ] },
    ...
] }
```
- Real product names; **fictional store names** ("Store A", "Store B", "Store C") so no real retailer appears to charge a made-up price (learner decision).
- About 10–15 products, 3–5 listings each — enough for the sample quote plus a few extras.

**Where each piece of data lives**
| Data | Lives in | Updated by | After leaving the page |
|---|---|---|---|
| Uploaded image / pasted text | browser memory, sent once to the server | the user | gone; the server doesn't keep it |
| Part lines | React state in `App.tsx` | read result, then user edits | gone |
| Results | React state in `App.tsx` | `/api/check` | gone |
| Sample prices | `server/data/prices.json` | edited by hand | unchanged |
| OpenAI key | `.env` (ignored by git) | the developer | unchanged |

## File Structure
```
devpost-basics/
├── server/
│   ├── pyproject.toml          # uv project: fastapi, uvicorn, python-multipart, openai, pytest
│   ├── app/
│   │   ├── main.py             # FastAPI app, the two endpoints, loads prices.json
│   │   ├── models.py           # PartLine, ReadResult, LineResult, CheckResult
│   │   ├── quote_reader.py     # one OpenAI call: image/text → part lines
│   │   ├── matcher.py          # name → sample product, vague-name check
│   │   └── verdict.py          # median, +10% / −30% rule, headline text (the kernel)
│   ├── data/
│   │   └── prices.json         # hand-made sample prices, fictional stores
│   └── tests/
│       ├── test_verdict.py     # boundary cases: +10%, +11%, −30%, −31%
│       ├── test_card_text.py   # every card, question, and proof sentence fits WORD_LIMIT
│       └── test_matcher.py     # alias match, key words, vague names, not-in-sample
├── web/
│   ├── package.json
│   ├── vite.config.ts          # proxies /api to :8010
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx             # current step, lines, results (all state lives here)
│       ├── api.ts              # readQuote(), checkPrices()
│       ├── types.ts            # mirrors server/app/models.py
│       ├── sampleQuote.ts      # text for "Try sample"
│       ├── money.ts            # usd(), the reasonable range in whole dollars
│       ├── clipboard.ts        # copyText(): navigator.clipboard, or a selected textarea over plain http
│       ├── styles.css          # CSS variables from Look and Feel
│       └── components/
│           ├── StepBar.tsx
│           ├── UploadStep.tsx
│           ├── ConfirmStep.tsx
│           ├── ResultsStep.tsx
│           ├── ResultCard.tsx
│           ├── PriceBar.tsx
│           ├── PartIcons.tsx   # icon per part: grid on ② and the overview, position row on cards
│           └── PartIcon.tsx
├── samples/
│   └── sample-quote.png        # screenshot of the sample quote, for the demo upload
├── .env.example                # OPENAI_API_KEY=, OPENAI_MODEL=gpt-6-luna
├── .gitignore
├── LICENSE                     # chosen in 6-ship
├── README.md
└── devpost/                    # planning docs
```

The sample quote is designed so that, against `prices.json`, it produces every verdict: several Reasonable lines, one Worth questioning (e.g., PSU priced 20% above typical), one Unusually low (e.g., GPU 35% below), one Can't verify / not in sample, and one vague "SSD 1TB" line (Can't verify, name too vague, plus the swap-risk note). `sample-quote.png` is a screenshot of the same quote rendered as a simple shop-style table, made during the build.

## External Services and Dependencies

### OpenAI API
- Call: Responses API, `client.responses.parse(model=OPENAI_MODEL, input=[{ role: "user", content: [ { type: "input_text", text: <instructions + pasted text> }, { type: "input_image", image_url: "data:<mime>;base64,<...>" } ] }], text_format=ReadResult)`. Text-only requests omit the image part.
- Returns: a parsed `ReadResult`.
- Auth: `OPENAI_API_KEY` from `.env`, read on the server only — never sent to the browser.
- Cost: one call per "Read quote" press; small. Pricing differs by source for 2026 models — check https://platform.openai.com/docs/pricing.
- Verify early: model name, image input, and structured output with the installed SDK version (see **Stack**).

No other external services.

## Important Failure Modes
- **The model can't read the image, or it isn't a quote** → `/api/read` returns no lines and a `problem`; step ② shows "We couldn't read this image. It may be blurry, or it may not be a PC quote." with buttons to try another image or paste text. Telling blurry from not-a-quote is best-effort.
- **OpenAI call fails** (no key, network, wrong model name) → the server answers with a plain error; step ① shows "Reading failed — check the server log," and the text box still works. "Try sample" still needs the model, so the demo run is verified before recording.
- **The model misreads a name or price** → visible and editable in step ②; never turns into a verdict silently.

## What Was Simplified and Why
- **Hand-made sample prices** instead of live prices — no crawling or paid price source; labeled as sample everywhere. The full version would need a price feed and history storage.
- **Fictional store names** instead of real retailers — avoids implying real stores charge made-up prices.
- **Simple alias matching** instead of a product catalog with fuzzy search — enough for 10–15 sample products; ambiguous names become Can't verify rather than a guess.
- **No storage** — state lives in the page; nothing persists (`prd.md > States and Boundaries`).
- **Local only** — the demo video and public repo are what submission needs.

## Decisions and Open Issues
**Learner decisions**
- FastAPI + React (Vite) — familiar stack; accepts running two processes.
- OpenAI for reading — the key the learner has.
- No deployment — local run plus recording.
- Fictional store names in the sample data — the agent's recommendation, accepted.
- Large type and one part per screen, readable in a phone browser — chosen during the build after reviewing the judging criteria (`prd.md > Product Decisions`). Still local only; no native app.

**Derived implementation decisions (agent, following the above)**
- Model reads; plain code judges. Keeps the kernel deterministic and the shown rule honest.
- Boundaries computed with exact arithmetic (cents + `Fraction`) so +10% and −30% are exact.
- Pasted text goes through the same model call as images, so both inputs give the same part lines (`prd.md > Reading the Quote`).

**Learner uncertainty:** none named when asked.

**Open**
- Model name and capabilities — verify in the first build step (not blocking approval).
- Project name — still a working title; the learner names it for submission (`prd.md > Open Questions`).
