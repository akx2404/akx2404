#!/usr/bin/env python3
"""Cost-optimized daily generator: 10 lessons, exactly 5 Keeper moments each."""
import json
import generate_daily_keeper as base

PLACEMENTS = [0, 2, 4, 6, 7]
KINDS = ["question", "joke", "connection", "warning", "challenge"]

KEEPER_SCHEMA = {
    "type": "object",
    "properties": {
        "keeper": {
            "type": "array",
            "minItems": 5,
            "maxItems": 5,
            "items": {
                "type": "object",
                "properties": {
                    "placement": {"type": "integer", "enum": PLACEMENTS},
                    "kind": {"type": "string", "enum": KINDS},
                    "english": {"type": "string"},
                    "marathi": {"type": "string"}
                },
                "required": ["placement", "kind", "english", "marathi"],
                "additionalProperties": False
            }
        }
    },
    "required": ["keeper"],
    "additionalProperties": False
}


def fallback_keeper(lesson):
    en = lesson["english"]
    mr = lesson["marathi"]
    sections_en = en.get("sections", [])
    sections_mr = mr.get("sections", [])

    def question_at(sections, idx, default):
        if not sections:
            return default
        item = sections[min(idx, len(sections) - 1)]
        interaction = item.get("interaction") or {}
        return interaction.get("question") or item.get("heading") or default

    return [
        {
            "placement": 0,
            "kind": "question",
            "english": "Before reading on, make a prediction: which part of this explanation will your first instinct resist?",
            "marathi": "पुढे वाचण्यापूर्वी अंदाज करा: या स्पष्टीकरणातील कोणत्या भागाला तुमची पहिली प्रतिक्रिया विरोध करेल?"
        },
        {
            "placement": 2,
            "kind": "joke",
            "english": "The mind loves a neat explanation. Reality, inconveniently, did not sign that agreement.",
            "marathi": "मनाला नीटनेटके स्पष्टीकरण आवडते. वास्तवाने मात्र असा कोणताही करार केलेला नाही."
        },
        {
            "placement": 4,
            "kind": "connection",
            "english": question_at(sections_en, 3, "Where does this mechanism appear in ordinary life?"),
            "marathi": question_at(sections_mr, 3, "ही यंत्रणा दैनंदिन जीवनात कुठे दिसते?")
        },
        {
            "placement": 6,
            "kind": "warning",
            "english": "Confidence is not evidence. Notice which claim here feels persuasive before you have actually tested it.",
            "marathi": "आत्मविश्वास म्हणजे पुरावा नाही. प्रत्यक्ष तपासण्यापूर्वी कोणता दावा पटतोय असे वाटते ते लक्षात घ्या."
        },
        {
            "placement": 7,
            "kind": "challenge",
            "english": "Now argue the strongest opposite case. If your conclusion survives, you probably understood the lesson.",
            "marathi": "आता सर्वात मजबूत विरुद्ध बाजू मांडा. निष्कर्ष तरीही टिकला, तर धडा खरोखर समजला आहे."
        }
    ]


def make_keeper(chamber, picked, lesson):
    _cid, chamber_en, _mr, _scope = chamber
    summary = {
        "title": lesson["title"],
        "opening": lesson["english"]["opening"],
        "sections": [
            {
                "heading": s.get("heading", ""),
                "body": s.get("body", "")[:550],
                "question": (s.get("interaction") or {}).get("question", "")
            }
            for s in lesson["english"].get("sections", [])
        ],
        "takeaway": lesson["english"].get("takeaway", "")
    }
    prompt = f"""Write exactly five Cave Keeper interventions for this adult learning lesson.
Chamber: {chamber_en}
Selected topic: {picked['topic']}
Lesson summary: {json.dumps(summary, ensure_ascii=False)}

Return one intervention at each exact placement and kind:
0 question — opening prediction or uncomfortable question
2 joke — dry humour that clarifies the idea
4 connection — connect the concept to ordinary life or another field
6 warning — identify an evidence trap or misconception
7 challenge — final assumption reversal before the quiz

Each line must be specific to this lesson, 8–28 words per language, factual, sharp and natural. Provide educated natural Marathi, not literal translation. No invented quotations, diagnosis, preaching or generic filler."""
    try:
        result = base.g.chat(
            [
                {"role": "system", "content": "You write concise, memorable marginalia for a premium adult learning app."},
                {"role": "user", "content": prompt}
            ],
            KEEPER_SCHEMA,
            "five_cave_keeper_moments",
            2200
        )
        keeper = result.get("keeper", [])
        if len(keeper) != 5:
            raise ValueError("Expected five Keeper moments")
        ordered = sorted(keeper, key=lambda x: PLACEMENTS.index(x["placement"]))
        if [x["placement"] for x in ordered] != PLACEMENTS:
            raise ValueError("Incorrect Keeper placements")
        return ordered
    except Exception as exc:
        print("Keeper generation fallback:", exc, flush=True)
        return fallback_keeper(lesson)


def main():
    base.make_keeper = make_keeper
    base.main()


if __name__ == "__main__":
    main()
