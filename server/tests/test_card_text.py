"""Every card fits WORD_LIMIT words (prd.md > Large Type and Ten Words a Screen).

A part card is counted the way it shows: part label · quoted price, verdict phrase, headline,
and advice. The step bar, "Part N of M", and buttons don't count. The rest of each screen is
counted in the browser (README > Ten words a screen).
"""

import pytest

from app.main import check_line, prices
from app.models import PartLine
from app.verdict import RULE_TEXT, WORD_LIMIT, count_words

# Mirrors VERDICT_LABEL in web/src/components/ResultCard.tsx.
VERDICT_PHRASE = {
    "reasonable": "Reasonable",
    "worth_questioning": "Worth questioning",
    "unusually_low": "Unusually low",
    "cant_verify": "Can't verify",
}
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
    return f"{r.part_label} · {usd(r.line.price_usd)} {VERDICT_PHRASE[r.verdict]} {r.headline} {r.advice or ''}"


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
    assert count_words(text) <= WORD_LIMIT, f"{count_words(text)} words: {text}"


def test_worst_case_card_is_exactly_ten_words():
    worst = max(count_words(card_text(line)) for line in ALL_LINES)
    assert worst == WORD_LIMIT


def test_each_question_fits_its_own_card():
    questions = [r.ask_seller for r in (check_line(line, prices) for line in ALL_LINES) if r.ask_seller]
    assert questions
    assert max(count_words(q) for q in questions) <= WORD_LIMIT


def test_proof_sentences_fit():
    # The name as written, the range bar, and the listings table are data and don't count.
    assert count_words(f"{RULE_TEXT} {prices.note}") <= WORD_LIMIT


@pytest.mark.parametrize("text, words", [
    ("Graphics card · $9,999.99", 3),
    ("$9,401 above typical", 3),
    ("Reasonable: −30% to +10% of typical.", 6),
    ("We read 8 parts, $979 in total. — Look right?", 9),
])
def test_count_words(text, words):
    assert count_words(text) == words


def test_sample_graphics_card_shows_part_and_price_not_the_name():
    r = check_line(PartLine(part_type="GPU", name="MSI GeForce RTX 4060 Ventus 2X 8GB", price_usd=195), prices)
    assert (r.part_label, r.verdict, r.advice) == ("Graphics card", "unusually_low", "Ask why.")
    assert r.ask_seller == "Is the graphics card new and the exact model?"


def test_no_maker_card_asks_which_model():
    r = check_line(PartLine(part_type="Storage", name="SSD 1TB", price_usd=79), prices)
    assert (r.headline, r.advice, r.swap_risk) == ("No model named", "Ask which.", True)
    assert r.ask_seller == "Which maker and model is the storage?"


def test_reasonable_and_not_in_sample_cards_have_no_action():
    reasonable = check_line(PartLine(part_type="CPU", name="AMD Ryzen 5 7600 6-Core Processor", price_usd=199), prices)
    unknown = check_line(PartLine(part_type="Cooler", name=NOT_IN_SAMPLE, price_usd=38), prices)
    assert (reasonable.verdict, reasonable.advice) == ("reasonable", None)
    assert (unknown.headline, unknown.advice) == ("Not in our sample data", None)
