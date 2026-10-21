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
    verdict: Verdict
    headline: str
    cant_verify_reason: Literal["not_in_sample", "name_too_vague"] | None
    typical_price_usd: float | None
    listings: list[Listing]
    swap_risk: bool


class CheckRequest(BaseModel):
    lines: list[PartLine]


class CheckResult(BaseModel):
    results: list[LineResult]
    rule_text: str
    sample_data_note: str
    total_usd: float
