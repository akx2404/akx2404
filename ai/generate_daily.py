#!/usr/bin/env python3
"""Compatibility entry point plus V12 native-reader polish."""
from augment_keeper import main as augment_main
from pathlib import Path
import re


def patch_native_reader():
    path = Path(__file__).resolve().parents[1] / "android-v2/app/src/main/java/com/akshad/learningcave/MainActivity.java"
    source = path.read_text(encoding="utf-8")

    add_keeper = r'''    private void addKeeper(int placement) {
        // Five deliberate Keeper moments per lesson: opening, early middle,
        // late middle, final section, and pre-quiz. This keeps the guide
        // memorable without interrupting every paragraph.
        if (placement != 0 && placement != 2 && placement != 4 && placement != 6 && placement != 7) return;
        try {
            JSONArray all = current.optJSONArray("keeper");
            List<JSONObject> found = new ArrayList<>();
            if (all != null) {
                for (int i = 0; i < all.length(); i++) {
                    JSONObject item = all.getJSONObject(i);
                    if (item.optInt("placement") == placement) found.add(item);
                }
            }

            String wanted;
            if (placement == 0) wanted = "question";
            else if (placement == 2) wanted = "joke";
            else if (placement == 4) wanted = "connection";
            else if (placement == 6) wanted = "warning";
            else wanted = "challenge";

            JSONObject chosen = null;
            for (JSONObject item : found) {
                if (wanted.equals(item.optString("kind"))) { chosen = item; break; }
            }
            if (chosen == null && !found.isEmpty()) chosen = found.get(0);

            if (chosen != null) {
                String line = marathi ? chosen.optString("marathi") : chosen.optString("english");
                page.addView(keeperCard(line, chosen.optString("kind", wanted)), lp(-1,-2,0,dp(2),0,dp(16)));
            } else {
                String line;
                if (marathi) {
                    if (placement == 0) line = "पुढे जाण्यापूर्वी स्वतःचा अंदाज नोंदवा—नंतर उत्तर बदलणे खूप सोपे असते.";
                    else if (placement == 2) line = "मानवी मेंदूला साधे स्पष्टीकरण आवडते. वास्तवाला त्याची फारशी पर्वा नसते.";
                    else if (placement == 4) line = "ही कल्पना तुमच्या कामात, नात्यांत किंवा राजकारणात कुठे दिसते?";
                    else if (placement == 6) line = "विश्वासार्ह वाटणे आणि पुराव्याने समर्थित असणे या दोन वेगळ्या गोष्टी आहेत.";
                    else line = "आता उलट बाजू मांडून पाहा. तुमचा निष्कर्ष तरीही टिकतो का?";
                } else {
                    if (placement == 0) line = "Make your prediction before reading on. Revising it afterward is suspiciously easy.";
                    else if (placement == 2) line = "The human mind loves a neat explanation. Reality has not agreed to cooperate.";
                    else if (placement == 4) line = "Where does this mechanism quietly appear in your work, relationships, or politics?";
                    else if (placement == 6) line = "Feeling convincing and being supported by evidence are two different achievements.";
                    else line = "Argue the opposite case now. Does your conclusion survive?";
                }
                page.addView(keeperCard(line, wanted), lp(-1,-2,0,dp(2),0,dp(16)));
            }
        } catch (Exception ignored) {}
    }

    private View keeperCard(String line, String kind) {
        int paper = Color.rgb(249, 238, 210);
        int edge;
        String icon;
        String label;
        if ("joke".equals(kind)) {
            edge = Color.rgb(194, 126, 52); icon = "☺"; label = marathi ? "हलकी टोचणी" : "DRY ASIDE";
        } else if ("warning".equals(kind)) {
            edge = Color.rgb(172, 75, 58); icon = "!"; label = marathi ? "सावधान" : "CAUTION";
        } else if ("connection".equals(kind)) {
            edge = Color.rgb(69, 112, 102); icon = "↗"; label = marathi ? "संबंध" : "CONNECTION";
        } else if ("challenge".equals(kind)) {
            edge = Color.rgb(99, 82, 139); icon = "?"; label = marathi ? "आव्हान" : "CHALLENGE";
        } else {
            edge = Color.rgb(151, 91, 45); icon = "✦"; label = marathi ? "क्षणभर विचार" : "PAUSE & THINK";
        }

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.TOP);
        card.setPadding(dp(13), dp(13), dp(15), dp(13));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(paper); bg.setCornerRadius(dp(18)); bg.setStroke(dp(2), edge);
        card.setBackground(bg);
        card.setElevation(dp(2));

        TextView badge = text(icon, 23, Color.WHITE, true);
        badge.setGravity(Gravity.CENTER);
        GradientDrawable badgeBg = new GradientDrawable();
        badgeBg.setColor(edge); badgeBg.setShape(GradientDrawable.OVAL);
        badge.setBackground(badgeBg);
        LinearLayout.LayoutParams badgeLp = new LinearLayout.LayoutParams(dp(44), dp(44));
        badgeLp.setMargins(0, dp(2), dp(12), 0);
        card.addView(badge, badgeLp);

        LinearLayout copy = new LinearLayout(this); copy.setOrientation(LinearLayout.VERTICAL);
        TextView name = text(marathi ? "गुहा रक्षक · " + label : "CAVE KEEPER · " + label, 10, edge, true);
        name.setLetterSpacing(.08f); name.setTypeface(Typeface.DEFAULT_BOLD);
        copy.addView(name);
        TextView dialogue = text(line, 16, INK, false);
        dialogue.setTypeface(Typeface.create("serif", Typeface.BOLD_ITALIC));
        dialogue.setLineSpacing(dp(1), 1.18f);
        copy.addView(dialogue);
        card.addView(copy, new LinearLayout.LayoutParams(0, -2, 1));
        return card;
    }

    private View interaction'''

    source, count = re.subn(
        r"    private void addKeeper\(int placement\) \{.*?\n    private View interaction",
        add_keeper,
        source,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not patch native Keeper renderer")

    source = source.replace('setRequestProperty("User-Agent", "LearningCave/11")',
                            'setRequestProperty("User-Agent", "LearningCave/12")')
    path.write_text(source, encoding="utf-8")


def main():
    augment_main()
    patch_native_reader()
    print("Applied V12 native polish: five compact Cave Keeper moments per lesson")


if __name__ == "__main__":
    main()
