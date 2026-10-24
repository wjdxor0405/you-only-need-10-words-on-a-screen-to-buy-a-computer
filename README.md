# Quote Check

A pre-purchase check for PC beginners: upload a screenshot of a PC quote you were given, or paste its text, and see, part by part, whether each price is reasonable and why — or an honest "can't verify."

A language model only *reads* the quote into part lines, which you confirm. The verdicts come from plain code: the median of sample listings and a fixed +10% / −30% rule, shown on screen.

Prices come from a small hand-made sample dataset (`server/data/prices.json`), not live data.

## Ten words a screen

No screen shows more than ten words that the app wrote, so a result can be read at a glance on a phone. A word is any run of characters between spaces that holds a letter or digit: "$1,039" is one word, "·" is none. Loading and error messages replace the screen's lead line, so they count too.

Not counted:

- buttons, the step dots and step name, and the position (the row of part icons above a card, "Ask the seller · 1/3");
- what you gave the app: the quote text, the screenshot, the lines and prices as read and the fields that edit them, and the product name as written in the proof;
- data displays in the proof: the price range bar with its legend, and the listings table.

Not counted is not free. The step bar is one word, the position is icons, your quote is kept whole but shown folded (a line count for text, a thumbnail for a screenshot), and the proof names a part by the words of your line that matched a product ("…RTX 4060…"; tap for the whole name).

"Show proof" replaces the card with its proof, so each is its own screen. A question for the seller is shown as a message bubble; "Copy all 3" copies every question as one message to paste into your chat with the seller. `server/tests/test_card_text.py` checks every card for every verdict with prices up to $9,999.99.

## Run it locally

Requirements: Python 3.12, [uv](https://docs.astral.sh/uv/), Node 22, and an OpenAI API key.

```
# once
cp .env.example .env            # then put OPENAI_API_KEY in .env
cd server && uv sync
cd ../web && npm install

# every time — two terminals
cd server && uv run uvicorn app.main:app --reload --port 8010
cd web && npm run dev           # open http://localhost:5173
```

The web dev server forwards `/api/*` to the server on port 8010.

## Try it

- Press **Try sample**, then **Read quote**, or choose `samples/sample-quote.png` as the screenshot. The sample produces every verdict.
- On a phone: start the web server with `npm run dev -- --host` and open the Network URL it prints, from a phone on the same Wi-Fi.
- The model is set by `OPENAI_MODEL` in `.env` (default `gpt-6-luna`). To check it reads a quote: `cd server && uv run python scripts/probe_model.py`.
- `samples/sample-quote.png` is rendered from `samples/sample-quote.html`; the command to regenerate it is at the top of that file.

## Tests

```
cd server && uv run pytest
```
