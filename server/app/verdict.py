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


def headline(quoted_usd: float, typical_cents: Fraction) -> str:
    diff_cents = to_cents(quoted_usd) - typical_cents
    dollars = int(abs(diff_cents) / 100 + Fraction(1, 2))  # round half up
    if dollars == 0:
        return "Matches typical"
    return f"${dollars} {'above' if diff_cents > 0 else 'below'} typical"
