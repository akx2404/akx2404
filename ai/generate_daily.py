#!/usr/bin/env python3
import base64, datetime as dt, json, os, pathlib, re, time, urllib.error, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
DAILY = ROOT / "daily"
HISTORY = ROOT / "ai" / "used_topics.json"
API_KEY = os.environ["OPENAI_API_KEY"]
TEXT_MODEL = os.getenv("TEXT_MODEL", "gpt-5-mini")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "gpt-image-1-mini")
DATE = os.getenv("LESSON_DATE") or dt.datetime.now(dt.timezone(dt.timedelta(hours=5, minutes=30))).date().isoformat()

CHAMBERS = [
    ("psychology", "Psychology", "मानसशास्त्र", "individual perception, emotion, memory, judgment and behaviour"),
    ("sociology", "Sociology", "समाजशास्त्र", "how groups, norms, class, institutions and networks shape human behaviour"),
    ("game-theory", "Game Theory", "खेळ सिद्धांत", "strategic decisions, cooperation, conflict, signalling and coordination"),
    ("history-mysteries", "History Mysteries", "इतिहासातील रहस्ये", "unresolved events, strange artefacts and competing historical explanations"),
    ("political-nature", "Power & Political Nature", "सत्ता आणि राजकीय स्वभाव", "power, legitimacy, propaganda, institutions, crowds and political psychology"),
    ("mind-glitches", "Mind Glitches", "मनातील भ्रम", "perceptual illusions, memory errors and counter-intuitive failures of attention"),
    ("psychoanalysis", "Psychoanalysis", "मनोविश्लेषण", "the unconscious, defence, desire, projection, symbolism and relationships"),
    ("philosophy", "Philosophy", "तत्त्वज्ञान", "thought experiments, knowledge, identity, ethics, freedom and meaning"),
    ("culture", "Art, Literature & Cultural Change", "कला, साहित्य आणि सांस्कृतिक बदल", "how artworks, books and cultural movements reshape society and imagination"),
    ("mythology", "World Mythology", "जागतिक पुराणकथा", "comparative myths, ritual, symbols, gods and how stories express human fears and values"),
]

STYLE = "Warm graphic-novel editorial illustration, hand-inked outlines, textured paper, cinematic lighting, expressive adult characters, intelligent and historically respectful, no text except very short speech bubbles, no logos, no grotesque faces, consistent premium nonfiction comic style."

def request_json(url, payload, timeout=600):
    req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)

def chat(messages, schema, name, max_tokens=14000):
    payload = {
        "model": TEXT_MODEL,
        "messages": messages,
        "response_format": {"type":"json_schema","json_schema":{"name":name,"strict":True,"schema":schema}},
        "max_completion_tokens": max_tokens,
    }
    data = request_json("https://api.openai.com/v1/chat/completions", payload)
    return json.loads(data["choices"][0]["message"]["content"])

def image(prompt, path):
    payload = {"model": IMAGE_MODEL, "prompt": STYLE + "\n" + prompt, "size":"1536x1024", "quality":"medium", "output_format":"png", "n":1}
    data = request_json("https://api.openai.com/v1/images/generations", payload)
    path.write_bytes(base64.b64decode(data["data"][0]["b64_json"]))

def history():
    try: return json.loads(HISTORY.read_text())
    except Exception: return {"topics":[]}

def choose_topics(old):
    recent = old.get("topics", [])[-500:]
    schema = {"type":"object","properties":{"topics":{"type":"array","minItems":10,"maxItems":10,"items":{"type":"object","properties":{"id":{"type":"string"},"topic":{"type":"string"},"hook":{"type":"string"}},"required":["id","topic","hook"],"additionalProperties":False}}},"required":["topics"],"additionalProperties":False}
    chamber_text = "\n".join(f"- {i}: {en} — {scope}" for i,en,_,scope in CHAMBERS)
    prompt = f"""Select exactly one fascinating lesson topic for each chamber for {DATE}.
Chambers:\n{chamber_text}
Previously used topics (never repeat or merely rename them): {json.dumps(recent, ensure_ascii=False)}
Mix mainstream and obscure ideas. Topics must be substantial enough for a 15–20 minute lesson, factually researchable, clearly different from one another, and strongly about the human mind's effect on the world. Return IDs exactly as supplied."""
    return chat([{"role":"system","content":"You are the senior editor of a premium daily illustrated learning app. Avoid repeats aggressively."},{"role":"user","content":prompt}], schema, "daily_topics", 3500)["topics"]

