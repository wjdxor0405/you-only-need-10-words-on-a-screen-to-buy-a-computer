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
