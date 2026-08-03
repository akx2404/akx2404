package com.akshad.learningcave;

import android.app.Activity;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.GridLayout;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.window.OnBackInvokedDispatcher;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MainActivity extends Activity {
    private static final String BASE = "https://raw.githubusercontent.com/akx2404/akx2404/build-learning-cave-v2-direct/daily";
    private static final int BG = Color.rgb(22, 16, 13);
    private static final int CARD = Color.rgb(38, 26, 20);
    private static final int PAPER = Color.rgb(244, 231, 202);
    private static final int INK = Color.rgb(33, 22, 15);
    private static final int GOLD = Color.rgb(243, 163, 59);
    private static final int MUTED = Color.rgb(183, 162, 141);
    private static final int ACCENT = Color.rgb(198, 106, 85);

    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final ArrayDeque<String> nav = new ArrayDeque<>();
    private final Map<String, String> icons = new HashMap<>();
    private FrameLayout root;
    private LinearLayout page;
    private JSONObject manifest;
    private JSONObject current;
    private String currentDate;
    private boolean marathi;
    private int quizIndex;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        icons.put("psychology", "🧠"); icons.put("sociology", "🌐");
        icons.put("game-theory", "♟️"); icons.put("history-mysteries", "🕯️");
        icons.put("political-nature", "👑"); icons.put("mind-glitches", "🌀");
        icons.put("psychoanalysis", "🛋️"); icons.put("philosophy", "🏛️");
        icons.put("culture", "🎭"); icons.put("mythology", "🐉");
        marathi = getPreferences(MODE_PRIVATE).getBoolean("mr", false);

        Window w = getWindow();
        w.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS | WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        w.setStatusBarColor(BG); w.setNavigationBarColor(BG);
        if (Build.VERSION.SDK_INT >= 30) w.setDecorFitsSystemWindows(false);

        root = new FrameLayout(this); root.setBackgroundColor(BG); setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            root.setOnApplyWindowInsetsListener((v, insets) -> {
                android.graphics.Insets b = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                v.setPadding(b.left, b.top, b.right, b.bottom); return WindowInsets.CONSUMED;
            });
        }
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::goBack);
        showLoading(); loadLatest();
    }

    private void loadLatest() {
        io.execute(() -> {
            try {
                JSONObject latest = new JSONObject(http(BASE + "/latest.json"));
                currentDate = latest.getString("date");
                String raw = http(BASE + "/" + currentDate + "/manifest.json");
                getPreferences(MODE_PRIVATE).edit().putString("manifest", raw).putString("date", currentDate).apply();
                manifest = new JSONObject(raw);
            } catch (Exception e) {
                try {
                    String cached = getPreferences(MODE_PRIVATE).getString("manifest", null);
                    currentDate = getPreferences(MODE_PRIVATE).getString("date", null);
                    if (cached != null) manifest = new JSONObject(cached);
                    else {
                        JSONObject latest = new JSONObject(asset("daily/latest.json"));
                        currentDate = latest.getString("date");
                        manifest = new JSONObject(asset("daily/" + currentDate + "/manifest.json"));
                    }
                } catch (Exception fatal) { manifest = null; }
            }
            runOnUiThread(() -> { if (manifest == null) showError(); else showHome(); });
        });
    }

    private String http(String address) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(address).openConnection();
        c.setConnectTimeout(15000); c.setReadTimeout(30000); c.setRequestProperty("User-Agent", "LearningCave/11");
        try (InputStream in = c.getInputStream()) { return read(in); } finally { c.disconnect(); }
    }
    private String asset(String path) throws Exception { try (InputStream in = getAssets().open(path)) { return read(in); } }
    private String read(InputStream in) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        StringBuilder b = new StringBuilder(); String line; while ((line = br.readLine()) != null) b.append(line); return b.toString();
    }

    private void resetPage(boolean back) {
        root.removeAllViews();
        LinearLayout shell = new LinearLayout(this); shell.setOrientation(LinearLayout.VERTICAL); shell.setBackgroundColor(BG);
        shell.addView(header(back), new LinearLayout.LayoutParams(-1, dp(74)));
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setOverScrollMode(View.OVER_SCROLL_NEVER);
        page = new LinearLayout(this); page.setOrientation(LinearLayout.VERTICAL); page.setPadding(dp(16), dp(16), dp(16), dp(60));
        scroll.addView(page, new ScrollView.LayoutParams(-1, -2)); shell.addView(scroll, new LinearLayout.LayoutParams(-1, 0, 1));
        root.addView(shell, new FrameLayout.LayoutParams(-1, -1));
    }

    private View header(boolean back) {
        LinearLayout h = new LinearLayout(this); h.setGravity(Gravity.CENTER_VERTICAL); h.setPadding(dp(12), 0, dp(12), 0); h.setBackgroundColor(Color.rgb(23,17,14));
        Button b = button(back ? "‹" : "☰", CARD, Color.WHITE); b.setTextSize(back ? 28 : 18); b.setOnClickListener(v -> { if(back) goBack(); });
        h.addView(b, new LinearLayout.LayoutParams(dp(48), dp(48)));
        LinearLayout title = new LinearLayout(this); title.setOrientation(LinearLayout.VERTICAL); title.setPadding(dp(12),0,dp(8),0);
        TextView name = text("Akshad's Learning Cave", 20, Color.WHITE, true); title.addView(name);
        title.addView(text(marathi ? "दररोज दहा नवीन ज्ञानप्रवास" : "Ten new journeys every day", 11, MUTED, false));
        h.addView(title, new LinearLayout.LayoutParams(0,-2,1));
        Button lang = button(marathi ? "मराठी" : "EN", GOLD, INK); lang.setOnClickListener(v -> { marathi=!marathi; getPreferences(MODE_PRIVATE).edit().putBoolean("mr",marathi).apply(); if(current==null)showHome(); else showLesson(); });
        h.addView(lang, new LinearLayout.LayoutParams(dp(76), dp(42))); return h;
    }

    private void showLoading() {
        resetPage(false); TextView t=text("🦇\n\nOpening today’s cave…",24,Color.WHITE,true); t.setGravity(Gravity.CENTER); page.addView(t,new LinearLayout.LayoutParams(-1,dp(420)));
    }
    private void showError() { resetPage(false); page.addView(text("Could not load any lesson pack. Connect to the internet once and reopen the app.",20,Color.WHITE,true)); }

    private void showHome() {
        current=null; nav.clear(); resetPage(false);
        LinearLayout hero = card(CARD, 28, dp(24));
        hero.addView(text(marathi ? "आजच्या ज्ञानगुहा" : "Today’s chambers", 38, Color.WHITE, true));
        hero.addView(text(marathi ? "मानवी मन आणि त्याने घडवलेल्या जगांवरील दहा सखोल धडे." : "Ten deep journeys into the human mind and the worlds it creates.", 16, Color.rgb(234,218,202), false));
        hero.addView(text(currentDate == null ? "" : currentDate, 13, GOLD, true));
        page.addView(hero, lp(-1,-2,0,0,0,dp(18)));
        GridLayout grid = new GridLayout(this); grid.setColumnCount(2); grid.setUseDefaultMargins(false);
        try {
            JSONArray lessons=manifest.getJSONArray("lessons");
            for(int i=0;i<lessons.length();i++){
                JSONObject l=lessons.getJSONObject(i); final int idx=i;
                LinearLayout tile=card(CARD,24,dp(15)); tile.setMinimumHeight(dp(190)); tile.setOnClickListener(v->{ try{current=manifest.getJSONArray("lessons").getJSONObject(idx);nav.push("home");showLesson();}catch(Exception ignored){} });
                tile.addView(text(icons.getOrDefault(l.optString("id"),"✨"),32,Color.WHITE,false));
                tile.addView(text(marathi?l.optString("chamberMr"):l.optString("chamber"),19,Color.WHITE,true));
                JSONObject langObj=l.optJSONObject(marathi?"marathi":"english");
                String ttl=marathi&&l.optJSONObject("marathi")!=null?l.optJSONObject("marathi").optString("title",l.optString("title")):l.optString("title");
                tile.addView(text(ttl,13,MUTED,false));
                boolean read=getPreferences(MODE_PRIVATE).getBoolean(currentDate+"|"+l.optString("id")+"|read",false);
                tile.addView(text(read?(marathi?"✓ वाचले":"✓ Read"):(marathi?"न वाचलेले":"Unread"),11,read?GOLD:MUTED,true));
                GridLayout.LayoutParams gp=new GridLayout.LayoutParams(); gp.width=0; gp.height=-2; gp.columnSpec=GridLayout.spec(GridLayout.UNDEFINED,1f); gp.setMargins(dp(5),dp(5),dp(5),dp(5)); grid.addView(tile,gp);
            }
        }catch(Exception ignored){}
        page.addView(grid,new LinearLayout.LayoutParams(-1,-2));
    }

    private void showLesson() {
        resetPage(true);
        try {
            JSONObject content=current.getJSONObject(marathi?"marathi":"english");
            String title=marathi?current.getJSONObject("marathi").optString("title",current.optString("title")):current.optString("title");
            LinearLayout intro=paper(); intro.addView(eyebrow(marathi?current.optString("chamberMr"):current.optString("chamber")));
            intro.addView(text(title,36,INK,true)); intro.addView(text(content.optString("subtitle")+" · "+current.optInt("readingMinutes",15)+(marathi?" मिनिटे":" min read"),14,Color.rgb(109,89,69),false));
            intro.addView(text(content.optString("opening"),19,INK,false));
            Button read=button(marathi?"वाचले म्हणून नोंदवा":"Mark as read",GOLD,INK); read.setOnClickListener(v->{getPreferences(MODE_PRIVATE).edit().putBoolean(currentDate+"|"+current.optString("id")+"|read",true).apply();Toast.makeText(this,marathi?"नोंदवले":"Marked as read",Toast.LENGTH_SHORT).show();}); intro.addView(read,lp(-1,dp(48),0,dp(8),dp(8),0));
            page.addView(intro,lp(-1,-2,0,0,0,dp(14)));
            addKeeper(0);
            JSONArray sections=content.getJSONArray("sections");
            for(int i=0;i<sections.length();i++){
                JSONObject s=sections.getJSONObject(i); LinearLayout p=paper(); p.addView(eyebrow((i+1)+" / "+sections.length())); p.addView(text(s.optString("heading"),28,INK,true)); p.addView(text(s.optString("body"),18,INK,false));
                JSONObject interaction=s.optJSONObject("interaction"); if(interaction!=null) p.addView(interaction(interaction)); page.addView(p,lp(-1,-2,0,0,0,dp(12))); addKeeper(i+1);
            }
            LinearLayout end=paper(); end.addView(eyebrow(marathi?"सारांश":"Takeaway")); end.addView(text(content.optString("takeaway"),19,INK,false));
            Button quiz=button(marathi?"प्रश्नमंजुषा सुरू करा":"Start challenge",Color.rgb(42,29,23),Color.WHITE); quiz.setOnClickListener(v->{nav.push("lesson");quizIndex=0;showQuiz();}); end.addView(quiz,lp(-1,dp(50),0,dp(8),dp(8),0)); page.addView(end);
        } catch(Exception e){ page.addView(text("Lesson could not be rendered: "+e.getMessage(),16,Color.WHITE,false)); }
    }

    private void addKeeper(int placement) {
        try {
            JSONArray k=current.optJSONArray("keeper"); List<JSONObject> found=new ArrayList<>();
            if(k!=null) for(int i=0;i<k.length();i++) if(k.getJSONObject(i).optInt("placement")==placement) found.add(k.getJSONObject(i));
            if(found.isEmpty()) {
                String[] fallback=marathi?new String[]{"क्षणभर थांबा—या कल्पनेचा उलटा विचार केला तर काय बदलते?","पुरावा आणि आत्मविश्वास हे एकच नसतात.","हा नमुना तुमच्या दैनंदिन आयुष्यात कुठे दिसतो?"}:new String[]{"Pause: what changes if you reverse the assumption?","Evidence and confidence are not the same thing.","Where does this mechanism appear in your ordinary life?"};
                for(String line:fallback) page.addView(keeperCard(line,"question"),lp(-1,-2,0,0,0,dp(9)));
            } else for(JSONObject x:found) page.addView(keeperCard(marathi?x.optString("marathi"):x.optString("english"),x.optString("kind")),lp(-1,-2,0,0,0,dp(9)));
        }catch(Exception ignored){}
    }

    private View keeperCard(String line,String kind){
        LinearLayout c=card(Color.rgb(31,39,29),22,dp(12)); c.setOrientation(LinearLayout.HORIZONTAL); c.setGravity(Gravity.CENTER_VERTICAL);
        TextView face=text("🧔🏽‍♂️",44,Color.WHITE,false); face.setGravity(Gravity.CENTER); c.addView(face,new LinearLayout.LayoutParams(dp(68),dp(78)));
        LinearLayout words=new LinearLayout(this); words.setOrientation(LinearLayout.VERTICAL); words.addView(text(marathi?"गुहा रक्षक":"CAVE KEEPER",10,GOLD,true)); words.addView(text(line,16,Color.rgb(255,248,232),true)); words.addView(text(kind.toUpperCase(),9,MUTED,true)); c.addView(words,new LinearLayout.LayoutParams(0,-2,1)); return c;
    }

    private View interaction(JSONObject i)throws Exception{
        LinearLayout box=card(Color.rgb(255,247,230),18,dp(14)); box.addView(text(marathi?"तुमचा अंदाज काय?":"What do you predict?",19,INK,true)); box.addView(text(i.optString("question"),16,INK,false));
        JSONArray opts=i.optJSONArray("options"); if(opts!=null) for(int x=0;x<opts.length();x++){Button o=button(opts.getString(x),Color.WHITE,INK); box.addView(o,lp(-1,-2,0,dp(4),dp(4),0));}
        Button reveal=button(marathi?"उत्तर उघडा":"Reveal",GOLD,INK); TextView answer=text(i.optString("reveal"),15,INK,false); answer.setVisibility(View.GONE); reveal.setOnClickListener(v->answer.setVisibility(View.VISIBLE)); box.addView(reveal,lp(-1,dp(45),0,dp(6),dp(6),0)); box.addView(answer); return box;
    }

    private void showQuiz(){
        resetPage(true);
        try{
            JSONObject content=current.getJSONObject(marathi?"marathi":"english"); JSONArray qs=content.getJSONArray("quiz"); if(quizIndex>=qs.length()){getPreferences(MODE_PRIVATE).edit().putBoolean(currentDate+"|"+current.optString("id")+"|quiz",true).apply();showLesson();return;}
            JSONObject q=qs.getJSONObject(quizIndex); addKeeper(7); LinearLayout box=paper(); box.addView(eyebrow((quizIndex+1)+" / "+qs.length())); box.addView(text(q.optString("scenario"),16,Color.rgb(109,89,69),true)); box.addView(text(q.optString("question"),23,INK,true)); JSONArray options=q.getJSONArray("options"); int correct=q.optInt("answerIndex");
            TextView feedback=text("",15,INK,false); feedback.setVisibility(View.GONE);
            for(int i=0;i<options.length();i++){final int n=i;Button o=button(options.getString(i),Color.WHITE,INK);o.setGravity(Gravity.START|Gravity.CENTER_VERTICAL);o.setOnClickListener(v->{feedback.setText((n==correct?(marathi?"बरोबर. ":"Correct. "):(marathi?"पुन्हा विचार करा. ":"Not quite. "))+q.optString("explanation"));feedback.setVisibility(View.VISIBLE);});box.addView(o,lp(-1,-2,0,dp(4),dp(4),0));}
            box.addView(feedback); Button next=button(quizIndex==qs.length()-1?(marathi?"पूर्ण करा":"Finish"):(marathi?"पुढे":"Next"),GOLD,INK);next.setOnClickListener(v->{quizIndex++;showQuiz();});box.addView(next,lp(-1,dp(50),0,dp(10),dp(10),0));page.addView(box);
        }catch(Exception e){page.addView(text("Quiz could not be rendered",18,Color.WHITE,true));}
    }

    private void goBack(){ if(current==null){finish();return;} if(!nav.isEmpty()&&"lesson".equals(nav.peek())){nav.pop();showLesson();}else{current=null;showHome();} }
    @Override public void onBackPressed(){goBack();}

    private LinearLayout paper(){return card(PAPER,27,dp(22));}
    private LinearLayout card(int color,int radius,int padding){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);l.setPadding(padding,padding,padding,padding);l.setBackground(round(color,radius));return l;}
    private GradientDrawable round(int color,int radius){GradientDrawable g=new GradientDrawable();g.setColor(color);g.setCornerRadius(dp(radius));g.setStroke(dp(1),Color.argb(35,255,255,255));return g;}
    private TextView eyebrow(String s){TextView t=text(s.toUpperCase(),11,Color.rgb(164,68,44),true);t.setLetterSpacing(.12f);return t;}
    private TextView text(String s,float sp,int color,boolean bold){TextView t=new TextView(this);t.setText(s);t.setTextSize(sp);t.setTextColor(color);t.setLineSpacing(0,1.25f);t.setPadding(0,dp(5),0,dp(5));t.setTypeface(bold?Typeface.create("serif",Typeface.BOLD):Typeface.create("serif",Typeface.NORMAL));return t;}
    private Button button(String s,int bg,int fg){Button b=new Button(this);b.setText(s);b.setTextColor(fg);b.setTextSize(14);b.setAllCaps(false);b.setTypeface(Typeface.DEFAULT_BOLD);b.setBackground(round(bg,14));b.setPadding(dp(12),dp(8),dp(12),dp(8));b.setEllipsize(TextUtils.TruncateAt.END);return b;}
    private LinearLayout.LayoutParams lp(int w,int h,int l,int t,int r,int b){LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(w,h);p.setMargins(l,t,r,b);return p;}
    private int dp(int n){return Math.round(n*getResources().getDisplayMetrics().density);}
}
