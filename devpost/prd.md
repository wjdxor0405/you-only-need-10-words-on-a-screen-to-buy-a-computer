---
doc: prd
status: approved
---

# Quote Check (working title) — Product Requirements

A pre-purchase check for PC beginners: upload or paste a PC quote you were given, and see, part by part, whether each price is reasonable and why — or an honest "can't verify."
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop`. Three steps, shown as a step bar at the top of the screen.

1. **Upload.** The user opens the app and sees a title, one line explaining what it does, and an input area. They upload a screenshot of the quote or paste the quote as text.
2. **Confirm parts.** The app shows the part lines it read from the quote: part type, product name as read, and quoted price. The user fixes a misread name or price, or deletes a line that isn't a part, then continues.
3. **Results.** Each part line shows a short verdict and one number. The user opens a line to see the full evidence. A beginner can stop at the short line; a doubtful user opens it.
4. **Done.** The user has read the results and decides whether to buy. Success is the learner's own definition: the user sees the evidence and is convinced (`scope.md > What "Working" Looks Like`).

## Screens and Layout
One page with a three-step bar: ① Upload → ② Confirm parts → ③ Results. The user moves forward with a button and can go back to an earlier step.

- **① Upload:** title, one-line explanation, screenshot drop area, text paste box, "Read quote" button.
- **② Confirm parts:** a list of part rows (part type, product name, quoted price), each editable and deletable; a "Check prices" button.
- **③ Results:** a short summary at the top (counts per verdict, quote total), then one row per part, collapsed by default.

## Look and Feel
- Light blue-gray page background, white cards with soft shadows.
- One strong accent: a vivid cobalt blue for primary buttons and the active step.
- Verdict colors: green for reasonable, amber for worth questioning, red reserved for real problems; gray for can't verify.
- Clean sans-serif (Pretendard-like character), slightly rounded corners.
- Calm, tidy shopping-helper tone. Plain words; no jargon in the short line.
- All UI text in English.

## Features and Behavior

### Reading the Quote
Develops `scope.md > The POC Boundary` (screenshot or text input; parts shown before verdicts).
- A screenshot is read into part lines (part type, product name, quoted price). Pasted text is read the same way.
- The user sees what was read before any verdict, so a misread name shows up as a reading problem, not a false verdict.
  - [ ] Uploading the sample screenshot shows its part lines in step ②.
  - [ ] Pasting the same quote as text produces the same part lines.
  - [ ] Editing a product name in step ② changes the result in step ③.

### Price Verdicts
The kernel (`scope.md > The Unique Kernel`). Each part's quoted price is compared with its **typical price**: the median of that exact product's sample listings.
- **Reasonable** (green) — no more than 10% above and no more than 30% below the typical price.
- **Worth questioning** (amber) — more than 10% above the typical price.
- **Unusually low** (amber) — more than 30% below the typical price. Shown as a caution, not a win: "Check that it's the exact model and that it's new."
- **Can't verify** (gray) — the product isn't in the sample data, or the name is too vague to match. The line says which.
- The rule itself is shown in the evidence (e.g., "We call a price reasonable within +10% / −30% of the typical price"). Price-comparison services keep their cutoffs private; showing ours is part of the kernel.
- Collapsed row: part type, product name, verdict phrase, one number (e.g., "Reasonable · $12 below typical").
- Expanded row: the typical price, the listings it came from (retailer, price, date), the rule used, and the sample-data label.
  - [ ] The sample quote shows at least one row of each verdict: Reasonable, Worth questioning, Unusually low, Can't verify.
  - [ ] Each collapsed row shows exactly one verdict phrase and one number.
  - [ ] Expanding a row shows the typical price, the rule, and retailer, price, and date for each listing used.
  - [ ] A price 11% above typical shows Worth questioning; 10% above shows Reasonable; 31% below shows Unusually low.
  - [ ] A Can't verify row says why (not in sample data / name too vague) and shows no invented number.

### Swap-Risk Flag
Develops `scope.md > The POC Boundary`. First to cut if time runs short.
- A line with no maker or model (e.g., "SSD 1TB", "PSU 650W") gets a note: without a model name, a cheaper part could be put in and there is nothing to point to.
  - [ ] "SSD 1TB" in the sample quote shows the swap-risk note.

### Overview and Questions to Ask the Seller
Added during the build after the first hands-on check: turns verdicts into something a beginner can act on.
- The results open with one plain sentence (e.g., "Of 8 parts, 4 look reasonable, 2 need a closer look and 2 couldn't be verified.").
- A "Questions to ask the seller" list gives one question per Worth questioning, Unusually low, or too-vague line, written by fixed rules from the verdict — never by the model.
- Each expanded row with a typical price also shows a price range bar: the quoted price against the reasonable range, the typical price, and each listing.
  - [ ] The sample quote lists questions for the PSU, the GPU, and "SSD 1TB", and none for Reasonable lines.

## States and Boundaries
- **First use** — step ① with an empty input area and the one-line explanation. A "Try a sample quote" link fills in the sample so the demo never starts empty.
- **Couldn't read the image** — if no part lines can be read, step ② shows a plain message instead of an empty list (e.g., "We couldn't read this image. It may be blurry, or it may not be a PC quote."), plus a way to try another image or paste text. Distinguishing "blurry" from "not a quote" is best-effort, not required.
- **Partly read** — lines that were read are shown; the user can add a missing line by hand in step ②.
- **Nothing persists** — closing the page clears everything. No accounts, no history.
- **Sample data** — every evidence panel states that prices come from a sample dataset, not live prices.

## Product Decisions
- Three steps (Upload → Confirm parts → Results) — a beginner handles one thing at a time; no step to replace parts or finalize a quote, because this tool neither builds nor changes quotes.
- Short line by default, full evidence on expand — the learner worried beginners would be overwhelmed by too much on one screen but felt all evidence fields (comparison, number, source, date, verdict) help convince.
- All English, with US-dollar prices and US retailers — judges and the demo are in English.
- Screenshot input included (scope decision), with a confirm step before verdicts.
- Swap-risk flag included if quick; first to cut.
- Verdicts are a percentage band around the median of sample listings: +10% / −30%, with a separate Unusually low verdict. Chosen after comparing price-labeling services (Google Shopping low/typical/high, CarGurus deal ratings — neither publishes cutoffs; an unofficial account puts CarGurus "Fair" within about ±5–10%) and GPU scam guidance ("50%+ below market is almost certainly a scam," for private used sales). 10% follows the CarGurus bands; 30% is a judgment call for shop quotes, lower than the private-sale 50%. Slightly cheap counts as reasonable so beginners don't distrust good quotes.

## What We're Building
- Steps ①–③ on one page, with a step bar.
- Reading a quote from a screenshot or pasted text into editable part lines.
- A hand-made sample price dataset (several listings per product) and one sample quote that exercises every verdict.
- Price verdicts with collapsed and expanded views.
- Couldn't-read message and the "Try a sample quote" shortcut.
- Swap-risk note (if time allows).

## Deferred From the POC
- Live prices or price history — needs crawling or a paid price source; sample data proves the idea.
- Recommending a cheaper replacement — needs a product catalog and its own step.
- Saving or comparing quotes — needs storage; nothing persists in the PoC.
- Several screenshots for one quote — one image or one paste is enough to demo.

## Possible Later Enhancements
- Start from vague conditions and get a recommended quote, with this check as the last step.
- Check a delivered PC against the quote (the original parts-swap idea).
- Korean-market version with KRW and Korean retailers.

## Non-Goals
- Compatibility or performance checks — the kernel is price evidence only.
- Review analysis or fake-review detection — a separate, large problem.
- Accounts, login, or a database.

## Open Questions
- **Project name (can wait):** "Quote Check" is a working title; the learner names it for submission.
