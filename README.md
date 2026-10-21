# Quote Check

A pre-purchase check for PC beginners: enter the parts of a PC quote you were given and see, part by part, whether each price is reasonable and why — or an honest "can't verify."

Prices come from a small hand-made sample dataset (`server/data/prices.json`), not live data.

## Run it locally

Requirements: Python 3.12, [uv](https://docs.astral.sh/uv/), Node 22.

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

## Tests

```
cd server && uv run pytest
```
