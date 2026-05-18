import { useState, useEffect, useRef } from "react";

const C = {
  bg:"#05050f", surface:"#0c0c1e", card:"#10102a",
  border:"rgba(99,102,241,0.25)",
  neon1:"#6366f1", neon2:"#06b6d4", neon3:"#f59e0b", neon4:"#ec4899",
  text:"#e8e8ff", muted:"#6b6b9a", success:"#10b981", error:"#f43f5e",
};

const STEPS = [
  { icon:"✍", label:"Script", sub:"& Lyrics", desc:"Write your script, lyrics & scene prompts" },
  { icon:"🎵", label:"Music",  sub:"Suno AI",  desc:"Generate a full song with real vocals" },
  { icon:"🎙", label:"Voice",  sub:"ElevenLabs", desc:"Synthesize a cinematic voiceover" },
  { icon:"🎬", label:"Video",  sub:"Luma AI", desc:"Render your video scenes with AI" },
];

const VOICES = [
  { id:"21m00Tcm4TlvDq8ikWAM", name:"Rachel — Female, Calm" },
  { id:"AZnzlk1XvdvUeBnXmlld", name:"Domi — Female, Strong" },
  { id:"EXAVITQu4vr4xnSDxMaL", name:"Bella — Female, Soft" },
  { id:"ErXwobaYiN019PkySvjV", name:"Antoni — Male, Warm" },
  { id:"pNInz6obpgDQGcFmaJgB", name:"Adam — Male, Deep" },
  { id:"VR6AewLTigWG4xSOukaG", name:"Arnold — Male, Crisp" },
];

/* ─── PRIMITIVES ─────────────────────────────────────────────── */
function Glow({ color=C.neon1, size=400, x="50%", y="50%", opacity=0.09 }) {
  return <div style={{ position:"absolute", pointerEvents:"none", borderRadius:"50%",
    width:size, height:size, left:x, top:y, transform:"translate(-50%,-50%)",
    background:color, filter:`blur(${size*0.42}px)`, opacity }} />;
}

function Spinner({ color=C.neon2, size=13 }) {
  return <span style={{ display:"inline-block", width:size, height:size,
    border:`2px solid ${color}30`, borderTop:`2px solid ${color}`,
    borderRadius:"50%", animation:"spin 0.7s linear infinite",
    verticalAlign:"middle", marginRight:7 }} />;
}

function StatusPill({ status }) {
  const map = { idle:{c:C.muted,l:"Ready"}, loading:{c:C.neon2,l:"Working..."}, done:{c:C.success,l:"Done ✓"}, error:{c:C.error,l:"Error"}, skipped:{c:C.muted,l:"Skipped"} };
  const s = map[status]||map.idle;
  return <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, fontWeight:800,
    color:s.c, fontFamily:"'Syne',sans-serif", letterSpacing:1 }}>
    <span style={{ width:7,height:7,borderRadius:"50%",background:s.c,marginRight:6,
      boxShadow:`0 0 8px ${s.c}`, animation:status==="loading"?"pulse 1.2s ease-in-out infinite":"none" }} />
    {s.l}
  </span>;
}

const inp = { background:"#08081a", border:`1px solid ${C.border}`, borderRadius:10,
  color:C.text, padding:"11px 14px", width:"100%", fontSize:13,
  fontFamily:"'Syne',sans-serif", outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" };
const lbl = { display:"block", fontSize:10, fontWeight:800, letterSpacing:2,
  color:C.neon2, marginBottom:7, textTransform:"uppercase", fontFamily:"'Syne',sans-serif" };

function Field({ label:l, children }) {
  return <div style={{ marginBottom:14 }}><label style={lbl}>{l}</label>{children}</div>;
}
function FocusInp(props) {
  const [f,setF]=useState(false);
  return <input {...props} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
    style={{ ...inp, ...props.style, borderColor:f?C.neon1:C.border }} />;
}
function FocusTxta(props) {
  const [f,setF]=useState(false);
  return <textarea {...props} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
    style={{ ...inp, resize:"vertical", lineHeight:1.7, ...props.style, borderColor:f?C.neon1:C.border }} />;
}
function Sel({ children, ...props }) {
  return <select {...props} style={{ ...inp, cursor:"pointer", appearance:"none", ...props.style }}>{children}</select>;
}

function BtnPrimary({ children, disabled, onClick, style:s, color }) {
  const [h,setH]=useState(false);
  const grad = color ? `linear-gradient(135deg,${color}dd,${color}88)` : `linear-gradient(135deg,${C.neon1},${C.neon4})`;
  const glow = color || C.neon1;
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ background:grad, border:"none", borderRadius:10, color:"#fff",
      fontWeight:800, fontSize:13, padding:"12px 24px",
      cursor:disabled?"not-allowed":"pointer", fontFamily:"'Syne',sans-serif", letterSpacing:1,
      opacity:disabled?0.5:1, boxShadow:h&&!disabled?`0 0 28px ${glow}60`:"none",
      transform:h&&!disabled?"translateY(-2px)":"none",
      transition:"all 0.2s", ...s }}>
    {children}
  </button>;
}
function BtnGhost({ children, onClick, active, color=C.neon1, disabled }) {
  const [h,setH]=useState(false);
  return <button onClick={onClick} disabled={disabled}
    onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    style={{ background:active?`${color}18`:h?`${color}0e`:"transparent",
      border:`1px solid ${active?color:h?`${color}60`:C.border}`,
      borderRadius:9, color:active?color:C.muted, fontWeight:700, fontSize:12,
      padding:"9px 18px", cursor:disabled?"not-allowed":"pointer",
      fontFamily:"'Syne',sans-serif", letterSpacing:0.8, transition:"all 0.18s",
      boxShadow:active?`0 0 12px ${color}30`:"none", opacity:disabled?0.4:1 }}>
    {children}
  </button>;
}
function Card({ color=C.neon1, title, children }) {
  return <div style={{ background:C.card, border:`1px solid ${color}40`,
    borderRadius:14, overflow:"hidden", boxShadow:`0 0 30px ${color}10`, animation:"fadeUp 0.4s ease" }}>
    <div style={{ padding:"12px 18px", borderBottom:`1px solid ${color}25`,
      background:`${color}0a`, display:"flex", alignItems:"center", gap:8 }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:color,boxShadow:`0 0 8px ${color}` }} />
      <span style={{ fontSize:11,fontWeight:800,color,letterSpacing:2,textTransform:"uppercase",fontFamily:"'Syne',sans-serif" }}>{title}</span>
    </div>
    <div style={{ padding:18 }}>{children}</div>
  </div>;
}
function EmptyState({ icon, title, sub }) {
  return <div style={{ height:"100%", minHeight:260, border:`1px dashed ${C.border}`, borderRadius:14,
    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, color:C.muted }}>
    <div style={{ fontSize:44, opacity:0.2 }}>{icon}</div>
    <div style={{ fontSize:12, fontFamily:"'Syne',sans-serif", fontWeight:800 }}>{title}</div>
    <div style={{ fontSize:11, fontFamily:"'Syne',sans-serif" }}>{sub}</div>
  </div>;
}

