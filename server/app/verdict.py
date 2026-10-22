"""The kernel: typical price and the +10% / -30% rule. Pure functions, no I/O.

Prices are handled in whole cents and the median as a Fraction, so the
boundaries are exact (10% above is Reasonable, anything more is not).
"""

from fractions import Fraction
from statistics import median
from typing import Literal

from app.models import Listing, Verdict

CantVerifyReason = Literal["not_in_sample", "name_too_vague"]

RULE_TEXT = (
    "We call a price reasonable from 30% below to 10% above the typical price "
    "(the middle of the listings we have)."
)


def to_cents(price_usd: float) -> int:
    return round(price_usd * 100)


def typical_price_cents(listings: list[Listing]) -> Fraction:
    # An even number of listings can give a half cent, so keep it as a Fraction.
    return median(Fraction(to_cents(listing.price_usd)) for listing in listings)


def judge(quoted_usd: float, typical_cents: Fraction) -> Verdict:
    quoted_cents = to_cents(quoted_usd)
    if quoted_cents * 100 > typical_cents * 110:
        return "worth_questioning"
    if quoted_cents * 100 < typical_cents * 70:
        return "unusually_low"
    return "reasonable"


def difference_dollars(quoted_usd: float, typical_cents: Fraction) -> int:
    """Whole dollars between quoted and typical, rounded half up; negative when below."""
    diff_cents = to_cents(quoted_usd) - typical_cents
    dollars = int(abs(diff_cents) / 100 + Fraction(1, 2))
    return dollars if diff_cents >= 0 else -dollars


def headline(quoted_usd: float, typical_cents: Fraction) -> str:
    diff = difference_dollars(quoted_usd, typical_cents)
    dollars = abs(diff)
    if dollars == 0:
        return "Matches typical"
    return f"${dollars} {'above' if diff > 0 else 'below'} typical"


def cant_verify_headline(reason: CantVerifyReason, swap_risk: bool) -> str:
    if reason == "not_in_sample":
        return "Not in our sample data"
    # Too vague: either no maker or model at all, or a name that fits several products.
    return "No maker or model" if swap_risk else "Name too vague to match"


# --- Card text (prd.md > Large Type and Character Limit) ---

# Characters a part card shows before "Show proof"; tests/test_card_text.py enforces it.
CARD_TEXT_LIMIT = 120
NAME_CUT = 28

# Part types in plain words; Motherboard, Storage, and Case are already plain.
PART_LABELS = {
    "CPU": "Processor",
    "GPU": "Graphics card",
    "RAM": "Memory",
    "PSU": "Power supply",
    "Cooler": "CPU cooler",
    "Other": "Other part",
}

ADVICE = {
    "reasonable": "Close to what stores charge.",
    "worth_questioning": "Ask the seller why it costs more.",
    "unusually_low": "Check it's the exact model and new.",
}
SWAP_RISK_ADVICE = "A cheaper part could be swapped in."


def part_label(part_type: str) -> str:
    return PART_LABELS.get(part_type, part_type)


def display_name(name: str, spec_label: str | None) -> str:
    """The matched product's spec label; otherwise the name as read, cut so it fits a card."""
    if spec_label is not None:
        return spec_label
    if len(name) <= NAME_CUT:
        return name
    # Cut at a word break when that keeps at least half; one extra character lets a word
    # that ends exactly at the limit survive.
    head = name[: NAME_CUT + 1].rpartition(" ")[0]
    return (head if len(head) >= NAME_CUT // 2 else name[:NAME_CUT]).rstrip() + "…"


def advice(verdict: Verdict, reason: CantVerifyReason | None, swap_risk: bool) -> str:
    if swap_risk:
        return SWAP_RISK_ADVICE
    if verdict != "cant_verify":
        return ADVICE[verdict]
    if reason == "not_in_sample":
        return "We have no prices for this part."
    return "It could be several products."


def _in_sentence(part_type: str) -> str:
    """'Power supply' -> 'power supply'; 'CPU cooler' keeps its capitals."""
    label = part_label(part_type)
    return label if label[1:2].isupper() else label[0].lower() + label[1:]


def ask_seller(part_type: str, verdict: Verdict, diff_dollars: int | None, vague: bool) -> str | None:
    """One short question a beginner can send the seller, or None when there is nothing to ask."""
    part = _in_sentence(part_type)
    if verdict == "worth_questioning":
        return f"Why is the {part} ${diff_dollars:,} above typical?"
    if verdict == "unusually_low":
        return f"Is the {part} new and the exact model?"
    if vague:
        return f"Which maker and model is the {part}?"
    return None
