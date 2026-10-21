"""The kernel: typical price and the +10% / -30% rule. Pure functions, no I/O.

Prices are handled in whole cents and the median as a Fraction, so the
boundaries are exact (10% above is Reasonable, anything more is not).
"""

from fractions import Fraction
from statistics import median

from app.models import Listing, Verdict

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


def ask_seller(part_type: str, name: str, verdict: Verdict, diff_dollars: int | None, vague: bool) -> str | None:
    """One plain question a beginner can send the seller, or None when there is nothing to ask."""
    if verdict == "worth_questioning":
        return f"Why does the {part_type} ({name}) cost ${diff_dollars} more than the typical price?"
    if verdict == "unusually_low":
        return f"Is the {part_type} ({name}) the exact model, and brand new? It's ${-diff_dollars} below the typical price."
    if vague:
        return f"Which exact maker and model is the \"{name}\" in the quote?"
    return None
