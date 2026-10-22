"""FastAPI app: the endpoints the screen calls."""

import json
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, Form, HTTPException

from app import quote_reader, verdict
from app.matcher import is_vague, match
from app.models import CheckRequest, CheckResult, LineResult, PartLine, PriceData, ReadResult

PRICES_PATH = Path(__file__).resolve().parent.parent / "data" / "prices.json"
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
log = logging.getLogger("uvicorn.error")

app = FastAPI(title="Quote Check")
prices = PriceData.model_validate(json.loads(PRICES_PATH.read_text()))


def check_line(line: PartLine, data: PriceData) -> LineResult:
    found = match(line, data.products)
    swap_risk = is_vague(line.name)
    if found.kind == "vague":
        return LineResult(line=line, verdict="cant_verify", headline="Name too vague to match",
                          cant_verify_reason="name_too_vague", typical_price_usd=None,
                          listings=[], swap_risk=swap_risk,
                          ask_seller=verdict.ask_seller(line.part_type, line.name, "cant_verify", None, True))
    if found.kind == "not_found":
        return LineResult(line=line, verdict="cant_verify", headline="Not in our sample data",
                          cant_verify_reason="not_in_sample", typical_price_usd=None,
                          listings=[], swap_risk=swap_risk,
                          ask_seller=verdict.ask_seller(line.part_type, line.name, "cant_verify", None, swap_risk))
    listings = found.product.listings
    typical = verdict.typical_price_cents(listings)
    judged = verdict.judge(line.price_usd, typical)
    diff = verdict.difference_dollars(line.price_usd, typical)
    return LineResult(
        line=line,
        verdict=judged,
        headline=verdict.headline(line.price_usd, typical),
        cant_verify_reason=None,
        typical_price_usd=round(float(typical) / 100, 2),
        listings=listings,
        swap_risk=swap_risk,
        ask_seller=verdict.ask_seller(line.part_type, line.name, judged, diff, swap_risk),
    )


@app.post("/api/check")
def check(request: CheckRequest) -> CheckResult:
    return CheckResult(
        results=[check_line(line, prices) for line in request.lines],
        rule_text=verdict.RULE_TEXT,
        sample_data_note=prices.note,
        total_usd=round(sum(line.price_usd for line in request.lines), 2),
    )


@app.post("/api/read")
def read(text: str = Form("")) -> ReadResult:
    if not text.strip():
        raise HTTPException(400, "Paste a quote first.")
    try:
        return quote_reader.read_quote(text=text)
    except Exception:
        log.exception("Reading the quote failed")
        raise HTTPException(502, "Reading failed — check the server log.")
