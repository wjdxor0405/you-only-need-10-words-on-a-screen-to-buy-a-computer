import pytest

from app.main import prices
from app.matcher import is_vague, match
from app.models import PartLine


def line(part_type, name):
    return PartLine(part_type=part_type, name=name, price_usd=100)


@pytest.mark.parametrize("part_type, name, product_id", [
    ("GPU", "MSI GeForce RTX 4060 Ventus 2X 8GB", "gpu-rtx4060"),
    ("GPU", "rtx-4060", "gpu-rtx4060"),
    ("CPU", "AMD Ryzen 5 7600 6-Core Processor", "cpu-ryzen5-7600"),
    ("PSU", "Corsair RM650e 650W 80+ Gold", "psu-rm650e"),
    ("RAM", "Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30", "ram-vengeance-32-ddr5"),
    ("Case", "NZXT H5 Flow (Black)", "case-h5-flow"),
])
def test_alias_match(part_type, name, product_id):
    found = match(line(part_type, name), prices.products)
    assert found.kind == "matched"
    assert found.product.id == product_id


@pytest.mark.parametrize("part_type, name", [
    ("GPU", "RTX 4060 Ti 8GB"),        # a different model than the RTX 4060
    ("CPU", "AMD Ryzen 5 7600X"),
    ("Cooler", "Thermalright Peerless Assassin 120 SE"),
    ("CPU", "Intel Core i7-14700K"),
])
def test_not_in_sample(part_type, name):
    assert match(line(part_type, name), prices.products).kind == "not_found"


# The proof names the part by these words: the user's own, cut to what matched, widened to whole words.
@pytest.mark.parametrize("part_type, name, words", [
    ("CPU", "AMD Ryzen 5 7600 6-Core Processor", "Ryzen 5 7600"),
    ("Motherboard", "MSI PRO B650M-A WIFI", "PRO B650M-A"),
    ("RAM", "Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30", "Vengeance 32GB (2x16GB) DDR5-6000"),
    ("GPU", "MSI GeForce RTX 4060 Ventus 2X 8GB", "RTX 4060"),
    ("GPU", "rtx-4060", "rtx-4060"),
    ("PSU", "Corsair RM650e 650W 80+ Gold", "RM650e"),
    ("Case", "NZXT H5 Flow (Black)", "NZXT H5 Flow"),
    ("Cooler", "DeepCool AK400 Black", "AK400"),
    # The alias sits past a first, variant mention ("RTX 4060 Ti") that doesn't name the product.
    ("GPU", "RTX 4060 Ti or RTX 4060 8GB", "RTX 4060"),
])
def test_key_words(part_type, name, words):
    found = match(line(part_type, name), prices.products)
    assert (found.kind, found.key_words) == ("matched", words)


def test_unmatched_lines_have_no_key_words():
    assert match(line("Storage", "SSD 1TB"), prices.products).key_words is None
    assert match(line("Cooler", "Thermalright Peerless Assassin 120 SE"), prices.products).key_words is None


def test_part_type_must_agree():
    assert match(line("CPU", "RTX 4060"), prices.products).kind == "not_found"


@pytest.mark.parametrize("name", ["SSD 1TB", "PSU 650W 80+ Gold", "DDR5 16GB x2", "M.2 NVMe SSD 1TB", "ATX Case"])
def test_vague_names(name):
    assert is_vague(name)


@pytest.mark.parametrize("name", ["Samsung 990 EVO Plus 1TB", "Corsair RM650e", "NZXT H5 Flow"])
def test_specific_names_are_not_vague(name):
    assert not is_vague(name)


def test_vague_line_is_not_matched():
    assert match(line("Storage", "SSD 1TB"), prices.products).kind == "vague"
