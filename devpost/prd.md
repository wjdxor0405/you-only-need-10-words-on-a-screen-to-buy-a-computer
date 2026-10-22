---
doc: prd
status: approved
---

# Quote Check (working title) — Product Requirements

A pre-purchase check for PC beginners, readable on a phone without zooming: upload or paste a PC quote you were given, and see, part by part, whether each price is reasonable and why — or an honest "can't verify."
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop`. Three steps, shown as a step bar at the top of the screen.

1. **Upload.** The user opens the app — usually on their phone, where the quote arrived — and sees a title, one line explaining what it does, and an input area. They upload a screenshot of the quote or paste the quote as text.
2. **Confirm parts.** The app shows the part lines it read from the quote, one large card per line: part type, product name as read, and quoted price. The user taps "Fix" to correct a misread name or price, or to delete a line that isn't a part, then continues.
3. **Results.** An overview card comes first, then one card per part: a verdict phrase, one number, and one sentence of advice. Large Next and Back buttons move between cards. "Show proof" opens the full evidence. A beginner can stop at the card; a doubtful user opens the proof. The last card lists questions to ask the seller.
4. **Done.** The user has read the results and decides whether to buy. Success is the learner's own definition: the user sees the evidence and is convinced (`scope.md > What "Working" Looks Like`).

## Screens and Layout
One page with a three-step bar: ① Upload → ② Confirm parts → ③ Results. The user moves forward with a button and can go back to an earlier step.

- **① Upload:** title, one-line explanation, screenshot drop area, text paste box, "Read quote" button.
- **② Confirm parts:** one large card per part line (part type, product name, quoted price), each with "Fix" to edit or delete; "Add a line"; a "Check prices" button.
- **③ Results:** one card per screen — the overview (one sentence, counts per verdict, quote total), then one card per part, then the questions to ask the seller. "Part 3 of 8" shows where the user is.

## Look and Feel
- Light blue-gray page background, white cards with soft shadows.
- One strong accent: a vivid cobalt blue for primary buttons and the active step.
- Verdict colors: green for reasonable, amber for worth questioning, red reserved for real problems; gray for can't verify.
- Clean sans-serif (Pretendard-like character), slightly rounded corners.
- Calm, tidy shopping-helper tone. Plain words; no jargon in the short line.
- **Large type by default**, not a setting, with three levels so that one thing on each card stands out:
  - **Decide** (largest): the verdict phrase (32px) and its one number (24px). On the overview card, the one sentence.
  - **Read and act** (20px): the spec label, the advice sentence, the seller questions, the swap-risk note, and every button (at least 56px tall, full width on a phone).
  - **Context** (16px, muted color): the part in plain words with its quoted price, "Part 3 of 8", step bar, quote total, sample-data label, and everything in the proof (full name as read, rule, listings with store, price, and date, range bar legend).
- **No fine print:** nothing is smaller than 16px — the sample-data label included. Can't-verify reasons and the swap-risk note are never put in the context level; honesty is part of the kernel.
- Fits a 360px-wide phone screen with no zooming and no sideways scrolling.
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
- Card: the part in plain words with its quoted price (e.g., "Graphics card · $195"), the spec label (e.g., "RTX 4060, 8GB"), verdict phrase, one number (e.g., "$104 below typical"), and one fixed sentence of advice (e.g., "Check it's the exact model and new.").
- Proof ("Show proof"): the full product name as read, the typical price, the listings it came from (retailer, price, date), the rule used, and the sample-data label.
  - [ ] The sample quote shows at least one card of each verdict: Reasonable, Worth questioning, Unusually low, Can't verify.
  - [ ] Each card shows exactly one verdict phrase and one number.
  - [ ] Opening the proof shows the typical price, the rule, and retailer, price, and date for each listing used.
  - [ ] A price 11% above typical shows Worth questioning; 10% above shows Reasonable; 31% below shows Unusually low.
  - [ ] A Can't verify row says why (not in sample data / name too vague) and shows no invented number.

### Swap-Risk Flag
Develops `scope.md > The POC Boundary`. First to cut if time runs short.
- A line with no maker or model (e.g., "SSD 1TB", "PSU 650W") gets a note: without a model name, a cheaper part could be put in and there is nothing to point to.
  - [ ] "SSD 1TB" in the sample quote shows the swap-risk note.

### Overview and Questions to Ask the Seller
Added during the build after the first hands-on check: turns verdicts into something a beginner can act on.
- The first results card is the overview: one plain sentence (e.g., "Of 8 parts, 4 look reasonable, 2 need a closer look and 2 couldn't be verified.") and the counts.
- The last card, "Questions to ask the seller", gives one short question per Worth questioning, Unusually low, or too-vague line (e.g., "Why is the PSU $20 above typical?"), written by fixed rules from the verdict — never by the model. At most three questions per card.
- The proof of each part with a typical price also shows a price range bar: the quoted price against the reasonable range, the typical price, and each listing.
  - [ ] The sample quote lists questions for the PSU, the GPU, and "SSD 1TB", and none for Reasonable lines.

### Large Type and Character Limit
Added during the build: the quote arrives on a phone, the user should decide one thing at a time, and reviewers watch the demo in a small video player.
- Every card shows at most **120 characters** of text before "Show proof" (step bar and buttons not counted). If text doesn't fit, it is shortened, never shrunk.
- Cards name a part by **what it is and what it costs**, not by its full product name:
  - the part in plain words (Processor, Graphics card, Memory, Power supply, …) with the quoted price, so the user can find the line on the quote in front of them;
  - a hand-written spec label for each sample product — the specs that set the price (e.g., "RTX 4060, 8GB", "650W, 80+ Gold"). Brand and series names ("MSI … Ventus 2X") stay in the proof.
- A line that isn't in the sample data shows its name as read, cut to 28 characters — no invented specs.
- A line with no maker or model uses its advice sentence for the swap-risk warning ("No maker or model — a cheaper part could be swapped in."), since brands no longer appear on other cards to contrast with.
  - [ ] The sample quote's graphics card shows "Graphics card · $195" and "RTX 4060, 8GB"; its full name as read appears only in the proof.
  - [ ] Every card for the sample quote, and for each verdict path, stays within 120 characters.
  - [ ] On a 360px-wide screen, no step needs zooming or sideways scrolling.
  - [ ] Body text is at least 20px, the verdict phrase at least 32px, and buttons at least 56px tall.
  - [ ] No text anywhere is smaller than 16px, including the sample-data label and the proof.
  - [ ] On every part card, the verdict phrase is the largest text.

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
- **Large type and one part per screen, by default** — chosen after reviewing the judging criteria: reviewers only watch the video, in a small player, and the quote arrives on a phone. Large type is not pitched as an age feature: no data shows parents of teens prefer it, though about 1 in 5 iPhone users in one large app's data chose larger text ([source](https://fassko.medium.com/embracing-the-dynamic-type-d8df6701aa19)) and near vision typically starts to fade after 40. Only the verdict is big; context stays at 16px so the card has one focal point. Considered and rejected: a text-size toggle (reads as a generic option, and the default screen stays small); a native phone app (rebuilds every screen and needs a hosted server). A post-delivery parts check would add the most novelty but cost most of the remaining time, so it stays under Possible Later Enhancements. Cost: every sample product needs a hand-written spec label; with brands off the cards, a vague name no longer stands out by contrast, so its card states the swap risk outright; the seller questions name only the part type.
- Verdicts are a percentage band around the median of sample listings: +10% / −30%, with a separate Unusually low verdict. Chosen after comparing price-labeling services (Google Shopping low/typical/high, CarGurus deal ratings — neither publishes cutoffs; an unofficial account puts CarGurus "Fair" within about ±5–10%) and GPU scam guidance ("50%+ below market is almost certainly a scam," for private used sales). 10% follows the CarGurus bands; 30% is a judgment call for shop quotes, lower than the private-sale 50%. Slightly cheap counts as reasonable so beginners don't distrust good quotes.

## What We're Building
- Steps ①–③ on one page, with a step bar.
- Reading a quote from a screenshot or pasted text into editable part lines.
- A hand-made sample price dataset (several listings per product) and one sample quote that exercises every verdict.
- Price verdicts as one card per part, with the proof one tap away.
- Large type and a 120-character limit per card; readable on a phone.
- Couldn't-read message and the "Try a sample quote" shortcut.
- Swap-risk note (if time allows).

## Deferred From the POC
- Live prices or price history — needs crawling or a paid price source; sample data proves the idea.
- Recommending a cheaper replacement — needs a product catalog and its own step.
- Saving or comparing quotes — needs storage; nothing persists in the PoC.
- Several screenshots for one quote — one image or one paste is enough to demo.
- A native phone app or a text-size setting — a phone browser with large type by default does the job.

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
