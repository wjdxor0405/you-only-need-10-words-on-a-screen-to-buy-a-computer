"""One real call to confirm the configured model reads a quote into structured part lines.

    uv run python scripts/probe_model.py
"""

import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.quote_reader import _model, read_quote  # noqa: E402

SAMPLE = """Your custom build quote
CPU: AMD Ryzen 5 7600 6-Core Processor ........ $199.00
RAM: Corsair Vengeance 32GB (2x16GB) DDR5-6000 CL30 ........ $105.00
SSD 1TB ........ $79.00
Assembly fee ........ $50.00
Total ........ $433.00"""

start = time.time()
result = read_quote(text=SAMPLE)
print(f"model={_model()} seconds={time.time() - start:.1f}")
print(result.model_dump_json(indent=2))
