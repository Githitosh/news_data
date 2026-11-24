#!/usr/bin/env python3
"""Open index.html in a headless browser and save the MP4 files.

    pip install playwright && python -m playwright install chromium
    python run.py                     # collect public headlines and save today's video in out/
    python run.py --country JP --lang both
    python run.py --x-user name       # add public posts from that X account
    python run.py --sample            # export the sample script
    python run.py --formats x         # one format: x, youtube, or pc
"""
import argparse
import asyncio
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def relay(payload: str) -> str:
    req = json.loads(payload)
    url, headers, body = req["url"], dict(req.get("headers") or {}), req.get("body")
    if "api.x.ai" in url and not headers.get("Authorization", "").replace("Bearer", "").strip():
        headers["Authorization"] = "Bearer " + os.environ.get("XAI_API_KEY", "")
    if "api.anthropic.com" in url:
        headers.pop("anthropic-dangerous-direct-browser-access", None)
        if not headers.get("x-api-key"):
            headers["x-api-key"] = os.environ.get("ANTHROPIC_API_KEY", "")
    data = json.dumps(body).encode("utf-8")
    r = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(r, timeout=900) as res:
            text = res.read().decode("utf-8")
            return json.dumps({"status": res.status, "json": json.loads(text)})
    except urllib.error.HTTPError as e:
        return json.dumps({"status": e.code, "text": e.read().decode("utf-8", "replace")})


async def main() -> int:
    from playwright.async_api import async_playwright

    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="YYYY-MM-DD in Japan time. Defaults to today")
    ap.add_argument("--provider", choices=["grok", "claude"], default=None, help=argparse.SUPPRESS)
    ap.add_argument("--model", help=argparse.SUPPRESS)
    ap.add_argument("--out", default=str(ROOT / "out"))
    ap.add_argument("--sample", action="store_true", help="Export the sample script")
    ap.add_argument("--formats", default="x,youtube,pc", help="Formats to export, comma-separated: x, youtube, or pc")
    ap.add_argument("--country", default="", help="Country code: JP or US")
    ap.add_argument("--lang", default="", help="Language: en, ja, or both")
    ap.add_argument("--x-user", default="", help="X username. Public posts from this account are added")
    a = ap.parse_args()

    q = f"auto=1&formats={a.formats}"
    if a.sample:
        q += "&sample=1"
    if a.date:
        q += f"&date={a.date}"
    if a.model:
        q += f"&model={a.model}"
    if a.country:
        q += f"&country={a.country}"
    if a.lang:
        q += f"&lang={a.lang}"
    if a.x_user:
        q += "&x=" + a.x_user.lstrip("@")
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(channel="chrome")
        except Exception:
            browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 1600}, accept_downloads=True)
        page.on("console", lambda m: print("  [page]", m.text) if "[news-shorts]" in m.text else None)
        page.on("pageerror", lambda e: print("  [error]", e, file=sys.stderr))
        await page.expose_function("nsRelay", lambda s: asyncio.get_running_loop().run_in_executor(None, relay, s))
        downloads = []
        page.on("download", lambda d: downloads.append(d))
        await page.goto((ROOT / "index.html").as_uri() + "?" + q)
        await page.wait_for_function(
            "window.NS && (window.NS.done || window.NS.error || document.getElementById('status').classList.contains('err'))",
            timeout=30 * 60 * 1000, polling=1000)
        err = await page.evaluate(
            "window.NS.error || (document.getElementById('status').classList.contains('err') ? document.getElementById('status').textContent : '')")
        if err:
            print("Failed:", err, file=sys.stderr)
            await browser.close()
            return 1
        want = len([f for f in a.formats.split(",") if f in ("x", "youtube", "pc")])
        for _ in range(120):
            if len(downloads) >= want:
                break
            await asyncio.sleep(0.5)
        if not downloads:
            print("Failed: no video file was produced", file=sys.stderr)
            await browser.close()
            return 1
        st = await page.evaluate("window.NS.state()")
        for d in downloads:
            path = out / d.suggested_filename
            await d.save_as(path)
            print("Saved:", path)
        stem = out / downloads[0].suggested_filename.split("_NewsShorts_")[0]
        base = f"{stem}_NewsShorts_{st['script']['date']}"
        Path(base + ".json").write_text(json.dumps(st["script"], ensure_ascii=False, indent=2), encoding="utf-8")
        Path(base + ".txt").write_text(st["sources"], encoding="utf-8")
        print("Script and sources:", base + ".json / .txt")
        await browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