/* ─── AUTO MODE PANEL ─────────────────────────────────────────── */
function AutoModePanel({ apiKeys }) {
  const [brief, setBrief] = useState("");
  const [genre, setGenre] = useState("Afrobeats");
  const [mood, setMood] = useState("Energetic");
  const [lang, setLang] = useState("English");
  const [dur, setDur] = useState("3-5 min");
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM");
  const [videoEngine, setVideoEngine] = useState("luma");
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState({
    script: "idle", music: "idle", voice: "idle", video: "idle"
  });
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState({});
  const logsRef = useRef(null);

  const log = (msg, color=C.muted) => setLogs(p => [...p, { msg, color, ts: new Date().toLocaleTimeString() }]);
  const setStage = (k, v) => setStages(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const runPipeline = async () => {
    if (!brief.trim()) return;
    setRunning(true);
    setLogs([]);
    setResults({});
    setStages({ script:"idle", music:"idle", voice:"idle", video:"idle" });

    // ── STEP 1: Script ──────────────────────────────────────────
    log("⚡ Auto Mode started — running full pipeline...", C.neon1);
    log("✍  Generating script, lyrics & scene prompts...", C.neon2);
    setStage("script", "loading");

    let scriptText = "";
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true",
        },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          messages:[{ role:"user", content:
            `You are Videx AI — a bold, professional creative studio AI.\n\nCreate a full video script with scene descriptions, complete song lyrics (verse 1, pre-chorus, chorus, verse 2, bridge, outro), and numbered cinematic scene prompts optimized for AI video generation for a ${dur} ${genre} ${mood} ${lang} production about: "${brief}"\n\nUse headers: ## 🎬 VIDEO SCRIPT, ## 🎵 SONG LYRICS, ## 📽 SCENE PROMPTS\nMake it production-ready, vivid, and commercially powerful.`
          }],
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      scriptText = data.content?.find(b => b.type==="text")?.text || "";
      if (!scriptText) throw new Error("Empty response");
      setResults(p => ({ ...p, script: scriptText }));
      setStage("script", "done");
      log("✅ Script, lyrics & scene prompts ready.", C.success);
    } catch(e) {
      setStage("script", "error");
      log(`❌ Script failed: ${e.message}`, C.error);
      setRunning(false); return;
    }

    // ── STEP 2: Music ───────────────────────────────────────────
    if (!apiKeys.suno) {
      setStage("music", "skipped");
      log("⏭  Music skipped — no Suno API key.", C.muted);
    } else {
      log("🎵 Sending to Suno AI — composing your track...", C.neon3);
      setStage("music", "loading");
      try {
        const musicPrompt = scriptText.substring(0, 300) + ` Style: ${genre}, ${mood}`;
        const res = await fetch("https://api.sunoaiapi.com/api/v1/gateway/generate/music", {
          method:"POST",
          headers:{"Content-Type":"application/json","api-key":apiKeys.suno},
          body: JSON.stringify({ gpt_description_prompt:musicPrompt, make_instrumental:false, mv:"chirp-v3-5" }),
        });
        const data = await res.json();
        const songId = data?.data?.[0]?.song_id;
        if (songId) {
          log("⏳ Waiting for Suno to render track...", C.neon3);
          let musicDone = false;
          for (let i=0; i<30; i++) {
            await sleep(5000);
            const pr = await fetch(`https://api.sunoaiapi.com/api/v1/gateway/feed/${songId}`,{ headers:{"api-key":apiKeys.suno} });
            const pd = await pr.json();
            const s = pd?.data?.[0];
            if (s?.status==="complete" && s?.audio_url) {
              setResults(p => ({ ...p, music: s }));
              setStage("music", "done");
              log("✅ Music track ready.", C.success);
              musicDone = true; break;
            }
            if (s?.status==="error") break;
          }
          if (!musicDone) { setStage("music","error"); log("❌ Music generation failed.", C.error); }
        } else { setStage("music","error"); log("❌ Suno request failed.", C.error); }
      } catch { setStage("music","error"); log("❌ Music request failed.", C.error); }
    }

    // ── STEP 3: Voice ───────────────────────────────────────────
    if (!apiKeys.elevenlabs) {
      setStage("voice", "skipped");
      log("⏭  Voice skipped — no ElevenLabs API key.", C.muted);
    } else {
      log("🎙 Sending to ElevenLabs — synthesizing voiceover...", C.neon4);
      setStage("voice", "loading");
      try {
        const narration = scriptText.substring(0, 2500);
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method:"POST",
          headers:{"Content-Type":"application/json","xi-api-key":apiKeys.elevenlabs},
          body: JSON.stringify({ text:narration, model_id:"eleven_multilingual_v2",
            voice_settings:{ stability:0.5, similarity_boost:0.75 } }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setResults(p => ({ ...p, voice: url }));
          setStage("voice", "done");
          log("✅ Voiceover ready.", C.success);
        } else { setStage("voice","error"); log("❌ ElevenLabs failed.", C.error); }
      } catch { setStage("voice","error"); log("❌ Voice request failed.", C.error); }
    }

    // ── STEP 4: Video ───────────────────────────────────────────
    const hasVideoKey = !!apiKeys.luma;
    if (!hasVideoKey) {
      setStage("video", "skipped");
      log("⏭  Video skipped — no Luma AI API key.", C.muted);
    } else {
      log(`🎬 Sending first scene to Luma AI...`, C.neon2);
      setStage("video", "loading");
      const sceneMatch = scriptText.match(/scene prompt[s]?[:\s\n]+([\s\S]{0,500})/i);
      const scenePrompt = sceneMatch ? sceneMatch[1].trim() : scriptText.substring(0, 400);
      try {
        let videoUrl = "";
        const res = await fetch("https://api.lumalabs.ai/dream-machine/v1/generations", {
          method:"POST",
          headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKeys.luma}`},
          body: JSON.stringify({ prompt:scenePrompt, aspect_ratio:"16:9", loop:false }),
        });
        const d = await res.json();
        if (d?.id) {
          log("⏳ Luma rendering video... (1-3 min)", C.neon2);
          for (let i=0;i<40;i++) {
            await sleep(5000);
            const pr = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${d.id}`,{
              headers:{"Authorization":`Bearer ${apiKeys.luma}`}
            });
            const pd = await pr.json();
            if (pd?.state==="completed"&&pd?.assets?.video) { videoUrl=pd.assets.video; break; }
            if (pd?.state==="failed") break;
          }
        }
        if (videoUrl) {
          setResults(p => ({ ...p, video: videoUrl }));
          setStage("video", "done");
          log("✅ Video scene ready.", C.success);
        } else { setStage("video","error"); log("❌ Video generation failed.", C.error); }
      } catch { setStage("video","error"); log("❌ Video request failed.", C.error); }
    }

    log("🏁 Pipeline complete! All outputs ready below.", C.neon1);
    setRunning(false);
  };

  const allDone = Object.values(stages).every(s => s==="done"||s==="skipped"||s==="error");
  const stageList = [
    { key:"script", icon:"✍", label:"Script & Lyrics", color:C.neon1 },
    { key:"music",  icon:"🎵", label:"Music (Suno)", color:C.neon3 },
    { key:"voice",  icon:"🎙", label:"Voice (ElevenLabs)", color:C.neon4 },
    { key:"video",  icon:"🎬", label:"Video (Luma AI)", color:C.neon2 },
  ];

  return (
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
      {/* LEFT — brief + controls */}
      <div>
        {/* Auto Mode badge */}
        <div style={{ marginBottom:20, padding:"14px 18px",
          background:`linear-gradient(135deg,${C.neon1}15,${C.neon4}10)`,
          border:`1px solid ${C.neon1}40`, borderRadius:14,
          boxShadow:`0 0 30px ${C.neon1}15` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:C.neon1,
              boxShadow:`0 0 10px ${C.neon1}`, animation:running?"pulse 1s infinite":"none" }} />
            <span style={{ fontSize:11,fontWeight:900,color:C.neon1,letterSpacing:3,fontFamily:"'Syne',sans-serif" }}>AUTO MODE</span>
          </div>
          <p style={{ fontSize:12, color:C.muted, fontFamily:"'Syne',sans-serif", lineHeight:1.6 }}>
            Describe your vision once. Videx runs the full pipeline — script, music, voice & video — automatically.
          </p>
        </div>

        <Field label="Your Creative Brief">
          <FocusTxta rows={3} value={brief} onChange={e=>setBrief(e.target.value)} disabled={running}
            placeholder="e.g. An Afrobeats anthem about rising from hardship, celebrating life on the lake..." />
        </Field>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
          <Field label="Genre"><Sel value={genre} onChange={e=>setGenre(e.target.value)} disabled={running}>
            {["Afrobeats","Pop","R&B","Hip-Hop","Reggae","Gospel","Dancehall","Amapiano","Electronic","Jazz","Folk"].map(g=><option key={g}>{g}</option>)}
          </Sel></Field>
          <Field label="Mood"><Sel value={mood} onChange={e=>setMood(e.target.value)} disabled={running}>
            {["Energetic","Uplifting","Romantic","Melancholic","Dramatic","Peaceful","Fierce","Nostalgic"].map(m=><option key={m}>{m}</option>)}
          </Sel></Field>
          <Field label="Language"><Sel value={lang} onChange={e=>setLang(e.target.value)} disabled={running}>
            {["English","French","Fon","Yoruba","Swahili","Spanish","Portuguese","Arabic","Hindi","Pidgin"].map(l=><option key={l}>{l}</option>)}
          </Sel></Field>
          <Field label="Duration"><Sel value={dur} onChange={e=>setDur(e.target.value)} disabled={running}>
            {["1-2 min","3-5 min","5-10 min","10-20 min","20+ min"].map(d=><option key={d}>{d}</option>)}
          </Sel></Field>
          <Field label="Voice"><Sel value={voiceId} onChange={e=>setVoiceId(e.target.value)} disabled={running}>
            {VOICES.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
          </Sel></Field>
        </div>

        <BtnPrimary onClick={runPipeline} disabled={running||!brief.trim()} style={{ width:"100%", padding:"15px", fontSize:15 }}>
          {running ? <><Spinner size={15} />&nbsp;Running Pipeline...</> : "⚡ Run Full Pipeline"}
        </BtnPrimary>

        {/* Stage tracker */}
        <div style={{ marginTop:18, display:"flex", flexDirection:"column", gap:8 }}>
          {stageList.map(({ key, icon, label, color }) => (
            <div key={key} style={{
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"10px 14px", borderRadius:10,
              background: stages[key]==="loading" ? `${color}12` : stages[key]==="done" ? `${C.success}0a` : `${C.card}`,
              border:`1px solid ${stages[key]==="loading"?color:stages[key]==="done"?C.success:C.border}`,
              transition:"all 0.3s",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>{icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color: stages[key]==="done"?C.success:stages[key]==="loading"?color:C.muted,
                  fontFamily:"'Syne',sans-serif" }}>{label}</span>
              </div>
              <StatusPill status={stages[key]} />
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — live log + results */}
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {/* Live log */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, overflow:"hidden" }}>
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${C.border}`,
            background:`${C.neon1}08`, display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:6,height:6,borderRadius:"50%",background:running?C.neon2:C.muted,
              boxShadow:running?`0 0 8px ${C.neon2}`:"none",
              animation:running?"pulse 1s infinite":"none" }} />
            <span style={{ fontSize:11,fontWeight:800,color:C.neon1,letterSpacing:2,fontFamily:"'Syne',sans-serif" }}>PIPELINE LOG</span>
          </div>
          <div ref={logsRef} style={{ padding:14, height:180, overflowY:"auto",
            fontFamily:"'Syne',sans-serif", fontSize:12, lineHeight:1.8 }}>
            {logs.length===0 ? (
              <div style={{ color:C.muted, textAlign:"center", marginTop:40 }}>Waiting to start...</div>
            ) : logs.map((l,i) => (
              <div key={i} style={{ color:l.color, marginBottom:2 }}>
                <span style={{ color:C.muted, fontSize:10, marginRight:8 }}>{l.ts}</span>{l.msg}
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {results.script && (
          <Card title="Script & Lyrics" color={C.neon1}>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:8 }}>
              <BtnGhost onClick={()=>navigator.clipboard.writeText(results.script)} color={C.neon1}>Copy</BtnGhost>
            </div>
            <pre style={{ color:C.text, fontSize:11, lineHeight:1.8, whiteSpace:"pre-wrap",
              fontFamily:"'Syne',sans-serif", margin:0, maxHeight:200, overflowY:"auto" }}>
              {results.script}
            </pre>
          </Card>
        )}

        {results.music && (
          <Card title="Music Track" color={C.neon3}>
            <div style={{ fontSize:13,fontWeight:800,color:C.text,marginBottom:10,fontFamily:"'Syne',sans-serif" }}>
              {results.music.title||"Untitled Track"}
            </div>
            <audio controls src={results.music.audio_url} style={{ width:"100%", marginBottom:10, borderRadius:8 }} />
            <a href={results.music.audio_url} download style={{ textDecoration:"none" }}>
              <BtnGhost color={C.neon3}>⬇ Download MP3</BtnGhost>
            </a>
          </Card>
        )}

        {results.voice && (
          <Card title="Voiceover" color={C.neon4}>
            <audio controls src={results.voice} style={{ width:"100%", marginBottom:10, borderRadius:8 }} />
            <a href={results.voice} download="videx-voice.mp3" style={{ textDecoration:"none" }}>
              <BtnGhost color={C.neon4}>⬇ Download Audio</BtnGhost>
            </a>
          </Card>
        )}

        {results.video && (
          <Card title="Video Scene" color={C.neon2}>
            <video controls src={results.video} style={{ width:"100%", borderRadius:10, marginBottom:10 }} />
            <a href={results.video} download="videx-scene.mp4" style={{ textDecoration:"none" }}>
              <BtnGhost color={C.neon2}>⬇ Download MP4</BtnGhost>
            </a>
          </Card>
        )}

        {!running && logs.length===0 && (
          <EmptyState icon="⚡" title="Pipeline output appears here" sub="Hit Run Full Pipeline to start" />
        )}
      </div>
    </div>
  );
}

/* ─── MANUAL PANELS (Script / Music / Voice / Video) ─────────── */
function ScriptPanel({ onReady }) {
  const [topic,setTopic]=useState(""); const [genre,setGenre]=useState("Afrobeats");
  const [mood,setMood]=useState("Energetic"); const [lang,setLang]=useState("English");
  const [dur,setDur]=useState("3-5 min");
  const [checks,setChecks]=useState({script:true,lyrics:true,scenes:true});
  const [status,setStatus]=useState("idle"); const [out,setOut]=useState(""); const [err,setErr]=useState("");
  const go=async()=>{
    if(!topic.trim())return; setStatus("loading");setErr("");setOut("");
    const want=[];
    if(checks.script) want.push("a full video script with scene descriptions");
    if(checks.lyrics) want.push("complete song lyrics (verse 1, pre-chorus, chorus, verse 2, bridge, outro)");
    if(checks.scenes) want.push("numbered cinematic scene prompts optimized for AI video generation");
    try {
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,
          messages:[{role:"user",content:`You are Videx AI — a bold, professional creative studio AI.\n\nCreate ${want.join(", ")} for a ${dur} ${genre} ${mood} ${lang} production about: "${topic}"\n\nUse headers: ## 🎬 VIDEO SCRIPT, ## 🎵 SONG LYRICS, ## 📽 SCENE PROMPTS\nMake it production-ready, vivid, and commercially powerful.`}]}),
      });
      const data=await res.json();
      const text=data.content?.find(b=>b.type==="text")?.text||"";
      setOut(text);setStatus("done");onReady(text);
    } catch { setErr("Generation failed.");setStatus("error"); }
  };
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
    <div>
      <Field label="Topic / Creative Vision"><FocusTxta rows={3} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Rising from hardship, a night in Lagos, first love on the water..." /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:14}}>
        <Field label="Genre"><Sel value={genre} onChange={e=>setGenre(e.target.value)}>{["Afrobeats","Pop","R&B","Hip-Hop","Reggae","Gospel","Dancehall","Amapiano","Electronic","Jazz","Folk"].map(g=><option key={g}>{g}</option>)}</Sel></Field>
        <Field label="Mood"><Sel value={mood} onChange={e=>setMood(e.target.value)}>{["Energetic","Uplifting","Romantic","Melancholic","Dramatic","Peaceful","Fierce","Nostalgic"].map(m=><option key={m}>{m}</option>)}</Sel></Field>
        <Field label="Language"><Sel value={lang} onChange={e=>setLang(e.target.value)}>{["English","French","Fon","Yoruba","Swahili","Spanish","Portuguese","Arabic","Hindi","Pidgin"].map(l=><option key={l}>{l}</option>)}</Sel></Field>
        <Field label="Duration"><Sel value={dur} onChange={e=>setDur(e.target.value)}>{["1-2 min","3-5 min","5-10 min","10-20 min","20+ min"].map(d=><option key={d}>{d}</option>)}</Sel></Field>
      </div>
      <div style={{display:"flex",gap:18,marginBottom:20}}>
        {[["script","📄 Script"],["lyrics","🎵 Lyrics"],["scenes","🎬 Scenes"]].map(([k,l])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:12,color:checks[k]?C.neon2:C.muted,fontFamily:"'Syne',sans-serif",fontWeight:700}}>
            <input type="checkbox" checked={checks[k]} onChange={e=>setChecks(p=>({...p,[k]:e.target.checked}))} style={{accentColor:C.neon1,width:14,height:14}} />{l}
          </label>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <BtnPrimary onClick={go} disabled={status==="loading"||!topic.trim()}>{status==="loading"&&<Spinner />}{status==="loading"?"Generating...":"⚡ Generate"}</BtnPrimary>
        <StatusPill status={status} />
      </div>
      {err&&<div style={{color:C.error,fontSize:12,marginTop:10,fontFamily:"'Syne',sans-serif"}}>{err}</div>}
    </div>
    <div>{out?<Card title="Generated Content" color={C.neon1}><div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}><BtnGhost onClick={()=>navigator.clipboard.writeText(out)}>Copy All</BtnGhost></div><pre style={{color:C.text,fontSize:12,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'Syne',sans-serif",margin:0,maxHeight:360,overflowY:"auto"}}>{out}</pre></Card>:<EmptyState icon="✍" title="Your content appears here" sub="Fill the form and hit Generate" />}</div>
  </div>;
}

function MusicPanel({ apiKeys, script }) {
  const [prompt,setPrompt]=useState(""); const [tags,setTags]=useState("");
  const [status,setStatus]=useState("idle"); const [result,setResult]=useState(null); const [err,setErr]=useState("");
  useEffect(()=>{ if(script)setPrompt(script.substring(0,300)); },[script]);
  const poll=async(id)=>{
    for(let i=0;i<30;i++){
      await new Promise(r=>setTimeout(r,5000));
      try{ const res=await fetch(`https://api.sunoaiapi.com/api/v1/gateway/feed/${id}`,{headers:{"api-key":apiKeys.suno}});
        const data=await res.json(); const s=data?.data?.[0];
        if(s?.status==="complete"&&s?.audio_url){setResult(s);setStatus("done");return;}
        if(s?.status==="error"){setErr("Suno failed.");setStatus("error");return;}
      }catch{}
    }
    setErr("Timed out.");setStatus("error");
  };
  const go=async()=>{
    if(!apiKeys.suno){setErr("Add your Suno AI key in ⚙ Settings.");return;}
    setStatus("loading");setErr("");setResult(null);
    try{
      const res=await fetch("https://api.sunoaiapi.com/api/v1/gateway/generate/music",{
        method:"POST",headers:{"Content-Type":"application/json","api-key":apiKeys.suno},
        body:JSON.stringify({gpt_description_prompt:prompt+(tags?` Style: ${tags}`:""),make_instrumental:false,mv:"chirp-v3-5"}),
      });
      const data=await res.json(); const id=data?.data?.[0]?.song_id;
      if(id)poll(id); else{setErr(data?.message||"Suno failed.");setStatus("error");}
    }catch{setErr("Request failed.");setStatus("error");}
  };
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
    <div>
      <div style={{marginBottom:16,padding:"12px 16px",background:`${C.neon3}0a`,border:`1px solid ${C.neon3}30`,borderRadius:10}}>
        <span style={{fontSize:10,fontWeight:800,color:C.neon3,letterSpacing:2,fontFamily:"'Syne',sans-serif"}}>SUNO AI</span>
        <p style={{fontSize:12,color:C.muted,marginTop:6,fontFamily:"'Syne',sans-serif",lineHeight:1.6}}>Full songs with real vocals & instruments from your prompt.</p>
      </div>
      <Field label="Music Prompt"><FocusTxta rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe the feel: mood, story, energy, instruments, vocal style..." /></Field>
      <Field label="Style Tags (optional)"><FocusInp value={tags} onChange={e=>setTags(e.target.value)} placeholder="e.g. afrobeats, female vocal, 120bpm, uplifting" /></Field>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <BtnPrimary onClick={go} disabled={status==="loading"} color={C.neon3}>{status==="loading"&&<Spinner color={C.neon3} />}{status==="loading"?"Composing...":"🎵 Generate Music"}</BtnPrimary>
        <StatusPill status={status} />
      </div>
      {err&&<div style={{color:C.error,fontSize:12,marginTop:10,fontFamily:"'Syne',sans-serif"}}>{err}</div>}
    </div>
    <div>{result?<Card title="Your Track" color={C.neon3}><div style={{fontSize:14,fontWeight:800,color:C.text,marginBottom:14,fontFamily:"'Syne',sans-serif"}}>{result.title||"Untitled Track"}</div><audio controls src={result.audio_url} style={{width:"100%",marginBottom:14,borderRadius:8}} /><a href={result.audio_url} download style={{textDecoration:"none"}}><BtnGhost color={C.neon3}>⬇ Download MP3</BtnGhost></a></Card>:<EmptyState icon="🎵" title="Music plays here" sub="Takes ~30-60s after generating" />}</div>
  </div>;
}

function VoicePanel({ apiKeys, script }) {
  const [text,setText]=useState(""); const [voiceId,setVoiceId]=useState("21m00Tcm4TlvDq8ikWAM");
  const [stability,setStability]=useState(0.5); const [status,setStatus]=useState("idle");
  const [audioUrl,setAudioUrl]=useState(""); const [err,setErr]=useState("");
  useEffect(()=>{ if(script)setText(script.substring(0,2500)); },[script]);
  const go=async()=>{
    if(!apiKeys.elevenlabs){setErr("Add your ElevenLabs key in ⚙ Settings.");return;}
    setStatus("loading");setErr("");setAudioUrl("");
    try{
      const res=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,{
        method:"POST",headers:{"Content-Type":"application/json","xi-api-key":apiKeys.elevenlabs},
        body:JSON.stringify({text:text.substring(0,2500),model_id:"eleven_multilingual_v2",voice_settings:{stability,similarity_boost:0.75}}),
      });
      if(!res.ok){setErr("ElevenLabs failed.");setStatus("error");return;}
      const blob=await res.blob(); setAudioUrl(URL.createObjectURL(blob));setStatus("done");
    }catch{setErr("Request failed.");setStatus("error");}
  };
  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
    <div>
      <div style={{marginBottom:16,padding:"12px 16px",background:`${C.neon4}0a`,border:`1px solid ${C.neon4}30`,borderRadius:10}}>
        <span style={{fontSize:10,fontWeight:800,color:C.neon4,letterSpacing:2,fontFamily:"'Syne',sans-serif"}}>ELEVENLABS</span>
        <p style={{fontSize:12,color:C.muted,marginTop:6,fontFamily:"'Syne',sans-serif",lineHeight:1.6}}>Ultra-realistic AI voices in 30+ languages.</p>
      </div>
      <Field label={`Narration Text (${text.length}/2500)`}><FocusTxta rows={6} value={text} onChange={e=>setText(e.target.value)} placeholder="Paste your script or narration here..." /></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
        <Field label="Voice"><Sel value={voiceId} onChange={e=>setVoiceId(e.target.value)}>{VOICES.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</Sel></Field>
        <Field label={`Stability: ${stability}`}><input type="range" min="0" max="1" step="0.05" value={stability} onChange={e=>setStability(parseFloat(e.target.value))} style={{width:"100%",accentColor:C.neon4,marginTop:10}} /></Field>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <BtnPrimary onClick={go} disabled={status==="loading"} color={C.neon4}>{status==="loading"&&<Spinner color={C.neon4} />}{status==="loading"?"Synthesizing...":"🎙 Generate Voice"}</BtnPrimary>
        <StatusPill status={status} />
      </div>
      {err&&<div style={{color:C.error,fontSize:12,marginTop:10,fontFamily:"'Syne',sans-serif"}}>{err}</div>}
    </div>
    <div>{audioUrl?<Card title="Voiceover" color={C.neon4}><audio controls src={audioUrl} style={{width:"100%",marginBottom:14,borderRadius:8}} /><a href={audioUrl} download="videx-voice.mp3" style={{textDecoration:"none"}}><BtnGhost color={C.neon4}>⬇ Download Audio</BtnGhost></a></Card>:<EmptyState icon="🎙" title="Voiceover appears here" sub="Pick a voice and generate" />}</div>
  </div>;
}

function VideoPanel({ apiKeys, script }) {
  const [prompt,setPrompt]=useState("");
  const [status,setStatus]=useState("idle"); const [videoUrl,setVideoUrl]=useState("");
  const [err,setErr]=useState(""); const [elapsed,setElapsed]=useState(0);
  const timer=useRef(null);
  useEffect(()=>{ if(script){ const m=script.match(/scene prompt[s]?[:\s\n]+([\s\S]{0,500})/i); setPrompt(m?m[1].trim():script.substring(0,400)); } },[script]);
  useEffect(()=>{
    if(status==="loading"){setElapsed(0);timer.current=setInterval(()=>setElapsed(p=>p+1),1000);}
    else clearInterval(timer.current);
    return()=>clearInterval(timer.current);
  },[status]);
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const pollLuma=async(id)=>{
    for(let i=0;i<40;i++){
      await new Promise(r=>setTimeout(r,5000));
      try{ const res=await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${id}`,{headers:{"Authorization":`Bearer ${apiKeys.luma}`}});
        const d=await res.json();
        if(d?.state==="completed"&&d?.assets?.video){setVideoUrl(d.assets.video);setStatus("done");return;}
        if(d?.state==="failed"){setErr("Luma failed.");setStatus("error");return;}
      }catch{}
    }
    setErr("Timed out.");setStatus("error");
  };

  const go=async()=>{
    if(!apiKeys.luma){setErr("Add your Luma AI key in ⚙ Settings.");return;}
    setStatus("loading");setErr("");setVideoUrl("");
    try{
      const res=await fetch("https://api.lumalabs.ai/dream-machine/v1/generations",{
        method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKeys.luma}`},
        body:JSON.stringify({prompt,aspect_ratio:"16:9",loop:false}),
      });
      const d=await res.json();
      if(d?.id)pollLuma(d.id); else{setErr(d?.detail||"Luma failed.");setStatus("error");}
    }catch{setErr("Request failed.");setStatus("error");}
  };

  return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
    <div>
      <div style={{marginBottom:16,padding:"12px 16px",background:`${C.neon2}0a`,border:`1px solid ${C.neon2}30`,borderRadius:10}}>
        <span style={{fontSize:10,fontWeight:800,color:C.neon2,letterSpacing:2,fontFamily:"'Syne',sans-serif"}}>LUMA AI</span>
        <p style={{fontSize:12,color:C.muted,marginTop:6,fontFamily:"'Syne',sans-serif",lineHeight:1.6}}>Fast, cinematic AI video — great for music videos, b-roll & product shots.</p>
      </div>
      <Field label="Scene Description"><FocusTxta rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Cinematic scene: setting, lighting, camera movement, characters, mood..." /></Field>
      <div style={{background:`${C.neon2}0a`,border:`1px solid ${C.neon2}25`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:12,color:C.muted,fontFamily:"'Syne',sans-serif",lineHeight:1.6}}>
        ⏱ Video takes <strong style={{color:C.neon2}}>1–3 minutes</strong>. Keep this tab open.
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <BtnPrimary onClick={go} disabled={status==="loading"} color={C.neon2}>{status==="loading"&&<Spinner color={C.neon2} />}{status==="loading"?`Rendering… ${fmt(elapsed)}`:"🎬 Generate Video"}</BtnPrimary>
        <StatusPill status={status} />
      </div>
      {err&&<div style={{color:C.error,fontSize:12,marginTop:10,fontFamily:"'Syne',sans-serif"}}>{err}</div>}
    </div>
    <div>{videoUrl?<Card title="Generated Scene" color={C.neon2}><video controls src={videoUrl} style={{width:"100%",borderRadius:10,marginBottom:14}} /><a href={videoUrl} download="videx-scene.mp4" style={{textDecoration:"none"}}><BtnGhost color={C.neon2}>⬇ Download MP4</BtnGhost></a></Card>:<EmptyState icon="🎬" title="Video renders here" sub="Fast, cinematic quality with Luma AI" />}</div>
  </div>;
}

