"""FastAPI app: the endpoints the screen calls."""

import json
import logging
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app import quote_reader, verdict
from app.matcher import is_vague, match
from app.models import CheckRequest, CheckResult, LineResult, PartLine, PriceData, ReadResult

PRICES_PATH = Path(__file__).resolve().parent.parent / "data" / "prices.json"
IMAGE_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_IMAGE_BYTES = 5 * 1024 * 1024
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
log = logging.getLogger("uvicorn.error")

app = FastAPI(title="Quote Check")
prices = PriceData.model_validate(json.loads(PRICES_PATH.read_text()))


def check_line(line: PartLine, data: PriceData) -> LineResult:
    found = match(line, data.products)
    swap_risk = is_vague(line.name)
    label = verdict.part_label(line.part_type)
    if found.kind != "matched":
        reason = "name_too_vague" if found.kind == "vague" else "not_in_sample"
        return LineResult(line=line, key_words=None, verdict="cant_verify",
                          headline=verdict.cant_verify_headline(reason, swap_risk),
                          cant_verify_reason=reason, typical_price_usd=None,
                          listings=[], swap_risk=swap_risk,
                          ask_seller=verdict.ask_seller(line.part_type, "cant_verify", None, found.kind == "vague"),
                          part_label=label)
    listings = found.product.listings
    typical = verdict.typical_price_cents(listings)
    judged = verdict.judge(line.price_usd, typical)
    diff = verdict.difference_dollars(line.price_usd, typical)
    return LineResult(
        line=line,
        key_words=found.key_words,
        verdict=judged,
        headline=verdict.headline(line.price_usd, typical),
        cant_verify_reason=None,
        typical_price_usd=round(float(typical) / 100, 2),
        listings=listings,
        swap_risk=swap_risk,
        ask_seller=verdict.ask_seller(line.part_type, judged, diff, swap_risk),
        part_label=label,
    )


@app.post("/api/check")
def check(request: CheckRequest) -> CheckResult:
    return CheckResult(
        results=[check_line(line, prices) for line in request.lines],
        rule_text=verdict.RULE_TEXT,
        sample_data_note=prices.note,
    )


@app.post("/api/read")
def read(text: str = Form(""), image: UploadFile | None = File(None)) -> ReadResult:
    data = None
    if image is not None:
        if image.content_type not in IMAGE_TYPES:
            raise HTTPException(415, "Use a PNG, JPEG, or WebP screenshot.")
        data = image.file.read(MAX_IMAGE_BYTES + 1)
        if len(data) > MAX_IMAGE_BYTES:
            raise HTTPException(413, "Over 5 MB. Try a smaller screenshot.")
    elif not text.strip():
        raise HTTPException(400, "Paste a quote or choose a screenshot first.")
    try:
        if data is not None:
            return quote_reader.read_quote(image=data, mime=image.content_type)
        return quote_reader.read_quote(text=text)
    except Exception:
        log.exception("Reading the quote failed")
        raise HTTPException(502, "Reading failed — check the server log.")
