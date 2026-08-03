#!/usr/bin/env python3
import base64
import datetime as dt
import json
import pathlib
import re
import types
import unicodedata
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
    "properties": {"keeper": {"type": "array", "minItems": 35, "maxItems": 35, "items": keeper_item}},
    "required": ["keeper"],
    "additionalProperties": False,
}

TRANSPARENT_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
) + (b"\0" * 12000)


def normalize_topic(value):
    value = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode("ascii")
    value = value.lower().replace("&", " and ")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    stop = {"the", "a", "an", "of", "and", "or", "in", "on", "to", "from", "how", "why", "when", "with", "versus", "vs"}
    return " ".join(x for x in value.split() if x not in stop)


def history_from_all_packs(old):
    """Rebuild permanent history from every published manifest.

    This makes the repository itself the source of truth. Even if the compact
    history file is accidentally truncated, previously published lessons are
    recovered before the next topic-selection call.
    """
    topics = list(old.get("topics", []))
    records = list(old.get("records", []))
    seen = {normalize_topic(x) for x in topics if x}
    seen_records = {(r.get("date"), r.get("chamber"), normalize_topic(r.get("topic"))) for r in records}

    for manifest_path in sorted(g.DAILY.glob("*/manifest.json")):
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            date = manifest.get("date") or manifest_path.parent.name
            for lesson in manifest.get("lessons", []):
                topic = lesson.get("title") or lesson.get("topic")
                chamber = lesson.get("id") or lesson.get("chamber")
                key = normalize_topic(topic)
                if topic and key and key not in seen:
                    topics.append(topic)
                    seen.add(key)
                record_key = (date, chamber, key)
                if topic and key and record_key not in seen_records:
                    records.append({"date": date, "chamber": chamber, "topic": topic, "fingerprint": key})
                    seen_records.add(record_key)
        except Exception as exc:
            print("Skipping unreadable historical manifest", manifest_path, exc, flush=True)

    old["topics"] = topics[-10000:]
    old["records"] = records[-10000:]
    old["fingerprints"] = sorted({normalize_topic(x) for x in old["topics"] if normalize_topic(x)})[-10000:]
    return old


def near_duplicate(topic, fingerprints):
    candidate = set(normalize_topic(topic).split())
    if not candidate:
        return True
    for fp in fingerprints:
        previous = set(fp.split())
        if not previous:
            continue
        overlap = len(candidate & previous) / max(1, len(candidate | previous))
        containment = len(candidate & previous) / max(1, min(len(candidate), len(previous)))
        if overlap >= 0.72 or containment >= 0.86:
            return True
    return False


def choose_fresh_topics(old):
    """Ask the core selector, then reject semantic near-duplicates.

    Rejected suggestions are added to the exclusion list and the selector is
    called again. This handles cosmetic title changes such as 'Halo effect in
    hiring' versus 'The halo effect and recruitment decisions'.
    """
    fingerprints = set(old.get("fingerprints", []))
    accepted = {}
    attempts = 0
    while len(accepted) < len(g.CHAMBERS) and attempts < 8:
        attempts += 1
        picks = g.choose_topics(old)
        for pick in picks:
            cid = pick["id"]
            topic = pick["topic"]
            if cid in accepted:
                continue
            if near_duplicate(topic, fingerprints):
                old.setdefault("topics", []).append(topic)
                fingerprints.add(normalize_topic(topic))
                continue
            accepted[cid] = pick
            fingerprints.add(normalize_topic(topic))
        old["topics"] = old.get("topics", [])[-10000:]
        old["fingerprints"] = list(fingerprints)[-10000:]

    missing = [c[0] for c in g.CHAMBERS if c[0] not in accepted]
    if missing:
        raise RuntimeError(f"Could not find sufficiently fresh topics for: {missing}")
    return [accepted[c[0]] for c in g.CHAMBERS]


def make_keeper(chamber, picked, lesson):
    _cid, en, _mr, _scope = chamber
    summary = {
        "title": lesson["title"],
        "opening": lesson["english"]["opening"],
        "sections": [{"heading": s["heading"], "body": s["body"][:1200]} for s in lesson["english"]["sections"]],
        "takeaway": lesson["english"]["takeaway"],
    }
    prompt = f"""
Write exactly 35 short interventions from the Cave Keeper for this lesson.
Chamber: {en}. Selected topic: {picked['topic']}.
Lesson material: {json.dumps(summary, ensure_ascii=False)}

The Cave Keeper is ancient, curious, sharp, warm and slightly mischievous—closer to a wise field researcher than a childish mascot.
Every intervention must be specifically tied to this lesson. Never write generic filler.
Mix dry jokes, uncomfortable questions, prediction prompts, evidence warnings, everyday connections and assumption-reversal challenges.

Rules:
- 8 to 32 words per language entry.
- Natural adult English and natural educated Marathi.
- No invented facts or quotations.
- No diagnosis, partisan persuasion or preaching.
- Placement 0 follows the opening; placements 1–6 follow sections; placement 7 precedes takeaway/quiz.
- Distribute all 35 across placements 0–7, with at least 3 at every placement.
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
    old = history_from_all_packs(g.history())
    picks = choose_fresh_topics(old)
    by_id = {x["id"]: x for x in picks}
    manifest = {
        "date": g.DATE,
        "version": 5,
        "visualMode": "native-cave-keeper",
        "actualMode": "native-reader-permanent-history",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "lessons": [],
    }

    for chamber in g.CHAMBERS:
        cid, en, mr, _scope = chamber
        picked = by_id[cid]
        print("Generating fresh lesson", cid, picked["topic"], flush=True)
        lesson = g.make_lesson(chamber, picked)
        lesson.pop("comic", None)
        placeholder = f"{cid}-compat.png"
        (out / placeholder).write_bytes(TRANSPARENT_PNG)
        lesson.update({
            "id": cid,
            "chamber": en,
            "chamberMr": mr,
            "topicSeed": picked["topic"],
            "images": [{"placement": 1, "alt": "", "file": placeholder, "kind": "editorial"}],
            "keeper": make_keeper(chamber, picked, lesson),
        })
        manifest["lessons"].append(lesson)
        (out / f"{cid}.json").write_text(json.dumps(lesson, ensure_ascii=False), encoding="utf-8")

    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    (g.DAILY / "latest.json").write_text(json.dumps({"date": g.DATE}), encoding="utf-8")

    for pick in picks:
        topic = pick["topic"]
        old.setdefault("topics", []).append(topic)
        old.setdefault("records", []).append({
            "date": g.DATE,
            "chamber": pick["id"],
            "topic": topic,
            "fingerprint": normalize_topic(topic),
        })
    old["topics"] = old["topics"][-10000:]
    old["records"] = old["records"][-10000:]
    old["fingerprints"] = sorted({normalize_topic(x) for x in old["topics"] if normalize_topic(x)})[-10000:]
    g.HISTORY.parent.mkdir(parents=True, exist_ok=True)
    g.HISTORY.write_text(json.dumps(old, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Generated", g.DATE, "with permanent history, semantic duplicate rejection, 10 lessons and zero AI images")


if __name__ == "__main__":
    main()
