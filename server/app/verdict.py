"""The kernel: typical price and the +10% / -30% rule. Pure functions, no I/O.

Prices are handled in whole cents and the median as a Fraction, so the
boundaries are exact (10% above is Reasonable, anything more is not).
"""

from fractions import Fraction
from statistics import median
from typing import Literal

from app.models import Listing, Verdict

CantVerifyReason = Literal["not_in_sample", "name_too_vague"]

RULE_TEXT = "Reasonable: −30% to +10% of typical."


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
    return "No model named" if swap_risk else "Name too vague"


# --- Card text (prd.md > Large Type and Ten Words a Screen) ---

# Words a screen may show; tests/test_card_text.py enforces it for every card.
WORD_LIMIT = 10


def count_words(text: str) -> int:
    """Space-separated runs holding a letter or digit: "$1,039" is one word, "·" none."""
    return sum(1 for token in text.split() if any(c.isalnum() for c in token))

# Part types in plain words; Motherboard, Storage, and Case are already plain.
PART_LABELS = {
    "CPU": "Processor",
    "GPU": "Graphics card",
    "RAM": "Memory",
    "PSU": "Power supply",
    "Cooler": "CPU cooler",
    "Other": "Other part",
}

# Two words fit the worst-case card: "Graphics card · $9,999.99 / Worth questioning / $9,401 above typical".
ASK_WHY = "Ask why."
ASK_WHICH = "Ask which."


def part_label(part_type: str) -> str:
    return PART_LABELS.get(part_type, part_type)


def advice(verdict: Verdict, reason: CantVerifyReason | None) -> str | None:
    """A two-word action, or None when there is nothing to do."""
    if verdict in ("worth_questioning", "unusually_low"):
        return ASK_WHY
    if reason == "name_too_vague":
        return ASK_WHICH
    return None


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
