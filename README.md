# Quote Check

A pre-purchase check for PC beginners: upload a screenshot of a PC quote you were given, or paste its text, and see, part by part, whether each price is reasonable and why — or an honest "can't verify."

A language model only *reads* the quote into part lines, which you confirm. The verdicts come from plain code: the median of sample listings and a fixed +10% / −30% rule, shown on screen.

Prices come from a small hand-made sample dataset (`server/data/prices.json`), not live data.

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

- Press **Try a sample quote**, then **Read quote**, or choose `samples/sample-quote.png` as the screenshot. The sample produces every verdict.
- On a phone: start the web server with `npm run dev -- --host` and open the Network URL it prints, from a phone on the same Wi-Fi.
- The model is set by `OPENAI_MODEL` in `.env` (default `gpt-6-luna`). To check it reads a quote: `cd server && uv run python scripts/probe_model.py`.
- `samples/sample-quote.png` is rendered from `samples/sample-quote.html`; the command to regenerate it is at the top of that file.

## Tests

```
cd server && uv run pytest
```
