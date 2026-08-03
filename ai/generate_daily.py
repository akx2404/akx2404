#!/usr/bin/env python3
import base64, datetime as dt, json, os, pathlib, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DAILY = ROOT / "daily"
HISTORY = ROOT / "ai" / "used_topics.json"
API_KEY = os.environ["OPENAI_API_KEY"]
TEXT_MODEL = os.getenv("TEXT_MODEL", "gpt-5-mini")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gpt-image-1-mini")
DATE = os.getenv("LESSON_DATE") or dt.datetime.now(dt.timezone(dt.timedelta(hours=5, minutes=30))).date().isoformat()

CHAMBERS = [
    ("psychology", "Psychology", "मानसशास्त्र", "individual perception, emotion, memory, judgment and behaviour"),
    ("sociology", "Sociology", "समाजशास्त्र", "how groups, norms, class, institutions and networks shape behaviour"),
    ("game-theory", "Game Theory", "खेळ सिद्धांत", "strategy, cooperation, conflict, signalling and coordination"),
    ("history-mysteries", "History Mysteries", "इतिहासातील रहस्ये", "unresolved events, strange artefacts and competing explanations"),
    ("political-nature", "Power & Political Nature", "सत्ता आणि राजकीय स्वभाव", "power, legitimacy, propaganda, crowds and institutions"),
    ("mind-glitches", "Mind Glitches", "मनातील भ्रम", "perception, memory and attention failures"),
    ("psychoanalysis", "Psychoanalysis", "मनोविश्लेषण", "the unconscious, defence, desire, projection and symbolism"),
    ("philosophy", "Philosophy", "तत्त्वज्ञान", "identity, ethics, knowledge, freedom and meaning"),
    ("culture", "Art, Literature & Cultural Change", "कला, साहित्य आणि सांस्कृतिक बदल", "how books and art reshape society and imagination"),
    ("mythology", "World Mythology", "जागतिक पुराणकथा", "comparative myths, symbols, ritual, fear and values"),
]

STYLE = "Premium nonfiction graphic-novel illustration, hand-inked outlines, textured paper, cinematic lighting, expressive adult characters, historically respectful, intelligent rather than childish, one coherent horizontal three-panel comic, no logos, no grotesque faces, no long text."

def request_json(url, payload, timeout=600, attempts=4):
    body = json.dumps(payload).encode()
    for attempt in range(attempts):
        req = urllib.request.Request(url, data=body, headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "replace")
            if exc.code in (429, 500, 502, 503, 504) and attempt < attempts - 1:
                wait = 15 * (2 ** attempt)
                print(f"API retry {attempt + 1}/{attempts - 1} after HTTP {exc.code}: {wait}s", flush=True)
                time.sleep(wait)
                continue
            raise RuntimeError(f"OpenAI HTTP {exc.code}: {detail}") from exc

def chat(messages, schema, name, max_tokens):
    payload = {
        "model": TEXT_MODEL,
        "messages": messages,
        "response_format": {"type":"json_schema","json_schema":{"name":name,"strict":True,"schema":schema}},
        "max_completion_tokens": max_tokens,
    }
    data = request_json("https://api.openai.com/v1/chat/completions", payload)
    return json.loads(data["choices"][0]["message"]["content"])

def image(prompt, path):
    payload = {"model": IMAGE_MODEL, "prompt": STYLE + "\n" + prompt, "size":"1024x1024", "quality":"low", "output_format":"png", "n":1}
    data = request_json("https://api.openai.com/v1/images/generations", payload)
    path.write_bytes(base64.b64decode(data["data"][0]["b64_json"]))

def history():
    try:
        return json.loads(HISTORY.read_text(encoding="utf-8"))
    except Exception:
        return {"topics": []}

def choose_topics(old):
    recent = old.get("topics", [])[-800:]
    schema = {"type":"object","properties":{"topics":{"type":"array","minItems":10,"maxItems":10,"items":{"type":"object","properties":{"id":{"type":"string"},"topic":{"type":"string"},"hook":{"type":"string"}},"required":["id","topic","hook"],"additionalProperties":False}}},"required":["topics"],"additionalProperties":False}
    chamber_text = "\n".join(f"- {i}: {en} — {scope}" for i,en,_,scope in CHAMBERS)
    prompt = f"""Select exactly one fascinating, researchable topic for each chamber for {DATE}.
{chamber_text}
Never repeat or lightly rename any previously used topic: {json.dumps(recent, ensure_ascii=False)}
Return each chamber ID exactly once. Mix famous and obscure material. Prefer ideas that reveal how the human mind changes society, history, culture or power."""
    result = chat([
        {"role":"system","content":"You are the senior editor of a premium daily illustrated learning app. Avoid repetition aggressively."},
        {"role":"user","content":prompt}
    ], schema, "daily_topics", 2500)
    topics = result["topics"]
    if {x["id"] for x in topics} != {x[0] for x in CHAMBERS}:
        raise RuntimeError("Topic selector did not return all ten chamber IDs exactly once")
    return topics

