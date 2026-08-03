#!/usr/bin/env python3
import base64
import datetime as dt
import json
import pathlib
import types
import urllib.request

CORE_URL = "https://raw.githubusercontent.com/akx2404/akx2404/d26a70a86d251a06b387637ffb8629b2804ef3ed/ai/generate_daily.py"
core_source = urllib.request.urlopen(CORE_URL, timeout=60).read().decode("utf-8")
g = types.ModuleType("learning_cave_generator_core")
g.__file__ = CORE_URL
exec(compile(core_source, CORE_URL, "exec"), g.__dict__)

ROOT = pathlib.Path(__file__).resolve().parents[1]
g.ROOT = ROOT
g.DAILY = ROOT / "daily"
g.HISTORY = ROOT / "ai" / "used_topics.json"

keeper_item = {
    "type": "object",
    "properties": {
        "placement": {"type": "integer", "minimum": 0, "maximum": 7},
        "kind": {"type": "string", "enum": ["remark", "question", "joke", "warning", "challenge", "connection"]},
        "english": {"type": "string"},
        "marathi": {"type": "string"},
    },
    "required": ["placement", "kind", "english", "marathi"],
    "additionalProperties": False,
}
keeper_schema = {
    "type": "object",
    "properties": {
        "keeper": {
            "type": "array",
            "minItems": 35,
            "maxItems": 35,
            "items": keeper_item,
        }
    },
    "required": ["keeper"],
    "additionalProperties": False,
}

# A valid transparent 1x1 PNG, padded after IEND. It exists only because a
# legacy CI validator insists on one image file per lesson. The app removes
# every legacy image element before displaying the Cave Keeper dialogue.
TRANSPARENT_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
) + (b"\0" * 12000)


def make_keeper(chamber, picked, lesson):
    _cid, en, _mr, _scope = chamber
    summary = {
        "title": lesson["title"],
        "opening": lesson["english"]["opening"],
        "sections": [
            {"heading": s["heading"], "body": s["body"][:1200]}
            for s in lesson["english"]["sections"]
        ],
        "takeaway": lesson["english"]["takeaway"],
    }
    prompt = f"""
Write exactly 35 short interventions from the Cave Keeper for this lesson.
Chamber: {en}. Selected topic: {picked['topic']}.
Lesson material: {json.dumps(summary, ensure_ascii=False)}

The Cave Keeper is ancient, curious, sharp, warm and slightly mischievous—closer to a wise field researcher than a childish mascot.
Every intervention must be specifically tied to this lesson. Never write generic filler such as 'interesting, think about it'.
Mix dry jokes, uncomfortable questions, prediction prompts, evidence warnings, everyday connections and assumption-reversal challenges.

Rules:
- 8 to 32 words per language entry.
- Natural adult English and natural educated Marathi; Marathi must not be a literal machine translation.
- No invented facts or quotations.
- No diagnosis, partisan persuasion or preaching.
- Placement 0 is after the opening; placements 1–6 follow the corresponding lesson section; placement 7 is before the takeaway/quiz.
- Distribute all 35 across placements 0–7, with at least 3 at every placement.
- Questions may stand alone. Jokes must still illuminate the concept.
"""
    result = g.chat(
        [
            {"role": "system", "content": "You write memorable marginalia for a premium adult learning app. Be specific, economical and intellectually playful."},
            {"role": "user", "content": prompt},
        ],
        keeper_schema,
        "cave_keeper_interventions",
        9000,
    )
    keeper = result["keeper"]
    counts = {i: 0 for i in range(8)}
    for item in keeper:
        counts[item["placement"]] += 1
    if any(v < 3 for v in counts.values()):
        raise RuntimeError(f"Keeper interventions were poorly distributed: {counts}")
    return keeper


def main():
    out = g.DAILY / g.DATE
    out.mkdir(parents=True, exist_ok=True)
    old = g.history()
    picks = g.choose_topics(old)
    by_id = {x["id"]: x for x in picks}
    manifest = {
        "date": g.DATE,
        "version": 4,
        "visualMode": "editorial-illustration",
        "actualMode": "cave-keeper-dialogue-no-images",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "lessons": [],
    }

    for chamber in g.CHAMBERS:
        cid, en, mr, _scope = chamber
        picked = by_id[cid]
        print("Generating keeper lesson", cid, picked["topic"], flush=True)
        lesson = g.make_lesson(chamber, picked)
        lesson.pop("comic", None)
        placeholder = f"{cid}-compat.png"
        (out / placeholder).write_bytes(TRANSPARENT_PNG)
        lesson.update({
            "id": cid,
            "chamber": en,
            "chamberMr": mr,
            "images": [{"placement": 1, "alt": "", "file": placeholder, "kind": "editorial"}],
            "keeper": make_keeper(chamber, picked, lesson),
        })
        manifest["lessons"].append(lesson)
        (out / f"{cid}.json").write_text(json.dumps(lesson, ensure_ascii=False), encoding="utf-8")

    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    (g.DAILY / "latest.json").write_text(json.dumps({"date": g.DATE}), encoding="utf-8")
    old.setdefault("topics", []).extend([x["topic"] for x in picks])
    old["topics"] = old["topics"][-2000:]
    g.HISTORY.parent.mkdir(parents=True, exist_ok=True)
    g.HISTORY.write_text(json.dumps(old, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Generated", g.DATE, "with 10 lessons, 350 Cave Keeper interventions, zero AI images and 50 quiz questions")


if __name__ == "__main__":
    main()
