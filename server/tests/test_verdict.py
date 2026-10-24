from fractions import Fraction

import pytest

from app.models import Listing
from app.verdict import ask_seller, headline, judge, typical_price_cents


def listings(*prices):
    return [Listing(store="Store A", price_usd=p, date="2026-10-01") for p in prices]


def test_typical_price_is_the_median():
    assert typical_price_cents(listings(110, 100, 300)) == 11000


def test_even_count_median_can_be_half_a_cent():
    assert typical_price_cents(listings(100.00, 100.01)) == Fraction(20001, 2)


@pytest.mark.parametrize("quoted, expected", [
    (110.00, "reasonable"),         # exactly +10%
    (110.01, "worth_questioning"),  # just over +10%
    (111.00, "worth_questioning"),  # +11%
    (70.00, "reasonable"),          # exactly -30%
    (69.99, "unusually_low"),       # just under -30%
    (69.00, "unusually_low"),       # -31%
    (100.00, "reasonable"),
])
def test_boundaries(quoted, expected):
    assert judge(quoted, Fraction(10000)) == expected


def test_boundary_survives_float_noise():
    # 0.1 + 0.2 style float error must not push an exact +10% over the line.
    assert judge(329.89, typical_price_cents(listings(299.90))) == "reasonable"


@pytest.mark.parametrize("quoted, expected", [
    (112, "$12 above typical"),
    (88, "$12 below typical"),
    (100.40, "Matches typical"),
    (100.50, "$1 above typical"),
])
def test_headline(quoted, expected):
    assert headline(quoted, Fraction(10000)) == expected


def test_ask_seller_for_each_verdict():
    assert ask_seller("PSU", "worth_questioning", False) == "Could you check the power supply price for me?"
    assert ask_seller("GPU", "unusually_low", False) == "Could you confirm the graphics card's model and condition?"
    assert ask_seller("Storage", "cant_verify", True) == "Could you tell me the storage's maker and model?"
    assert ask_seller("Cooler", "cant_verify", True) == "Could you tell me the CPU cooler's maker and model?"
    assert ask_seller("CPU", "reasonable", False) is None
    assert ask_seller("Cooler", "cant_verify", False) is None


def test_questions_ask_rather_than_accuse():
    # A question goes to a real seller: no "why", and no number from the sample data.
    for part in ("CPU", "GPU", "PSU", "Cooler", "Other"):
        for verdict, vague in (("worth_questioning", False), ("unusually_low", False), ("cant_verify", True)):
            question = ask_seller(part, verdict, vague)
            assert question.startswith("Could you "), question
            assert "$" not in question and "why" not in question.lower(), question
