---
doc: prd
status: approved
---

# Quote Check (working title) — Product Requirements

A pre-purchase check for PC beginners, readable on a phone without zooming: upload or paste a PC quote you were given, and see, part by part, whether each price is reasonable and why — or an honest "can't verify."
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Develops `scope.md > The Core Loop`. Three steps, shown at the top of the screen as three dots and the current step's name.

1. **Upload.** The user opens the app — usually on their phone, where the quote arrived — and sees a title, one line explaining what it does, and two ways in: add a screenshot, or paste the quote as text. What they gave is kept whole but shown folded: a thumbnail of the screenshot, or "11 lines" for pasted text.
2. **Confirm parts.** The app says how many parts it read, with one icon per part and its price under it, and asks "Look right?". The user holds the count and the prices against the quote in front of them (the quote's own total may include fees, so no total is shown) and checks prices, or taps "Fix parts" or an icon to page through the lines as read, one per screen, and correct a name or price, or delete a line that isn't a part.
3. **Results.** An overview card comes first, then one card per part: a verdict phrase, one number, and at most a two-word action. Large Next and Back buttons move between cards, and a row of part icons above each card shows where the user is (tap one to jump). "Show proof" turns the card into its evidence. A beginner can stop at the card; a doubtful user opens the proof. The last cards hold the questions to ask the seller, one per card.
4. **Done.** The user has read the results and decides whether to buy. Success is the learner's own definition: the user sees the evidence and is convinced (`scope.md > What "Working" Looks Like`).

## Screens and Layout
One page with three steps: ① Upload → ② Confirm → ③ Results, shown as three dots and the current step's name. The user moves forward with a button and can go back to an earlier step by tapping its dot.

- **① Upload:** title, one-line explanation, "Add screenshot" (dropping a file also works; then a thumbnail), "Paste text" (opens the text box; a paste folds it into "11 lines" with "Edit"), "Try sample", and "Read quote" once there is something to read.
- **② Confirm:** the count of parts read, one icon per part with its price, a "+" to add a line, "Fix parts", and "Check prices". "Fix parts" or an icon opens the lines one per screen (part type, product name as read, quoted price, "Fix" to edit or delete), with the row of part icons showing which line is on screen.
- **③ Results:** one card per screen — the overview (one or two sentences and one colored icon per part), then one card per part, then one card per question to ask the seller. A row of part icons above each part card (the one on screen filled) or "Ask the seller · 1/3" shows where the user is.

## Look and Feel
- Light blue-gray page background, white cards with soft shadows.
- One strong accent: a vivid cobalt blue for primary buttons and the active step.
- Verdict colors: green for reasonable, amber for worth questioning, red reserved for real problems; gray for can't verify.
- Clean sans-serif (Pretendard-like character), slightly rounded corners.
- Calm, tidy shopping-helper tone. Plain words; no jargon in the short line.
- **Large type by default**, not a setting, with three levels so that one thing on each card stands out:
  - **Decide** (largest): the verdict phrase (32px) and its one number (24px). On the overview card, the one sentence.
  - **Read and act** (20px): the action, the seller questions, the can't-verify and swap-risk reasons in the proof, and every button (at least 56px tall, full width on a phone; pairs such as Back and Next sit side by side, and Fix sits beside its price).
  - **Context** (16px, muted color): the part in plain words with its quoted price, the step name, "Ask the seller · 1/3", sample-data label, and the rest of the proof (the name as written, listings with store, price, and date, range bar labels and legend).
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
- The rule itself is shown in the evidence, with the range it gives in dollars ("Reasonable: $210–$328, 70–110% of typical."). Price-comparison services keep their cutoffs private; showing ours is part of the kernel.
- Card: the part in plain words with its quoted price (e.g., "Graphics card · $195"), verdict phrase, one number (e.g., "$104 below typical"), and a fixed two-word action where there is something to do ("Ask why." for Worth questioning and Unusually low, "Ask which." for a too-vague name).
- Proof ("Show proof", in place of the card; "Hide proof" goes back): the product name as written, cut to the words that matched a sample product ("…RTX 4060…"; a tap shows the whole name), a price range bar with the typical price (the middle listing), the listings it came from (retailer, price, date), the range and the rule used, and the sample-data label. A Can't verify proof gives the whole name and its reason in one sentence instead.
  - [ ] The sample quote shows at least one card of each verdict: Reasonable, Worth questioning, Unusually low, Can't verify.
  - [ ] Each card shows exactly one verdict phrase and one number.
  - [ ] Opening the proof shows the typical price, the rule, and retailer, price, and date for each listing used.
  - [ ] The sample graphics card's proof names it "…RTX 4060…", and a tap shows "MSI GeForce RTX 4060 Ventus 2X 8GB".
  - [ ] A price 11% above typical shows Worth questioning; 10% above shows Reasonable; 31% below shows Unusually low.
  - [ ] A Can't verify row says why (not in sample data / name too vague) and shows no invented number.

### Swap-Risk Flag
Develops `scope.md > The POC Boundary`. First to cut if time runs short.
- A line with no maker or model (e.g., "SSD 1TB", "PSU 650W") says "No model named" on its card, and its proof says why that matters: "Without a model, a cheaper part could be swapped in."
  - [ ] "SSD 1TB" in the sample quote shows the swap-risk note.

### Overview and Questions to Ask the Seller
Added during the build after the first hands-on check: turns verdicts into something a beginner can act on.
- The first results card is the overview: one plain sentence (e.g., "4 of 8 parts look reasonable."), how many questions there are for the seller ("3 questions to ask."), and one dot per part in its verdict color. The parts total is no longer shown: a quote's own total often includes fees, so it would look like a mismatch.
- The last cards, "Ask the seller · 1/3", give one short question per Worth questioning, Unusually low, or too-vague line (e.g., "Why is the power supply $20 above typical?"), naming the part in plain words, written by fixed rules from the verdict — never by the model. One question per card, so each card stays within ten words.
- The proof of each part with a typical price also shows a price range bar: the quoted price against the reasonable range, the typical price, and each listing.
  - [ ] The sample quote lists questions for the PSU, the GPU, and "SSD 1TB", and none for Reasonable lines.

### Large Type and Ten Words a Screen
Added during the build: the quote arrives on a phone, the user should decide one thing at a time, and reviewers watch the demo in a small video player.
- **No screen shows more than ten words** that the app wrote. If text doesn't fit, it is shortened, never shrunk. Errors and loading messages take the place of the screen's lead line, so they count too.
- A word is any run of characters between spaces that holds a letter or digit: "$1,039" is one word, "·" and "—" are none.
- Not counted, and said so in the README: buttons, the step bar, the position (the row of part icons, "Ask the seller · 1/3"), what the user gave the app (the quote text, the screenshot, the lines and prices as read and the fields that edit them, the name as written in the proof), and data displays in the proof (the price range bar and its legend, the listings table).
- Not counted is not free: the screens also keep the exempt words down. One word for the step bar instead of seven, icons instead of "Part 3 of 8", the user's quote folded to a line count or a thumbnail, ② one line per screen, and the proof's name cut to the words that matched.
- "Show proof" replaces the card with its proof, so the card and its proof are separate screens and each stays within ten words.
- Cards name a part by **what it is and what it costs**: the part in plain words (Processor, Graphics card, Memory, Power supply, …) with the quoted price, so the user can find the line on the quote in front of them. Product names, brands, and specs stay in the proof.
- Worst case on a part card is exactly ten: "Graphics card · $9,999.99 / Worth questioning / $9,401 above typical / Ask why."
  - [ ] The sample quote's graphics card shows "Graphics card · $195"; its name as written appears only in the proof.
  - [ ] Every screen of the sample run — upload, confirm, overview, each part card and its proof, each question — shows at most ten counted words.
  - [ ] Counting everything visible, the user's input included, the sample run stays within: ① 16, ② summary 19, each ② line 14, overview 14, part cards 15, proofs 40, questions 16.
  - [ ] Every part card and question, for each verdict path with prices up to $9,999.99, stays within ten words.
  - [ ] On a 360px-wide screen, no step needs zooming or sideways scrolling.
  - [ ] Body text is at least 20px, the verdict phrase at least 32px, and buttons at least 56px tall.
  - [ ] No text anywhere is smaller than 16px, including the sample-data label and the proof.
  - [ ] On every part card, the verdict phrase is the largest text.

## States and Boundaries
- **First use** — step ① with the one-line explanation and the two ways in. "Try sample" fills in the sample so the demo never starts empty.
- **Couldn't read the image** — if no part lines can be read, step ② shows a plain message instead of an empty list ("We couldn't read this image. Try a clearer one."), plus "Try again" (back to step ①) and "+ Add by hand". Distinguishing "blurry" from "not a quote" is best-effort, not required.
- **Partly read** — lines that were read are shown; the user can add a missing line by hand in step ②.
- **Nothing persists** — closing the page clears everything. No accounts, no history.
- **Sample data** — every evidence panel states that prices come from a sample dataset, not live prices.

## Product Decisions
- Three steps (Upload → Confirm parts → Results) — a beginner handles one thing at a time; no step to replace parts or finalize a quote, because this tool neither builds nor changes quotes.
- Short card by default, full evidence on its own screen — the learner worried beginners would be overwhelmed by too much on one screen but felt all evidence fields (comparison, number, source, date, verdict) help convince.
- All English, with US-dollar prices and US retailers — judges and the demo are in English.
- Screenshot input included (scope decision), with a confirm step before verdicts.
- Swap-risk flag included if quick; first to cut.
- **Large type and one part per screen, by default** — chosen after reviewing the judging criteria: reviewers only watch the video, in a small player, and the quote arrives on a phone. Large type is not pitched as an age feature: no data shows parents of teens prefer it, though about 1 in 5 iPhone users in one large app's data chose larger text ([source](https://fassko.medium.com/embracing-the-dynamic-type-d8df6701aa19)) and near vision typically starts to fade after 40. Only the verdict is big; context stays at 16px so the card has one focal point. Considered and rejected: a text-size toggle (reads as a generic option, and the default screen stays small); a native phone app (rebuilds every screen and needs a hosted server). A post-delivery parts check would add the most novelty but cost most of the remaining time, so it stays under Possible Later Enhancements. Cost: every sample product needs a hand-written spec label; with brands off the cards, a vague name no longer stands out by contrast, so its card states the swap risk outright; the seller questions name only the part type.
- **Ten words a screen** (replaces the 120-character card limit) — the learner's concept, to try in the app before deciding whether it stays. It is a limit a reviewer can count in the video, and it pushes the large-type decision one step further: one decision per screen, read in the shop with the seller waiting. Ten is a design rule, not a researched threshold; it is the smallest count that still fits part, price, verdict, number, and an action. Considered: keeping 120 characters (about 20 words — not a claim anyone can check by eye) and seven words (drops the number or the action). Cost: spec labels and the swap-risk sentence leave the card for the proof; step ② checks the count and the part icons instead of listing every line, so a misread name or price is only caught under "Fix parts"; questions go one per card; the seller questions' heading moves into the position line; and the exemptions have to be stated, or the count looks gamed.
- **Fewer words where the rule doesn't count, and the user's input folded** — the learner counted every visible word, not only the counted ones, and asked to cut the exempt words too and to summarize their own input while keeping it. Measured before: the step bar was 7 words on every screen, the pasted quote 67, ②'s line list 65, a proof screen 55–63 in all. For the user's input, show the words that decided the result and keep the rest one tap away: the proof's name is cut to the matched words of the user's own text, so a misread outside them cannot have changed the verdict. Considered: having the model write a short name (could invent words, and the proof would no longer show what the user wrote); arrows instead of Back / Next (two words fewer, but "Next" is plainer for a first-time user); dropping store names or dates (the learner found source and date convincing); moving the rule sentence into the exempt legend (lowers the count only on paper). Cost: ② takes a page per line to see every line; only the current step's name shows; the position icons are 36px; prices under ②'s icons add eight words, because "Look right?" can't be answered from icons alone.
- Verdicts are a percentage band around the median of sample listings: +10% / −30%, with a separate Unusually low verdict. Chosen after comparing price-labeling services (Google Shopping low/typical/high, CarGurus deal ratings — neither publishes cutoffs; an unofficial account puts CarGurus "Fair" within about ±5–10%) and GPU scam guidance ("50%+ below market is almost certainly a scam," for private used sales). 10% follows the CarGurus bands; 30% is a judgment call for shop quotes, lower than the private-sale 50%. Slightly cheap counts as reasonable so beginners don't distrust good quotes.

## What We're Building
- Steps ①–③ on one page, with a step bar.
- Reading a quote from a screenshot or pasted text into editable part lines.
- A hand-made sample price dataset (several listings per product) and one sample quote that exercises every verdict.
- Price verdicts as one card per part, with the proof one tap away.
- Large type and at most ten words a screen; readable on a phone.
- Couldn't-read message and the "Try sample" shortcut.
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
