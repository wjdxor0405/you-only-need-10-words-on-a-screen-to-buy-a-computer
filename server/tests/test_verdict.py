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
    assert ask_seller("PSU", "Corsair RM650e", "worth_questioning", 20, False) == (
        "Why does the PSU (Corsair RM650e) cost $20 more than the typical price?"
    )
    assert ask_seller("GPU", "RTX 4060", "unusually_low", -104, False) == (
        "Is the GPU (RTX 4060) the exact model, and brand new? It's $104 below the typical price."
    )
    assert ask_seller("Storage", "SSD 1TB", "cant_verify", None, True) == (
        'Which exact maker and model is the "SSD 1TB" in the quote?'
    )
    assert ask_seller("CPU", "Ryzen 5 7600", "reasonable", 4, False) is None
    assert ask_seller("Cooler", "Peerless Assassin", "cant_verify", None, False) is None
