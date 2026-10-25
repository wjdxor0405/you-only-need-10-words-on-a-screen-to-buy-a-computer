---
doc: scope
status: approved
---

# Quote Check (working title)

A pre-purchase check for people who don't want to read long text, readable on a phone without zooming: paste or upload a PC quote you were given, and see, part by part, whether the price is reasonable and why — or an honest "can't verify."

## The Unique Kernel
**Price evidence.** Every verdict comes with a reason anyone can follow without knowing PCs ("similar listings sell for about X"), and when there is no evidence the tool says "can't verify" instead of guessing. Honesty about what it doesn't know is part of the kernel, not an error state.

## Who It's For
Someone who doesn't want to read long text and has been handed a PC quote — by a shop, a friend, or an influencer's build list — and is hesitating before paying: "Can I trust this price, these parts?" Today they either trust the person who gave it to them or read their way through reviews they can't fully trust (ads, fake reviews), spec sheets, and listings. Knowing PCs is not part of the definition: a beginner is one such person, not the only one.

**Demo persona** (revised twice during the build): the video's narrator, speaking for themselves — someone who doesn't want to read long text. A shop's PC quote arrives on their phone, and they want to know whether the prices are fair without reading reviews or spec sheets. Earlier: a parent paying for their teenager's first gaming PC (`prd.md > Product Decisions`).

## The Core Loop
They paste the quote they received → each line comes back with a simple verdict and its evidence → they read it without having to think hard, and decide whether to buy.
They come back each time someone hands them a new quote.

## Inspiration & Identity
- Should feel like it takes the complexity off the user: "you don't need to think hard about this."
- Tone is honest and plain, not salesy. Saying "can't verify" earns more trust than a confident guess.
- Readable at a glance on a phone: large type by default (not a setting), one part per screen, and at most ten words a screen. If something doesn't fit, it gets shorter, not smaller.
- Only the verdict is big. Sources and context stay readable but quiet — and never fine print: a tool that points out what a quote leaves vague can't hide its own caveats.

## Why This Matters to the Learner
Finish one project end to end, from an empty folder to submission, in a short time. The learner chose a focused version of a product idea they already know well: one core loop — a quote in, price evidence out — small enough to build, verify, and demo within the hackathon.

## What "Working" Looks Like
The learner's own definition: the user sees the evidence and **is convinced** — that is when it is "done."
For the demo: paste a sample quote → a per-part result appears, with price evidence on the reasonable lines and an honest "can't verify" on at least one line. The "oh" beat is someone who won't read long text reading one line and understanding *why*, without knowing anything about PCs — on a phone, without zooming.

## The POC Boundary
- One screen: quote in, per-part verdicts with evidence out.
- Large type by default. Results show one part per screen, at most ten words a screen; the full evidence is one tap away. Works in a phone browser and still runs locally — no deployment, no native app.
- Input is a quote the user already has — pasted text or a screenshot. The tool does not build quotes.
- Screenshots are read into part lines the user can see before verdicts, so a misread brand shows up as a reading problem, not as a false "worth questioning." Pasted text stays as the fallback.
- Price evidence comes from a small hand-made sample dataset, labeled as sample data.
- Three outcomes per line: reasonable / worth questioning / can't verify.
- Swap-risk flag: point out lines with no maker or model (e.g., "SSD 1TB", "PSU 600W"), since a cheaper part could be swapped in without grounds to complain. Included because it is small; first to cut if time runs short.

## Later
- Starting from vague conditions ("I want to play this game, budget X") and recommending a quote — a recommendation flow this check could sit behind.
- Checking a PC after delivery against the quote (the original parts-swap idea); also custom-build services and used PCs.

## Explicitly Cut
- Live price crawling — time, and the scraping rules of real shops.
- Login, accounts, saved history, database — not needed to prove the kernel.
- Review analysis / fake-review detection — a separate, large problem; the learner's distrust of reviews is why this tool uses price evidence instead.
