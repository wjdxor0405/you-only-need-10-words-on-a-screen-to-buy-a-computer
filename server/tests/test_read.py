from fastapi.testclient import TestClient

from app import main, quote_reader
from app.models import PartLine, ReadResult

client = TestClient(main.app)
ONE_LINE = ReadResult(lines=[PartLine(part_type="Case", name="NZXT H5 Flow", price_usd=95)], problem=None)


def fake_reader(calls):
    def read_quote(*, text=None, image=None, mime=None):
        calls.append({"text": text, "image": image, "mime": mime})
        return ONE_LINE
    return read_quote


def test_image_is_sent_to_the_reader(monkeypatch):
    calls = []
    monkeypatch.setattr(quote_reader, "read_quote", fake_reader(calls))
    response = client.post("/api/read", files={"image": ("quote.png", b"png-bytes", "image/png")})
    assert response.status_code == 200
    assert response.json()["lines"][0]["name"] == "NZXT H5 Flow"
    assert calls == [{"text": None, "image": b"png-bytes", "mime": "image/png"}]


def test_text_is_sent_to_the_reader(monkeypatch):
    calls = []
    monkeypatch.setattr(quote_reader, "read_quote", fake_reader(calls))
    response = client.post("/api/read", data={"text": "Case: NZXT H5 Flow $95"})
    assert response.status_code == 200
    assert calls[0]["text"] == "Case: NZXT H5 Flow $95"


def test_gif_is_rejected_with_a_plain_message():
    response = client.post("/api/read", files={"image": ("quote.gif", b"GIF89a", "image/gif")})
    assert response.status_code == 415
    assert response.json()["detail"] == "Use a PNG, JPEG, or WebP screenshot."


def test_image_over_5_mb_is_rejected():
    big = b"0" * (main.MAX_IMAGE_BYTES + 1)
    response = client.post("/api/read", files={"image": ("quote.png", big, "image/png")})
    assert response.status_code == 413
    assert "Over 5 MB" in response.json()["detail"]


def test_empty_request_asks_for_input():
    response = client.post("/api/read", data={"text": "  "})
    assert response.status_code == 400


def test_reader_failure_returns_a_displayable_error(monkeypatch):
    def broken(**_):
        raise RuntimeError("model not found")
    monkeypatch.setattr(quote_reader, "read_quote", broken)
    response = client.post("/api/read", data={"text": "CPU $199"})
    assert response.status_code == 502
    assert response.json()["detail"] == "Reading failed — check the server log."
