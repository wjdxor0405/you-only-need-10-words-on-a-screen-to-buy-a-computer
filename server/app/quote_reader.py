"""Turns a pasted quote (or a screenshot) into part lines with one OpenAI call.

The model only reads. It never judges prices; that is verdict.py's job.
"""

import base64
import os

from openai import OpenAI

from app.models import ReadResult

INSTRUCTIONS = """You read PC parts quotes that a shop, a friend, or a build list gave to a buyer.

Return every line that is a PC part, in the order it appears:
- part_type: one of CPU, GPU, Motherboard, RAM, Storage, PSU, Case, Cooler, Other.
- name: the product name exactly as written. Do not correct, expand, or guess a model.
  Leave out the price, quantity, and labels like "CPU:" from the name.
- price_usd: the price charged for that line, as a number without "$" or commas.
  A kit such as "32GB (2x16GB)" is one line at the kit price.
  If a line buys several identical items, use the line's total price.

Skip lines that are not parts: totals, tax, shipping, assembly fees, warranties, notes.

If the input is not a PC parts quote, return no lines and problem.kind = "not_a_quote".
If it looks like a quote but you cannot read it, return no lines and problem.kind = "unreadable".
Write problem.message as one short sentence for the buyer. Otherwise problem is null."""


def _client() -> OpenAI:
    return OpenAI()  # reads OPENAI_API_KEY from the environment


def _model() -> str:
    return os.environ.get("OPENAI_MODEL", "gpt-6-luna")


def read_quote(*, text: str | None = None, image: bytes | None = None, mime: str | None = None) -> ReadResult:
    content: list[dict] = [{"type": "input_text", "text": INSTRUCTIONS + ("\n\nQuote:\n" + text if text else "")}]
    if image is not None:
        data_url = f"data:{mime};base64,{base64.b64encode(image).decode()}"
        content.append({"type": "input_image", "image_url": data_url})
    response = _client().responses.parse(
        model=_model(),
        input=[{"role": "user", "content": content}],
        text_format=ReadResult,
    )
    return response.output_parsed