interaction_schema = {"type":"object","properties":{"question":{"type":"string"},"options":{"type":"array","minItems":2,"maxItems":3,"items":{"type":"string"}},"reveal":{"type":"string"}},"required":["question","options","reveal"],"additionalProperties":False}
section_schema = {"type":"object","properties":{"heading":{"type":"string"},"body":{"type":"string"},"interaction":interaction_schema},"required":["heading","body","interaction"],"additionalProperties":False}
quiz_schema = {"type":"object","properties":{"question":{"type":"string"},"scenario":{"type":"string"},"options":{"type":"array","minItems":4,"maxItems":4,"items":{"type":"string"}},"answerIndex":{"type":"integer","minimum":0,"maximum":3},"explanation":{"type":"string"}},"required":["question","scenario","options","answerIndex","explanation"],"additionalProperties":False}
lang_schema = {"type":"object","properties":{"opening":{"type":"string"},"sections":{"type":"array","minItems":6,"maxItems":7,"items":section_schema},"takeaway":{"type":"string"},"quiz":{"type":"array","minItems":5,"maxItems":5,"items":quiz_schema}},"required":["opening","sections","takeaway","quiz"],"additionalProperties":False}
lesson_schema = {"type":"object","properties":{
    "title":{"type":"string"},"subtitle":{"type":"string"},"readingMinutes":{"type":"integer","minimum":14,"maximum":18},
    "english":lang_schema,
    "marathi":{"type":"object","properties":{"title":{"type":"string"},"subtitle":{"type":"string"},"opening":{"type":"string"},"sections":{"type":"array","minItems":6,"maxItems":7,"items":section_schema},"takeaway":{"type":"string"},"quiz":{"type":"array","minItems":5,"maxItems":5,"items":quiz_schema}},"required":["title","subtitle","opening","sections","takeaway","quiz"],"additionalProperties":False},
    "comic":{"type":"object","properties":{"placement":{"type":"integer","minimum":1,"maximum":5},"alt":{"type":"string"},"prompt":{"type":"string"}},"required":["placement","alt","prompt"],"additionalProperties":False}
},"required":["title","subtitle","readingMinutes","english","marathi","comic"],"additionalProperties":False}

def make_lesson(chamber, picked):
    cid,en,mr,scope = chamber
    prompt = f"""Create one polished daily lesson for Akshad's Learning Cave.
Date: {DATE}. Chamber: {en}. Topic: {picked['topic']}. Hook: {picked['hook']}.
Audience: an analytical adult fascinated by human psychology, history, power, culture and mythology.

Requirements:
- 14–18 minute read with 6–7 substantial sections and a coherent narrative.
- Start with a concrete scene, then mechanism, evidence/history, competing view, consequences, modern application and reflection.
- Each section contains one short pre-generated interaction. These are static reveal choices; the app will never call AI while reading.
- Exactly five difficult scenario-based quiz questions. Four unique plausible options each, one correct answer, useful explanation. No repeated wording or trivial recall.
- Complete natural Marathi edition for an educated Marathi reader.
- Exactly one topic-specific three-panel comic prompt. It must teach the central mechanism through concrete action and visibly different panel progression. Avoid generic thinking poses, floating symbols and decorative mascots.
- Factual caution: distinguish evidence, interpretation and uncertainty. Do not invent quotations or mention sources in the prose.
- No political persuasion and no medical diagnosis.
- Comic prompt should avoid substantial written text; use visual storytelling and at most a few short speech bubbles."""
    return chat([
        {"role":"system","content":"You are an exceptional nonfiction writer, fact-checking editor, Marathi translator, interaction designer and comic director."},
        {"role":"user","content":prompt}
    ], lesson_schema, "learning_cave_lesson", 18000)

def main():
    out = DAILY / DATE
    out.mkdir(parents=True, exist_ok=True)
    old = history()
    picks = choose_topics(old)
    by_id = {x["id"]: x for x in picks}
    manifest = {"date":DATE,"version":2,"generatedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"lessons":[]}

    for chamber in CHAMBERS:
        cid,en,mr,_ = chamber
        picked = by_id[cid]
        print("Generating", cid, picked["topic"], flush=True)
        lesson = make_lesson(chamber, picked)
        comic = lesson.pop("comic")
        filename = f"{cid}-comic.png"
        image("Create one coherent horizontal three-panel comic strip. " + comic["prompt"], out / filename)
        lesson.update({
            "id": cid,
            "chamber": en,
            "chamberMr": mr,
            "images": [{"placement":comic["placement"],"alt":comic["alt"],"file":filename}]
        })
        manifest["lessons"].append(lesson)
        (out / f"{cid}.json").write_text(json.dumps(lesson, ensure_ascii=False), encoding="utf-8")

    (out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False), encoding="utf-8")
    (DAILY / "latest.json").write_text(json.dumps({"date":DATE}), encoding="utf-8")
    old.setdefault("topics", []).extend([x["topic"] for x in picks])
    old["topics"] = old["topics"][-2000:]
    HISTORY.write_text(json.dumps(old, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Generated", DATE, "with", len(manifest["lessons"]), "lessons, 10 comics and 50 quiz questions")

if __name__ == "__main__":
    main()
