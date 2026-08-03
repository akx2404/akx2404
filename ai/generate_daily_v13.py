#!/usr/bin/env python3
"""Resilient V13 generation wrapper.

Keeps full permanent-history topic generation, but never discards an entire
fresh day merely because the optional Keeper-dialogue call returns malformed
or empty JSON.
"""
import generate_daily_keeper as base


def fallback_keeper(lesson):
    en_sections = lesson["english"]["sections"]
    mr_sections = lesson["marathi"]["sections"]
    kinds = ["question", "remark", "joke", "connection", "warning", "challenge"]
    items = []
    for placement in range(8):
        en_section = en_sections[min(max(placement - 1, 0), len(en_sections) - 1)] if placement else None
        mr_section = mr_sections[min(max(placement - 1, 0), len(mr_sections) - 1)] if placement else None
        en_source = lesson["english"]["opening"] if placement == 0 else en_section["interaction"]["question"]
        mr_source = lesson["marathi"]["opening"] if placement == 0 else mr_section["interaction"]["question"]
        count = 4 if placement != 7 else 7
        for i in range(count):
            kind = kinds[(placement + i) % len(kinds)]
            en_prefix = [
                "Pause before you agree:",
                "Reverse the assumption:",
                "The Keeper raises an eyebrow:",
                "A useful nuisance of a question:",
                "Evidence check:",
                "Try the opposing case:",
            ][i % 6]
            mr_prefix = [
                "मान्य करण्यापूर्वी थांबा:",
                "गृहितक उलटे करून पाहा:",
                "गुहा रक्षक भुवई उंचावतो:",
                "एक उपयुक्त पण अस्वस्थ प्रश्न:",
                "पुरावा तपासा:",
                "विरुद्ध बाजू मांडून पाहा:",
            ][i % 6]
            items.append({
                "placement": placement,
                "kind": kind,
                "english": f"{en_prefix} {en_source}"[:300],
                "marathi": f"{mr_prefix} {mr_source}"[:360],
            })
    return items[:35]


_original_make_keeper = base.make_keeper


def safe_make_keeper(chamber, picked, lesson):
    try:
        return _original_make_keeper(chamber, picked, lesson)
    except Exception as exc:
        print("Keeper generation failed; using lesson-grounded fallback:", exc, flush=True)
        return fallback_keeper(lesson)


def main():
    base.make_keeper = safe_make_keeper
    base.main()


if __name__ == "__main__":
    main()
