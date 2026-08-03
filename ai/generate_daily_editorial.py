#!/usr/bin/env python3
import datetime as dt
import json

import generate_daily as g

# One strong, text-free editorial image is more reliable and useful than a
# multi-panel AI comic. Keep the existing lesson schema and reader contract,
# but reinterpret the single image as a magazine-style concept illustration.
g.STYLE = (
    "Premium editorial illustration for an intelligent nonfiction magazine, "
    "single coherent scene, strong visual metaphor, elegant restrained composition, "
    "hand-inked and painterly texture, cinematic lighting, expressive but natural adult figures, "
    "historically and culturally respectful, sophisticated rather than childish, "
    "no panels, no comic-strip layout, no speech bubbles, no captions, no letters, no words, "
    "no logos, no watermarks, no grotesque faces, no extra limbs."
)


def editorial_prompt(chamber, picked, lesson):
    cid, en, _mr, scope = chamber
    opening = lesson["english"]["opening"][:900]
    takeaway = lesson["english"]["takeaway"][:500]
    topic = lesson["title"]
    subject_direction = {
        "psychology": "Use an everyday social scene and a subtle perceptual metaphor.",
        "sociology": "Show individuals embedded in a visible social system, network, norm or institution.",
        "game-theory": "Show two or more people facing a concrete strategic choice with visible consequences, without diagrams or text.",
        "history-mysteries": "Create an atmospheric archival or archaeological investigation scene with materially accurate clues.",
        "political-nature": "Show power operating through institutions, crowds, rituals or incentives; avoid partisan symbols.",
        "mind-glitches": "Create one clever visual contradiction or attention illusion that remains readable as a still image.",
        "psychoanalysis": "Use a restrained dreamlike double-image to show conflict, projection, defence or desire without horror imagery.",
        "philosophy": "Use one minimal but memorable visual thought experiment with a calm, contemplative atmosphere.",
        "culture": "Show an artwork or book changing how people see, speak or organise their world across a single connected composition.",
        "mythology": "Create a culturally grounded mythic scene with accurate material culture and a symbolic human dilemma.",
    }[cid]
    return f"""
Create one premium landscape editorial illustration for the lesson “{topic}” in the chamber {en}.
The lesson begins: {opening}
Its central takeaway is: {takeaway}
The chosen editorial hook is: {picked['hook']}
{subject_direction}
Communicate the core mechanism through one concrete scene and one clear visual metaphor.
The image must still make sense without any text. Do not draw a generic person merely thinking.
Do not create panels, borders, speech bubbles, fake writing, labels, charts or floating emoji-like symbols.
Use a 3:2 landscape composition with a clear focal point and generous breathing room.
""".strip()


def main():
    out = g.DAILY / g.DATE
    out.mkdir(parents=True, exist_ok=True)
    old = g.history()
    picks = g.choose_topics(old)
    by_id = {x["id"]: x for x in picks}
    manifest = {
        "date": g.DATE,
        "version": 3,
        "visualMode": "editorial-illustration",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "lessons": [],
    }

    for chamber in g.CHAMBERS:
        cid, en, mr, _scope = chamber
        picked = by_id[cid]
        print("Generating editorial lesson", cid, picked["topic"], flush=True)
        lesson = g.make_lesson(chamber, picked)
        legacy_visual = lesson.pop("comic")
        filename = f"{cid}-editorial.png"
        g.image(editorial_prompt(chamber, picked, lesson), out / filename)
        lesson.update({
            "id": cid,
            "chamber": en,
            "chamberMr": mr,
            "images": [{
                "placement": legacy_visual["placement"],
                "alt": legacy_visual["alt"],
                "file": filename,
                "kind": "editorial",
            }],
        })
        manifest["lessons"].append(lesson)
        (out / f"{cid}.json").write_text(
            json.dumps(lesson, ensure_ascii=False), encoding="utf-8"
        )

    (out / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False), encoding="utf-8"
    )
    (g.DAILY / "latest.json").write_text(
        json.dumps({"date": g.DATE}), encoding="utf-8"
    )
    old.setdefault("topics", []).extend([x["topic"] for x in picks])
    old["topics"] = old["topics"][-2000:]
    g.HISTORY.write_text(
        json.dumps(old, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("Generated", g.DATE, "with 10 editorial illustrations and 50 quiz questions")


if __name__ == "__main__":
    main()
