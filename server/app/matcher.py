"""Finds the sample product a quote line names, or says why it can't."""

import re
from dataclasses import dataclass
from typing import Literal

from app.models import PartLine, Product

# Words that describe a kind of part rather than a specific maker or model.
GENERIC_WORDS = {
    "ssd", "nvme", "hdd", "sata", "m2", "pcie", "gen3", "gen4", "gen5", "solid", "state", "drive",
    "psu", "power", "supply", "modular", "fully", "semi",
    "80", "plus", "bronze", "silver", "gold", "platinum", "titanium",
    "ram", "memory", "ddr4", "ddr5", "dimm", "kit",
    "case", "tower", "mid", "full", "mini", "micro", "atx", "matx", "itx",
    "cooler", "cpu", "air", "liquid", "aio", "fan", "fans",
    "gpu", "graphics", "card", "video",
    "motherboard", "mainboard", "board", "processor",
    "black", "white", "rgb", "argb", "desktop", "pc", "internal", "new",
}
# Sizes, counts, and ratings: 1tb, 650w, 16gb, 2x16gb, x2, 6000mhz, 360mm.
SIZE_PATTERN = re.compile(r"^((\d+x)?\d+(tb|gb|mb|w|mhz|mm)|x\d+)$")


def compact(text: str) -> str:
    """Lowercase and drop spaces, hyphens, and punctuation: 'RTX-4060 Ti' -> 'rtx4060ti'."""
    return re.sub(r"[^a-z0-9]", "", text.lower())


def is_vague(name: str) -> bool:
    """True when nothing that looks like a maker or model is left after removing generic words."""
    tokens = re.findall(r"[a-z0-9]+", name.lower().replace("m.2", "m2"))
    specific = [
        t for t in tokens
        if t not in GENERIC_WORDS and not SIZE_PATTERN.match(t) and not t.isdigit() and len(t) > 1
    ]
    return not specific


# Model-variant suffixes: "rtx4060ti" is not "rtx4060", "ryzen57600x" is not "ryzen57600".
# Other trailing words are fine: "rtx4060ventus2x8gb" still names an RTX 4060.
VARIANT_SUFFIX = re.compile(r"^(ti|super|xtx|xt|x3d|gre|ks|kf|k|f|x)(?![a-z])")


def _names_product(compact_name: str, alias: str) -> bool:
    start = compact_name.find(alias)
    while start != -1:
        if not VARIANT_SUFFIX.match(compact_name[start + len(alias):]):
            return True
        start = compact_name.find(alias, start + 1)
    return False


@dataclass
class Match:
    kind: Literal["matched", "vague", "not_found"]
    product: Product | None = None


def match(line: PartLine, products: list[Product]) -> Match:
    if is_vague(line.name):
        return Match("vague")
    name = compact(line.name)
    found = [
        p for p in products
        if p.part_type == line.part_type and any(_names_product(name, a) for a in p.aliases)
    ]
    if len(found) == 1:
        return Match("matched", found[0])
    if len(found) > 1:
        return Match("vague")
    return Match("not_found")
