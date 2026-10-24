"""Shapes shared by the API. Mirrored in web/src/types.ts."""

from typing import Literal

from pydantic import BaseModel

PartType = Literal["CPU", "GPU", "Motherboard", "RAM", "Storage", "PSU", "Case", "Cooler", "Other"]
Verdict = Literal["reasonable", "worth_questioning", "unusually_low", "cant_verify"]


class PartLine(BaseModel):
    part_type: PartType
    name: str
    price_usd: float


class ReadProblem(BaseModel):
    kind: Literal["unreadable", "not_a_quote"]
    message: str


class ReadResult(BaseModel):
    lines: list[PartLine]
    problem: ReadProblem | None


class Listing(BaseModel):
    store: str
    price_usd: float
    date: str


class Product(BaseModel):
    id: str
    part_type: PartType
    name: str
    aliases: list[str]
    listings: list[Listing]


class PriceData(BaseModel):
    note: str
    products: list[Product]


class LineResult(BaseModel):
    line: PartLine
    key_words: str | None  # the words of the name that matched, as written: "RTX 4060"
    verdict: Verdict
    headline: str
    cant_verify_reason: Literal["not_in_sample", "name_too_vague"] | None
    typical_price_usd: float | None
    listings: list[Listing]
    swap_risk: bool
    ask_seller: str | None
    part_label: str  # plain part name: "Graphics card"
    advice: str | None  # two-word action for the card: "Ask why."


class CheckRequest(BaseModel):
    lines: list[PartLine]


class CheckResult(BaseModel):
    results: list[LineResult]
    rule_text: str
    sample_data_note: str