/* ─── SETTINGS ───────────────────────────────────────────────── */
function Settings({ keys, setKeys, onClose }) {
  const [local,setLocal]=useState({...keys}); const [show,setShow]=useState({});
  const fields=[{k:"suno",label:"Suno AI",color:C.neon3},{k:"elevenlabs",label:"ElevenLabs",color:C.neon4},{k:"luma",label:"Luma AI",color:C.neon1}];
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000,backdropFilter:"blur(10px)"}}>
    <div style={{background:C.surface,border:`1px solid ${C.neon1}40`,borderRadius:18,padding:32,width:"min(460px,92vw)",boxShadow:`0 0 60px ${C.neon1}20`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <span style={{fontSize:18,fontWeight:900,fontFamily:"'Syne',sans-serif",background:`linear-gradient(135deg,${C.neon1},${C.neon2})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>API Keys</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22}}>✕</button>
      </div>
      {fields.map(({k,label:l,color})=>(
        <div key={k} style={{marginBottom:14}}>
          <label style={{...lbl,color}}>{l}</label>
          <div style={{position:"relative"}}>
            <input type={show[k]?"text":"password"} value={local[k]} onChange={e=>setLocal(p=>({...p,[k]:e.target.value}))} placeholder={`Your ${l} API key`} style={{...inp,paddingRight:52}} />
            <button onClick={()=>setShow(p=>({...p,[k]:!p[k]}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color,cursor:"pointer",fontSize:10,fontWeight:800,letterSpacing:1,fontFamily:"'Syne',sans-serif"}}>{show[k]?"HIDE":"SHOW"}</button>
          </div>
        </div>
      ))}
      <BtnPrimary onClick={()=>{setKeys(local);onClose();}} style={{width:"100%",marginTop:10}}>Save Keys</BtnPrimary>
      <p style={{fontSize:10,color:C.muted,marginTop:12,fontFamily:"'Syne',sans-serif",lineHeight:1.7}}>Keys live in memory only — cleared when you close this tab.</p>
    </div>
  </div>;
}

/* ─── ROOT ───────────────────────────────────────────────────── */
const ALL_TABS = [
  { id:"auto",   icon:"⚡", label:"Auto Mode" },
  { id:"script", icon:"✍", label:"Script" },
  { id:"music",  icon:"🎵", label:"Music" },
  { id:"voice",  icon:"🎙", label:"Voice" },
  { id:"video",  icon:"🎬", label:"Video" },
];

export default function App() {
  const [tab,setTab]=useState("auto");
  const [keys,setKeys]=useState({suno:"",elevenlabs:"",luma:""});
  const [showSettings,setShowSettings]=useState(false);
  const [script,setScript]=useState("");
  const keysSet=Object.values(keys).some(v=>v.length>0);

  return <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:${C.bg};font-family:'Syne',sans-serif}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.8)}}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:${C.neon1}50;border-radius:2px}
      select option{background:${C.surface};color:${C.text}}
    `}</style>

    <div style={{minHeight:"100vh",background:C.bg,color:C.text,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <Glow color={C.neon1} size={700} x="5%" y="15%" opacity={0.07} />
        <Glow color={C.neon4} size={500} x="95%" y="55%" opacity={0.06} />
        <Glow color={C.neon2} size={400} x="55%" y="95%" opacity={0.05} />
      </div>

      {/* HEADER */}
      <header style={{position:"sticky",top:0,zIndex:100,background:"rgba(5,5,15,0.9)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",height:58}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <div style={{width:32,height:32,borderRadius:9,background:`linear-gradient(135deg,${C.neon1},${C.neon4})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,boxShadow:`0 0 18px ${C.neon1}50`}}>⚡</div>
          <div>
            <div style={{fontSize:17,fontWeight:900,letterSpacing:3,background:`linear-gradient(135deg,${C.neon2},${C.neon1},${C.neon4})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>VIDEX</div>
            <div style={{fontSize:8,color:C.muted,letterSpacing:2,marginTop:-2}}>AI CREATOR STUDIO</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          {ALL_TABS.map((t,i)=>{
            const isAuto = t.id==="auto";
            const active = tab===t.id;
            return <div key={t.id} style={{display:"flex",alignItems:"center"}}>
              <button onClick={()=>setTab(t.id)} style={{
                background: active ? (isAuto?`linear-gradient(135deg,${C.neon1},${C.neon4})`:`linear-gradient(135deg,${C.neon1},${C.neon4})`) : "transparent",
                border: active?"none":`1px solid ${C.border}`,
                borderRadius:8, padding:"5px 13px", cursor:"pointer",
                color:active?"#fff":C.muted, fontSize:11, fontWeight:800, letterSpacing:0.8,
                fontFamily:"'Syne',sans-serif",
                boxShadow:active?`0 0 16px ${C.neon1}50`:"none",
                transition:"all 0.2s",
                ...(isAuto&&!active?{border:`1px solid ${C.neon1}60`,color:C.neon1}:{}),
              }}>{t.icon} {t.label}</button>
              {i<ALL_TABS.length-1&&i>0&&<div style={{width:1,height:16,background:C.border,margin:"0 2px"}} />}
            </div>;
          })}
        </div>

        <button onClick={()=>setShowSettings(true)} style={{
          background:keysSet?`${C.neon1}15`:"transparent",
          border:`1px solid ${keysSet?C.neon1:C.border}`,
          borderRadius:9,padding:"6px 15px",cursor:"pointer",
          color:keysSet?C.neon1:C.muted,fontSize:12,fontWeight:800,
          letterSpacing:1,fontFamily:"'Syne',sans-serif",
          boxShadow:keysSet?`0 0 12px ${C.neon1}30`:"none",transition:"all 0.2s",
        }}>⚙ {keysSet?"Keys ✓":"API Keys"}</button>
      </header>

      {/* CONTENT */}
      <main style={{padding:"26px 24px 60px",position:"relative",zIndex:1}}>
        <div style={{animation:"fadeUp 0.3s ease"}}>
          {tab==="auto"   && <AutoModePanel apiKeys={keys} />}
          {tab==="script" && <ScriptPanel onReady={setScript} />}
          {tab==="music"  && <MusicPanel apiKeys={keys} script={script} />}
          {tab==="voice"  && <VoicePanel apiKeys={keys} script={script} />}
          {tab==="video"  && <VideoPanel apiKeys={keys} script={script} />}
        </div>
      </main>
    </div>

    {showSettings&&<Settings keys={keys} setKeys={setKeys} onClose={()=>setShowSettings(false)} />}
  </>;
}
