"""Every card fits CARD_TEXT_LIMIT characters before "Show proof" (prd.md > Large Type and Character Limit).

A part card is counted the way it shows: part label · quoted price, display name, verdict
phrase, headline, and advice. The step bar, "Part N of M", and buttons don't count.
"""

import pytest

from app.main import check_line, prices
from app.models import PartLine
from app.verdict import CARD_TEXT_LIMIT, SWAP_RISK_ADVICE

# Mirrors VERDICT_LABEL in web/src/components/ResultCard.tsx.
VERDICT_PHRASE = {
    "reasonable": "Reasonable",
    "worth_questioning": "Worth questioning",
    "unusually_low": "Unusually low",
    "cant_verify": "Can't verify",
}
# Mirrors the questions card in web/src/components/ResultsStep.tsx.
QUESTIONS_HEADING = "Questions to ask the seller"
QUESTIONS_PER_CARD = 2
# No single PC part costs more, and "$9,999.99" is as long as a card's price gets.
TOP_PRICE = 9999.99
PART_TYPES = ["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooler", "Other"]
NOT_IN_SAMPLE = "Thermalright Peerless Assassin 120 SE ARGB"
NO_MAKER = "1TB NVMe M.2 PCIe Gen4 internal SSD drive"
TWO_PRODUCTS = "RTX 4060 or RX 7600 8GB graphics card"


def usd(value: float) -> str:
    """Like usd() in ResultCard.tsx: '$1,234.5', '$95'."""
    return "$" + f"{value:,.2f}".rstrip("0").rstrip(".")


def card_text(line: PartLine) -> str:
    r = check_line(line, prices)
    return f"{r.part_label} · {usd(r.line.price_usd)}{r.display_name}{VERDICT_PHRASE[r.verdict]}{r.headline}{r.advice}"


def matched_lines():
    for product in prices.products:
        typical = sorted(listing.price_usd for listing in product.listings)[len(product.listings) // 2]
        for price in (TOP_PRICE, typical, 0.01):
            yield PartLine(part_type=product.part_type, name=product.name, price_usd=price)


def cant_verify_lines():
    for part_type in PART_TYPES:
        for name in (NOT_IN_SAMPLE, NO_MAKER):
            yield PartLine(part_type=part_type, name=name, price_usd=TOP_PRICE)
    yield PartLine(part_type="GPU", name=TWO_PRODUCTS, price_usd=TOP_PRICE)


ALL_LINES = [*matched_lines(), *cant_verify_lines()]


def test_lines_cover_every_verdict_path():
    results = [check_line(line, prices) for line in ALL_LINES]
    paths = {(r.verdict, r.cant_verify_reason, r.swap_risk) for r in results}
    assert paths == {
        ("reasonable", None, False),
        ("worth_questioning", None, False),
        ("unusually_low", None, False),
        ("cant_verify", "not_in_sample", False),
        ("cant_verify", "name_too_vague", True),   # no maker or model
        ("cant_verify", "name_too_vague", False),  # fits two products
    }


@pytest.mark.parametrize("line", ALL_LINES, ids=lambda line: f"{line.part_type}-{line.name}-{line.price_usd}")
def test_part_card_fits(line):
    text = card_text(line)
    assert len(text) <= CARD_TEXT_LIMIT, f"{len(text)} characters: {text}"


def test_questions_card_fits():
    questions = [r.ask_seller for r in (check_line(line, prices) for line in ALL_LINES) if r.ask_seller]
    longest = max(len(q) for q in questions)
    assert len(QUESTIONS_HEADING) + QUESTIONS_PER_CARD * longest <= CARD_TEXT_LIMIT


def test_sample_graphics_card_shows_specs_not_the_full_name():
    r = check_line(PartLine(part_type="GPU", name="MSI GeForce RTX 4060 Ventus 2X 8GB", price_usd=195), prices)
    assert (r.part_label, r.display_name, r.verdict) == ("Graphics card", "RTX 4060, 8GB", "unusually_low")
    assert r.advice == "Check it's the exact model and new."
    assert r.ask_seller == "Is the graphics card new and the exact model?"


def test_no_maker_card_warns_about_swaps():
    r = check_line(PartLine(part_type="Storage", name="SSD 1TB", price_usd=79), prices)
    assert (r.display_name, r.headline, r.advice) == ("SSD 1TB", "No maker or model", SWAP_RISK_ADVICE)
    assert r.ask_seller == "Which maker and model is the storage?"


def test_unmatched_name_is_cut_not_invented():
    r = check_line(PartLine(part_type="Cooler", name=NOT_IN_SAMPLE, price_usd=38), prices)
    assert r.display_name == "Thermalright Peerless…"
    assert r.headline == "Not in our sample data"


@pytest.mark.parametrize("name, shown", [
    ("Thermalright Peerless Assassin 120 SE", "Thermalright Peerless…"),
    ("Arctic Liquid Freezer III 360 A-RGB", "Arctic Liquid Freezer III…"),
    ("Cooler Master Hyper 212 Halo White", "Cooler Master Hyper 212 Halo…"),  # "Halo" ends exactly at 28
    ("X ThermalrightPeerlessAssassin120SE", "X ThermalrightPeerlessAssass…"),  # break too early: hard cut
])
def test_long_names_are_cut_at_a_word_break(name, shown):
    r = check_line(PartLine(part_type="Cooler", name=name, price_usd=38), prices)
    assert r.display_name == shown
    assert len(shown) <= 29
