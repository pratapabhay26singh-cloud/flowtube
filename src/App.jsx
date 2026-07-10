import React, { useState, useEffect } from "react";
import { Home, Search, Bell, User, Plus, Play, ThumbsUp, MessageCircle, Share2, X, ChevronLeft, Film } from "lucide-react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  onAuthStateChanged, updateProfile,
} from "firebase/auth";
import {
  collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc,
  arrayUnion, arrayRemove, setDoc, getDoc, serverTimestamp,
} from "firebase/firestore";

const CATEGORIES = ["All", "Gaming", "Music", "Education", "Tech", "Sports", "Shorts"];

const SAMPLE_VIDEOS = [
  { id: "v1", title: "Exploring the Himalayas: A Journey Through the Clouds", channel: "Wanderlust", cat: "Sports", views: 128000, time: "2 days ago", duration: "12:41", gradient: "linear-gradient(135deg,#3B82F6,#8B5CF6)", desc: "A breathtaking trip through Himachal's valleys, local culture, and food.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", subs: 245000, likedBy: [] },
  { id: "v2", title: "15-Minute Dal Makhani From Scratch", channel: "Kitchen Stories", cat: "Education", views: 89000, time: "5 days ago", duration: "8:12", gradient: "linear-gradient(135deg,#8B5CF6,#EC4899)", desc: "Restaurant-style Dal Makhani, made simple at home.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", subs: 512000, likedBy: [] },
  { id: "v3", title: "Learn React in 2026 — Full Course", channel: "CodeWithRaj", cat: "Tech", views: 340000, time: "1 week ago", duration: "45:03", gradient: "linear-gradient(135deg,#3B82F6,#06B6D4)", desc: "Go from zero to React mastery with hands-on projects.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", subs: 890000, likedBy: [] },
  { id: "v4", title: "Mumbai Street Food Tour", channel: "Foodie Trails", cat: "Education", views: 210000, time: "3 days ago", duration: "18:27", gradient: "linear-gradient(135deg,#F59E0B,#EC4899)", desc: "From vada pav to pani puri — Mumbai's best street food spots.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", subs: 178000, likedBy: [] },
  { id: "v5", title: "Cricket Highlights: Best Sixes of 2026", channel: "SportsDaily", cat: "Sports", views: 1200000, time: "1 day ago", duration: "10:05", gradient: "linear-gradient(135deg,#22C55E,#3B82F6)", desc: "The most explosive sixes of the year, all in one video.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", subs: 2100000, likedBy: [] },
  { id: "v6", title: "Lo-fi Beats to Study and Relax", channel: "Chillhop", cat: "Music", views: 67000, time: "6 hours ago", duration: "1:02:11", gradient: "linear-gradient(135deg,#8B5CF6,#3B82F6)", desc: "The perfect background music for studying or working.", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", subs: 95000, likedBy: [] },
];

const SHORTS = [
  { id: "s1", title: "Quick recipe hack", gradient: "linear-gradient(160deg,#3B82F6,#8B5CF6)" },
  { id: "s2", title: "60-sec workout", gradient: "linear-gradient(160deg,#EC4899,#8B5CF6)" },
  { id: "s3", title: "Life hack #12", gradient: "linear-gradient(160deg,#F59E0B,#EC4899)" },
  { id: "s4", title: "Funny moment", gradient: "linear-gradient(160deg,#22C55E,#3B82F6)" },
];

const C = { bg: "#0D1117", surface: "#161B22", glass: "rgba(22,27,34,0.7)", border: "rgba(148,163,184,0.15)", text: "#F8FAFC", muted: "#8B95A5", blue: "#3B82F6", purple: "#8B5CF6" };
const GRAD = `linear-gradient(135deg, ${C.blue}, ${C.purple})`;

function fmtViews(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M views";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K views";
  return (n || 0) + " views";
}

function Logo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={C.blue} />
          <stop offset="1" stopColor={C.purple} />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#lg)" opacity="0.15" />
      <path d="M14 12 L28 20 L14 28 Z" fill="url(#lg)" />
      <path d="M4 20 Q9 15 14 20 T24 20" fill="none" stroke="url(#lg)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function GlassCard({ children, style = {} }) {
  return <div style={{ background: C.glass, border: `1px solid ${C.border}`, borderRadius: 18, backdropFilter: "blur(10px)", ...style }}>{children}</div>;
}

