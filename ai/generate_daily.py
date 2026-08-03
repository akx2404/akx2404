#!/usr/bin/env python3
"""Daily V13 generation plus native-reader Keeper face polish."""
from generate_daily_v13 import main as generate_full_day
from pathlib import Path
import re


def patch_native_reader():
    path = Path(__file__).resolve().parents[1] / "android-v2/app/src/main/java/com/akshad/learningcave/MainActivity.java"
    source = path.read_text(encoding="utf-8")

    if "import android.graphics.Canvas;" not in source:
        source = source.replace(
            "import android.graphics.Color;",
            "import android.graphics.Color;\nimport android.graphics.Canvas;\nimport android.graphics.Paint;\nimport android.graphics.RectF;"
        )

    replacement = r'''    private static class KeeperFaceView extends View {
        private final Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);

        KeeperFaceView(Activity context) {
            super(context);
            stroke.setStyle(Paint.Style.STROKE);
            stroke.setStrokeWidth(context.getResources().getDisplayMetrics().density * 2.4f);
            stroke.setStrokeCap(Paint.Cap.ROUND);
            stroke.setColor(Color.rgb(53, 34, 23));
            setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }

        @Override protected void onDraw(Canvas c) {
            super.onDraw(c);
            float w = getWidth(), h = getHeight();
            float d = getResources().getDisplayMetrics().density;

            p.setStyle(Paint.Style.FILL);
            p.setColor(Color.rgb(245, 224, 180));
            p.setShadowLayer(3*d, 0, 2*d, Color.argb(70,0,0,0));
            c.drawOval(new RectF(w*.13f, h*.06f, w*.87f, h*.82f), p);
            p.clearShadowLayer();

            p.setColor(Color.rgb(76, 48, 30));
            c.drawArc(new RectF(w*.10f, h*.01f, w*.90f, h*.55f), 180, 180, true, p);
            c.drawOval(new RectF(w*.18f, h*.50f, w*.82f, h*.94f), p);

            p.setColor(Color.rgb(245, 224, 180));
            c.drawOval(new RectF(w*.25f, h*.23f, w*.75f, h*.70f), p);

            p.setColor(Color.rgb(43, 28, 20));
            c.drawCircle(w*.39f, h*.42f, 2.7f*d, p);
            c.drawCircle(w*.61f, h*.42f, 2.7f*d, p);

            stroke.setColor(Color.rgb(53, 34, 23));
            c.drawArc(new RectF(w*.31f,h*.30f,w*.46f,h*.40f),200,120,false,stroke);
            c.drawArc(new RectF(w*.54f,h*.30f,w*.69f,h*.40f),220,120,false,stroke);
            c.drawArc(new RectF(w*.40f,h*.49f,w*.60f,h*.62f),15,150,false,stroke);

            p.setColor(Color.rgb(243, 163, 59));
            c.drawCircle(w*.79f, h*.18f, 4.5f*d, p);
            p.setColor(Color.rgb(255, 247, 220));
            c.drawCircle(w*.79f, h*.18f, 1.8f*d, p);
        }
    }

    private View keeperCard(String line, String kind) {
        int paper = Color.rgb(249, 238, 210);
        int edge;
        String label;
        if ("joke".equals(kind)) {
            edge = Color.rgb(194, 126, 52); label = marathi ? "हलकी टोचणी" : "DRY ASIDE";
        } else if ("warning".equals(kind)) {
            edge = Color.rgb(172, 75, 58); label = marathi ? "सावधान" : "CAUTION";
        } else if ("connection".equals(kind)) {
            edge = Color.rgb(69, 112, 102); label = marathi ? "संबंध" : "CONNECTION";
        } else if ("challenge".equals(kind)) {
            edge = Color.rgb(99, 82, 139); label = marathi ? "आव्हान" : "CHALLENGE";
        } else {
            edge = Color.rgb(151, 91, 45); label = marathi ? "क्षणभर विचार" : "PAUSE & THINK";
        }

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.HORIZONTAL);
        card.setGravity(Gravity.CENTER_VERTICAL);
        card.setPadding(dp(11), dp(12), dp(15), dp(12));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(paper); bg.setCornerRadius(dp(18)); bg.setStroke(dp(2), edge);
        card.setBackground(bg);
        card.setElevation(dp(2));

        FrameLayout portrait = new FrameLayout(this);
        GradientDrawable portraitBg = new GradientDrawable();
        portraitBg.setColor(Color.rgb(224, 196, 143));
        portraitBg.setShape(GradientDrawable.OVAL);
        portraitBg.setStroke(dp(2), edge);
        portrait.setBackground(portraitBg);
        KeeperFaceView face = new KeeperFaceView(this);
        portrait.addView(face, new FrameLayout.LayoutParams(-1, -1));
        LinearLayout.LayoutParams portraitLp = new LinearLayout.LayoutParams(dp(62), dp(62));
        portraitLp.setMargins(0, 0, dp(12), 0);
        card.addView(portrait, portraitLp);

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
        r"    private View keeperCard\(String line, String kind\) \{.*?\n    private View interaction",
        replacement,
        source,
        count=1,
        flags=re.S,
    )
    if count != 1:
        raise RuntimeError("Could not replace native Keeper card")

    source = re.sub(
        r'setRequestProperty\("User-Agent", "LearningCave/\d+"\)',
        'setRequestProperty("User-Agent", "LearningCave/13")',
        source,
    )
    path.write_text(source, encoding="utf-8")


def main():
    generate_full_day()
    patch_native_reader()
    print("Applied V13: permanent non-repeat history and native drawn Cave Keeper face")


if __name__ == "__main__":
    main()