section_schema = {"type":"object","properties":{"heading":{"type":"string"},"body":{"type":"string"},"interaction":{"type":"object","properties":{"question":{"type":"string"},"options":{"type":"array","minItems":2,"maxItems":4,"items":{"type":"string"}},"reveal":{"type":"string"}},"required":["question","options","reveal"],"additionalProperties":False}},"required":["heading","body","interaction"],"additionalProperties":False}
quiz_schema = {"type":"object","properties":{"question":{"type":"string"},"scenario":{"type":"string"},"options":{"type":"array","minItems":4,"maxItems":4,"items":{"type":"string"}},"answerIndex":{"type":"integer","minimum":0,"maximum":3},"explanation":{"type":"string"}},"required":["question","scenario","options","answerIndex","explanation"],"additionalProperties":False}
lesson_schema = {"type":"object","properties":{
    "title":{"type":"string"},"subtitle":{"type":"string"},"readingMinutes":{"type":"integer","minimum":15,"maximum":22},
    "english":{"type":"object","properties":{"opening":{"type":"string"},"sections":{"type":"array","minItems":7,"maxItems":9,"items":section_schema},"takeaway":{"type":"string"},"quiz":{"type":"array","minItems":6,"maxItems":7,"items":quiz_schema}},"required":["opening","sections","takeaway","quiz"],"additionalProperties":False},
    "marathi":{"type":"object","properties":{"title":{"type":"string"},"subtitle":{"type":"string"},"opening":{"type":"string"},"sections":{"type":"array","minItems":7,"maxItems":9,"items":section_schema},"takeaway":{"type":"string"},"quiz":{"type":"array","minItems":6,"maxItems":7,"items":quiz_schema}},"required":["title","subtitle","opening","sections","takeaway","quiz"],"additionalProperties":False},
    "comicStrips":{"type":"array","minItems":2,"maxItems":2,"items":{"type":"object","properties":{"placement":{"type":"integer","minimum":0,"maximum":8},"alt":{"type":"string"},"prompt":{"type":"string"}},"required":["placement","alt","prompt"],"additionalProperties":False}}
},"required":["title","subtitle","readingMinutes","english","marathi","comicStrips"],"additionalProperties":False}

def make_lesson(chamber, picked):
    cid,en,mr,scope = chamber
    prompt = f"""Create a premium illustrated lesson for Akshad's Learning Cave.
Date: {DATE}. Chamber: {en}. Topic: {picked['topic']}. Editorial hook: {picked['hook']}.
The user is intellectually curious, analytical, loves psychology, history, politics, culture, mythology and surprising connections.
Requirements:
- English reading experience must genuinely take 15–20 minutes: 7–9 substantial sections, coherent narrative, not encyclopedia dumping.
- Begin with a concrete human scene, build tension, explain mechanism, evidence/history, competing interpretations, consequences, modern application and reflective ending.
- Each section has an interactive prediction/choice/reveal specifically about this topic. No generic prompts.
- Six or seven difficult scenario quizzes with unique plausible distractors and detailed explanations. No repeated options.
- Marathi must be a natural complete translation suitable for an educated Marathi reader, not word substitution.
- Two comic strips, each a single 3-panel landscape comic. Prompts must describe exact topic-specific action, setting, characters, expressions and panel progression. They must teach the concept without generic symbols.
- Stay factual; clearly label uncertainty and disputed claims. Do not mention sources inside the lesson.
- Avoid medical diagnosis or political persuasion. Do not fabricate quotations.
- The comic prompts should request no more than very short speech-bubble text because image text can be unreliable."""
    return chat([{"role":"system","content":"You are an exceptional nonfiction writer, fact-checking editor, Marathi translator, interaction designer and comic director. Produce precise, memorable, non-repetitive educational work."},{"role":"user","content":prompt}], lesson_schema, "learning_cave_lesson", 30000)

def main():
    out = DAILY / DATE
    out.mkdir(parents=True, exist_ok=True)
    old = history()
    picks = choose_topics(old)
    by_id = {x["id"]:x for x in picks}
    manifest = {"date":DATE,"version":1,"generatedAt":dt.datetime.now(dt.timezone.utc).isoformat(),"lessons":[]}
    for chamber in CHAMBERS:
        cid,en,mr,_ = chamber
        picked = by_id[cid]
        print("Generating", cid, picked["topic"], flush=True)
        lesson = make_lesson(chamber, picked)
        images=[]
        for i,strip in enumerate(lesson["comicStrips"]):
            filename=f"{cid}-{i+1}.png"
            image("Create one coherent horizontal three-panel comic strip. " + strip["prompt"], out/filename)
            images.append({"placement":strip["placement"],"alt":strip["alt"],"file":filename})
        lesson.pop("comicStrips",None)
        lesson.update({"id":cid,"chamber":en,"chamberMr":mr,"images":images})
        manifest["lessons"].append(lesson)
        (out/f"{cid}.json").write_text(json.dumps(lesson,ensure_ascii=False),encoding="utf-8")
    (out/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False),encoding="utf-8")
    (DAILY/"latest.json").write_text(json.dumps({"date":DATE},ensure_ascii=False),encoding="utf-8")
    old.setdefault("topics",[]).extend([x["topic"] for x in picks])
    old["topics"] = old["topics"][-1000:]
    HISTORY.write_text(json.dumps(old,ensure_ascii=False,indent=2),encoding="utf-8")
    print("Generated", DATE)

if __name__ == "__main__":
    main()
