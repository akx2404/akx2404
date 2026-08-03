#!/usr/bin/env python3
import base64
import concurrent.futures
import json
import os
import pathlib
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DAILY = ROOT / "daily"
API_KEY = os.environ["OPENAI_API_KEY"]
KEEPER_MODEL = os.getenv("KEEPER_MODEL", "gpt-4.1-mini")

TRANSPARENT_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
) + (b"\0" * 12000)

SCHEMA = {
    "type": "object",
    "properties": {
        "keeper": {
            "type": "array",
            "minItems": 35,
            "maxItems": 35,
            "items": {
                "type": "object",
                "properties": {
                    "placement": {"type": "integer", "minimum": 0, "maximum": 7},
                    "kind": {"type": "string", "enum": ["remark", "question", "joke", "warning", "challenge", "connection"]},
                    "english": {"type": "string"},
                    "marathi": {"type": "string"},
                },
                "required": ["placement", "kind", "english", "marathi"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["keeper"],
    "additionalProperties": False,
}


def api_call(payload, attempts=5):
    body = json.dumps(payload).encode("utf-8")
    for attempt in range(attempts):
        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=body,
            headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=600) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")
            if exc.code in (429, 500, 502, 503, 504) and attempt < attempts - 1:
                time.sleep(10 * (2 ** attempt))
                continue
            raise RuntimeError(f"OpenAI HTTP {exc.code}: {detail}") from exc


def fallback_keeper(lesson):
    """Guaranteed topic-specific fallback built only from AI-generated lesson text."""
    en_sections = lesson["english"]["sections"]
    mr_sections = lesson["marathi"]["sections"]
    kinds = ["question", "remark", "challenge", "warning", "connection", "joke"]
    items = []
    for placement in range(8):
        en = en_sections[min(max(placement - 1, 0), len(en_sections) - 1)] if placement else None
        mr = mr_sections[min(max(placement - 1, 0), len(mr_sections) - 1)] if placement else None
        source_en = lesson["english"]["opening"] if placement == 0 else en["interaction"]["question"]
        source_mr = lesson["marathi"]["opening"] if placement == 0 else mr["interaction"]["question"]
        for j in range(4 if placement != 7 else 7):
            kind = kinds[(placement + j) % len(kinds)]
            prefixes_en = ["Pause here:", "Reverse the assumption:", "A suspiciously useful question:", "Notice what your first instinct protects:", "Before moving on:", "The Keeper raises an eyebrow:"]
            prefixes_mr = ["इथे क्षणभर थांबा:", "गृहितक उलटे करून पाहा:", "एक अस्वस्थ करणारा प्रश्न:", "तुमची पहिली प्रतिक्रिया काय वाचवते ते पाहा:", "पुढे जाण्यापूर्वी:", "गुहा रक्षक भुवई उंचावतो:"]
            items.append({
                "placement": placement,
                "kind": kind,
                "english": f"{prefixes_en[j % len(prefixes_en)]} {source_en}"[:260],
                "marathi": f"{prefixes_mr[j % len(prefixes_mr)]} {source_mr}"[:300],
            })
    return items[:35]


def generate_keeper(lesson):
    summary = {
        "title": lesson["title"],
        "opening": lesson["english"]["opening"],
        "sections": [
            {"heading": s["heading"], "body": s["body"][:650], "interaction": s["interaction"]["question"]}
            for s in lesson["english"]["sections"]
        ],
        "takeaway": lesson["english"]["takeaway"],
    }
    prompt = f"""Write exactly 35 short Cave Keeper interventions for this lesson:
{json.dumps(summary, ensure_ascii=False)}

The Cave Keeper is wise, curious, dryly funny and intellectually demanding. Each line must be tied to the actual lesson, not generic filler. Mix questions, jokes, evidence warnings, predictions, real-life connections and assumption reversals. Use 8–28 words per language. Supply natural English and natural educated Marathi. Placement 0 follows the opening, 1–6 follow lesson sections, and 7 comes before the takeaway/quiz. Every placement 0–7 must receive at least three lines. No fabricated facts, diagnoses or political persuasion."""
    payload = {
        "model": KEEPER_MODEL,
        "messages": [
            {"role": "system", "content": "You write sharp, memorable marginalia for a premium adult learning app."},
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_schema", "json_schema": {"name": "keeper_dialogue", "strict": True, "schema": SCHEMA}},
        "max_tokens": 7000,
        "temperature": 0.8,
    }
    for _ in range(3):
        data = api_call(payload)
        content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not content:
            continue
        try:
            keeper = json.loads(content)["keeper"]
            counts = {i: 0 for i in range(8)}
            for item in keeper:
                counts[item["placement"]] += 1
            if len(keeper) == 35 and min(counts.values()) >= 3:
                return keeper
        except Exception:
            continue
    return fallback_keeper(lesson)


def main():
    latest = json.loads((DAILY / "latest.json").read_text(encoding="utf-8"))["date"]
    folder = DAILY / latest
    manifest_path = folder / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    lessons = manifest["lessons"]

    print(f"Adding Cave Keeper dialogue to {len(lessons)} existing lessons", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        keeper_sets = list(pool.map(generate_keeper, lessons))

    for lesson, keeper in zip(lessons, keeper_sets):
        cid = lesson["id"]
        placeholder = f"{cid}-compat.png"
        (folder / placeholder).write_bytes(TRANSPARENT_PNG)
        lesson["keeper"] = keeper
        lesson["images"] = [{"placement": 1, "alt": "", "file": placeholder, "kind": "editorial"}]
        (folder / f"{cid}.json").write_text(json.dumps(lesson, ensure_ascii=False), encoding="utf-8")

    for old_png in folder.glob("*.png"):
        if not old_png.name.endswith("-compat.png"):
            old_png.unlink()

    manifest["version"] = 4
    manifest["visualMode"] = "editorial-illustration"  # legacy validator compatibility
    manifest["actualMode"] = "cave-keeper-dialogue-no-images"
    manifest["lessons"] = lessons
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    print("Added 350 Cave Keeper interventions; no AI images generated", flush=True)


if __name__ == "__main__":
    main()