function VideoCard({ video, onClick, horizontal, currentUid }) {
  const [hover, setHover] = useState(false);
  const likeCount = (video.likedBy || []).length;
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ cursor: "pointer", width: horizontal ? 220 : "100%", flexShrink: 0 }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 16, background: video.gradient, overflow: "hidden", marginBottom: 10, transition: "transform .2s", transform: hover ? "scale(1.02)" : "scale(1)" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: hover ? 1 : 0, transition: "opacity .2s", background: "rgba(13,17,23,0.35)" }}>
          <Play size={34} color="#F8FAFC" fill="#F8FAFC" />
        </div>
        <span style={{ position: "absolute", right: 6, bottom: 6, background: "rgba(13,17,23,0.85)", color: C.text, fontSize: 11.5, padding: "2px 7px", borderRadius: 6, fontWeight: 500 }}>{video.duration}</span>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: 13 }}>{video.channel[0]}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.text, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{video.title}</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>{video.channel}</div>
          <div style={{ fontSize: 12, color: C.muted }}>{fmtViews(video.views)} · {likeCount} likes</div>
        </div>
      </div>
    </div>
  );
}

export default function FlowTubeApp() {
  const [view, setView] = useState("home");
  const [videos, setVideos] = useState(SAMPLE_VIDEOS);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [category, setCategory] = useState("All");
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [mySubs, setMySubs] = useState([]);
  const [uploadForm, setUploadForm] = useState({ title: "", desc: "", cat: "Tech", color: GRAD });
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", mode: "login" });
  const [authError, setAuthError] = useState("");

  const activeVideo = videos.find(v => v.id === activeId);

  // Listen to auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthLoading(false);
      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        setMySubs(snap.exists() ? (snap.data().subscribedChannels || []) : []);
      } else {
        setMySubs([]);
      }
    });
    return () => unsub();
  }, []);

  // Live-sync uploaded videos from Firestore, merged with sample videos
  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const uploaded = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setVideos([...uploaded, ...SAMPLE_VIDEOS]);
    }, () => setVideos(SAMPLE_VIDEOS));
    return () => unsub();
  }, []);

  // Live-sync comments for the currently open video
  useEffect(() => {
    if (!activeId) { setComments([]); return; }
    const q = query(collection(db, "videos", activeId, "comments"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setComments(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => setComments([]));
    return () => unsub();
  }, [activeId]);

  const goWatch = (id) => { setActiveId(id); setView("watch"); };

  const toggleLike = async () => {
    if (!user) { setView("profile"); return; }
    if (!activeVideo || !activeVideo.createdAt) return; // only Firestore videos support likes
    const ref = doc(db, "videos", activeVideo.id);
    const liked = (activeVideo.likedBy || []).includes(user.uid);
    await updateDoc(ref, { likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
  };

  const toggleSub = async (channel) => {
    if (!user) { setView("profile"); return; }
    const ref = doc(db, "users", user.uid);
    const isSubbed = mySubs.includes(channel);
    const next = isSubbed ? mySubs.filter(c => c !== channel) : [...mySubs, channel];
    setMySubs(next);
    await setDoc(ref, { subscribedChannels: next }, { merge: true });
  };

  const addComment = async () => {
    if (!commentText.trim() || !activeId) return;
    if (!user) { setView("profile"); return; }
    await addDoc(collection(db, "videos", activeId, "comments"), {
      user: user.displayName || "User", text: commentText, createdAt: serverTimestamp(),
    });
    setCommentText("");
  };

  const submitUpload = async () => {
    if (!uploadForm.title.trim()) return;
    if (!user) { setView("profile"); return; }
    await addDoc(collection(db, "videos"), {
      title: uploadForm.title, channel: user.displayName || "User", cat: uploadForm.cat,
      views: 0, duration: "0:42", gradient: uploadForm.color, desc: uploadForm.desc || "No description.",
      src: SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)].src,
      subs: 0, likedBy: [], createdAt: serverTimestamp(),
    });
    setUploadForm({ title: "", desc: "", cat: "Tech", color: GRAD });
    setView("home");
  };

  const doAuth = async () => {
    setAuthError("");
    try {
      if (authForm.mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
        await updateProfile(cred.user, { displayName: authForm.name });
        setUser({ ...cred.user, displayName: authForm.name });
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      }
      setView("home");
    } catch (e) {
      setAuthError(e.message.replace("Firebase: ", ""));
    }
  };

  const doLogout = async () => { await signOut(auth); setView("home"); };

  const filtered = videos.filter(v =>
    (category === "All" || v.cat === category) &&
    (!query || v.title.toLowerCase().includes(query.toLowerCase()) || v.channel.toLowerCase().includes(query.toLowerCase()))
  );

  const NAV = [
    { key: "home", label: "Home", icon: Home },
    { key: "shorts", label: "Shorts", icon: Film },
    { key: "upload", label: "", icon: Plus, isCenter: true },
    { key: "notifications", label: "Alerts", icon: Bell },
    { key: "profile", label: "Profile", icon: User },
  ];

  const iLiked = user && activeVideo && (activeVideo.likedBy || []).includes(user.uid);
  const isSubbed = activeVideo && mySubs.includes(activeVideo.channel);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: C.bg, color: C.text, minHeight: "100vh", width: "100%", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 78 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input, textarea, button { font-family: 'Inter', sans-serif; }
        ::placeholder { color: #5b6472; }
        ::-webkit-scrollbar { display: none; }
        .chip { transition: all .15s; }
        .navicon { transition: transform .15s; }
        .navicon:active { transform: scale(0.9); }
      `}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.bg, padding: "14px 16px 10px" }}>
        {!searching ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setView("home")}>
              <Logo /><span style={{ fontWeight: 800, fontSize: 19, letterSpacing: -0.4 }}>FlowTube</span>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <Search size={21} style={{ cursor: "pointer" }} onClick={() => setSearching(true)} />
              {user ? (
                <div onClick={() => setView("profile")} style={{ width: 30, height: 30, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{(user.displayName || "U")[0].toUpperCase()}</div>
              ) : (
                <User size={21} style={{ cursor: "pointer" }} onClick={() => setView("profile")} />
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search videos or channels"
              style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "10px 16px", color: C.text, outline: "none", fontSize: 14 }} />
            <button onClick={() => { setSearching(false); setQuery(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 6 }}><X size={20} /></button>
          </div>
        )}
        {view === "home" && (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", marginTop: 14, paddingBottom: 2 }}>
            {CATEGORIES.map(cat => (
              <div key={cat} className="chip" onClick={() => setCategory(cat)} style={{ flexShrink: 0, padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", background: category === cat ? GRAD : C.surface, color: category === cat ? "#fff" : C.muted, border: `1px solid ${category === cat ? "transparent" : C.border}` }}>{cat}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 16px 20px" }}>
        {view === "home" && (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: "10px 0 10px", letterSpacing: 0.3 }}>TRENDING</div>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6, marginBottom: 8 }}>
              {[...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map(v => <VideoCard key={v.id} video={v} horizontal onClick={() => goWatch(v.id)} />)}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: "18px 0 10px", letterSpacing: 0.3 }}>SHORTS</div>
            <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 6, marginBottom: 8 }}>
              {SHORTS.map(s => (
                <div key={s.id} onClick={() => setView("shorts")} style={{ width: 108, height: 180, borderRadius: 16, background: s.gradient, flexShrink: 0, position: "relative", cursor: "pointer", display: "flex", alignItems: "flex-end", padding: 8 }}>
                  <Play size={22} color="#fff" fill="#fff" style={{ position: "absolute", top: 10, left: 10, opacity: 0.9 }} />
                  <span style={{ color: "#fff", fontSize: 11.5, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, margin: "18px 0 10px", letterSpacing: 0.3 }}>RECOMMENDED</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {filtered.map(v => <VideoCard key={v.id} video={v} onClick={() => goWatch(v.id)} />)}
              {filtered.length === 0 && <div style={{ color: C.muted, textAlign: "center", padding: 40, fontSize: 14 }}>No videos found.</div>}
            </div>
          </>
        )}

        {view === "shorts" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 18, margin: "10px 0 16px" }}>Shorts</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {SHORTS.concat(SHORTS.map(s => ({ ...s, id: s.id + "b" }))).map(s => (
                <div key={s.id} style={{ aspectRatio: "9/16", borderRadius: 16, background: s.gradient, position: "relative", cursor: "pointer", display: "flex", alignItems: "flex-end", padding: 10 }}>
                  <Play size={24} color="#fff" fill="#fff" style={{ position: "absolute", top: 12, left: 12, opacity: 0.9 }} />
                  <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 600 }}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === "watch" && activeVideo && (
          <div>
            <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, margin: "10px 0", fontSize: 13, padding: 0 }}><ChevronLeft size={16} /> Back</button>
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16, overflow: "hidden", background: "#000" }}>
              <video key={activeVideo.id} src={activeVideo.src} controls autoPlay style={{ width: "100%", height: "100%" }} />
            </div>
            <h1 style={{ fontWeight: 700, fontSize: 17, margin: "14px 0 8px", lineHeight: 1.3 }}>{activeVideo.title}</h1>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>{fmtViews(activeVideo.views)} · {(activeVideo.likedBy || []).length} likes</div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>{activeVideo.channel[0]}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{activeVideo.channel}</div>
                  <div style={{ fontSize: 11.5, color: C.muted }}>{((activeVideo.subs || 0) / 1000).toFixed(0)}K subscribers</div>
                </div>
              </div>
              <button onClick={() => toggleSub(activeVideo.channel)} style={{ background: isSubbed ? C.surface : GRAD, color: "#fff", border: isSubbed ? `1px solid ${C.border}` : "none", padding: "9px 18px", borderRadius: 20, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {isSubbed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, margin: "14px 0" }}>
              <button onClick={toggleLike} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, color: iLiked ? C.blue : C.text, borderRadius: 14, padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <ThumbsUp size={16} fill={iLiked ? C.blue : "none"} /> Like
              </button>
              <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 14, padding: "10px 0", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Share2 size={15} /> Share
              </button>
            </div>

            <GlassCard style={{ padding: "12px 14px", marginBottom: 18 }}>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>{activeVideo.desc}</p>
            </GlassCard>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <MessageCircle size={17} /><span style={{ fontWeight: 700, fontSize: 14 }}>{comments.length} Comments</span>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{user ? (user.displayName || "U")[0] : "G"}</div>
              <input value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder={user ? "Add a comment..." : "Log in to comment"}
                style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, color: C.text, padding: "6px 4px", outline: "none", fontSize: 14 }} />
            </div>
            {comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.user[0]}</div>
                <div><div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.user}</div><div style={{ fontSize: 13.5, marginTop: 2 }}>{c.text}</div></div>
              </div>
            ))}
          </div>
        )}

        {view === "upload" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 18, margin: "10px 0 4px" }}>Upload a video</h2>
            {!user ? (
              <div style={{ color: C.muted, fontSize: 14, padding: "20px 0" }}>Please <span style={{ color: C.blue, cursor: "pointer", fontWeight: 600 }} onClick={() => setView("profile")}>log in</span> to upload.</div>
            ) : (
              <>
                <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Metadata is saved to your database. Actual video-file hosting needs a storage add-on (see project README).</p>
                <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: 16, background: uploadForm.color, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.85)", fontSize: 13 }}>Thumbnail preview</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  {[GRAD, "linear-gradient(135deg,#F59E0B,#EC4899)", "linear-gradient(135deg,#22C55E,#3B82F6)", "linear-gradient(135deg,#EF4444,#8B5CF6)"].map(g => (
                    <div key={g} onClick={() => setUploadForm(f => ({ ...f, color: g }))} style={{ width: 42, height: 30, borderRadius: 8, background: g, cursor: "pointer", border: uploadForm.color === g ? `2px solid ${C.text}` : "2px solid transparent" }} />
                  ))}
                </div>
                <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>TITLE</label>
                <input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter a title"
                  style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, marginTop: 6, marginBottom: 16, outline: "none", fontSize: 14 }} />
                <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>CATEGORY</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <div key={cat} onClick={() => setUploadForm(f => ({ ...f, cat }))} style={{ padding: "6px 14px", borderRadius: 16, fontSize: 12.5, fontWeight: 600, cursor: "pointer", background: uploadForm.cat === cat ? GRAD : C.surface, color: uploadForm.cat === cat ? "#fff" : C.muted, border: `1px solid ${uploadForm.cat === cat ? "transparent" : C.border}` }}>{cat}</div>
                  ))}
                </div>
                <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>DESCRIPTION</label>
                <textarea value={uploadForm.desc} onChange={e => setUploadForm(f => ({ ...f, desc: e.target.value }))} placeholder="Tell viewers about your video" rows={4}
                  style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, marginTop: 6, marginBottom: 20, outline: "none", fontSize: 14, resize: "vertical" }} />
                <button onClick={submitUpload} style={{ width: "100%", background: GRAD, color: "#fff", border: "none", padding: "13px 0", borderRadius: 16, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Publish</button>
              </>
            )}
          </div>
        )}

        {view === "notifications" && (
          <div>
            <h2 style={{ fontWeight: 800, fontSize: 18, margin: "10px 0 16px" }}>Notifications</h2>
            {mySubs.length === 0 ? (
              <div style={{ color: C.muted, fontSize: 14, textAlign: "center", padding: 40 }}>No notifications yet. Subscribe to channels to get updates here.</div>
            ) : mySubs.map(ch => (
              <GlassCard key={ch} style={{ padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 13 }}>{ch[0]}</div>
                <div style={{ fontSize: 13 }}><b>{ch}</b> uploaded a new video</div>
              </GlassCard>
            ))}
          </div>
        )}

        {view === "profile" && (
          <div>
            {authLoading ? (
              <div style={{ textAlign: "center", padding: 60, color: C.muted }}>Loading...</div>
            ) : user ? (
              <div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28, color: "#fff", marginBottom: 10 }}>{(user.displayName || "U")[0].toUpperCase()}</div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{user.displayName}</div>
                  <div style={{ fontSize: 12.5, color: C.muted }}>{user.email}</div>
                </div>
                <button onClick={doLogout} style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, color: C.text, padding: "12px 0", borderRadius: 14, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Log out</button>
              </div>
            ) : (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo size={40} /></div>
                <h2 style={{ fontWeight: 800, textAlign: "center", marginBottom: 4, fontSize: 18 }}>{authForm.mode === "login" ? "Log in" : "Create account"}</h2>
                <p style={{ color: C.muted, fontSize: 13, textAlign: "center", marginBottom: 22 }}>to like, comment, and upload on FlowTube</p>
                {authForm.mode === "signup" && (
                  <>
                    <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>NAME</label>
                    <input value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter your name"
                      style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, marginTop: 6, marginBottom: 14, outline: "none", fontSize: 14 }} />
                  </>
                )}
                <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>EMAIL</label>
                <input value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" type="email"
                  style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, marginTop: 6, marginBottom: 14, outline: "none", fontSize: 14 }} />
                <label style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>PASSWORD</label>
                <input value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} placeholder="At least 6 characters" type="password" onKeyDown={e => e.key === "Enter" && doAuth()}
                  style={{ width: "100%", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "11px 12px", color: C.text, marginTop: 6, marginBottom: 8, outline: "none", fontSize: 14 }} />
                {authError && <div style={{ color: "#EF4444", fontSize: 12.5, marginBottom: 10 }}>{authError}</div>}
                <button onClick={doAuth} style={{ width: "100%", background: GRAD, color: "#fff", border: "none", padding: "12px 0", borderRadius: 16, fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 8, marginBottom: 12 }}>
                  {authForm.mode === "login" ? "Log in" : "Sign up"}
                </button>
                <div style={{ textAlign: "center", fontSize: 13, color: C.muted, cursor: "pointer" }} onClick={() => { setAuthError(""); setAuthForm(f => ({ ...f, mode: f.mode === "login" ? "signup" : "login" })); }}>
                  {authForm.mode === "login" ? "New here? Sign up" : "Already have an account? Log in"}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(13,17,23,0.92)", backdropFilter: "blur(12px)", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 8px calc(10px + env(safe-area-inset-bottom))", zIndex: 20 }}>
        {NAV.map(n => n.isCenter ? (
          <div key={n.key} className="navicon" onClick={() => setView("upload")} style={{ width: 42, height: 42, borderRadius: 14, background: GRAD, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><Plus size={22} color="#fff" /></div>
        ) : (
          <div key={n.key} className="navicon" onClick={() => setView(n.key)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <n.icon size={21} color={view === n.key ? C.blue : C.muted} />
            <span style={{ fontSize: 10, color: view === n.key ? C.blue : C.muted, fontWeight: 600 }}>{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
