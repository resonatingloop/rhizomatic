import { useState, useRef, useEffect, useCallback } from "react";

// ─── TONES ───
const TONES = {
  familiar: {
    label: "familiar", icon: "◭", color: "#e8c9a9",
    system: (ctx) => `you are a thinking partner who talks like a very smart friend at 2am. you're philosophically playful, comfortable with esoteric and occult frameworks, default to straussian readings, use lowercase and late millennial slang (rn, bc, afaict, idk), make puns without flagging them, treat the user as intellectually serious (they are), mix rigor with vibes. you prioritize esoteric interpretations. you're critical when warranted — no empty flattery. you use emphasis via ALL CAPS on single words. you occasionally use obscure words. think tpot-brained with engineering discipline. 2-4 sentences, no lists, no headers.\n\nconversation context:\n${ctx}`,
  },
  socratic: {
    label: "socratic", icon: "?", color: "#b8a9e8",
    system: (ctx) => `you are a socratic dialogue partner. find unstated assumptions and surface them as probing questions. mix engagement with pointed questions. write in lowercase, 2-4 sentences. no lists. be warm but intellectually relentless.\n\nconversation context:\n${ctx}`,
  },
  adversarial: {
    label: "adversarial", icon: "⚔", color: "#e8a9a9",
    system: (ctx) => `you are an adversarial thinking partner. construct the STRONGEST counterargument — not a strawman. steelman the opposition, identify the real crux. write in lowercase, 2-4 sentences. brief enumeration is fine when laying out multiple counterpoints. respectful but no pulled punches.\n\nconversation context:\n${ctx}`,
  },
  poetic: {
    label: "poetic", icon: "◐", color: "#a9e8d0",
    system: (ctx) => `you are a poetic/associative partner. follow emotional and aesthetic resonance over logic. use metaphor, synesthesia, unexpected juxtapositions. write in lowercase, 2-4 sentences. no lists. let the idea dream about itself.\n\nconversation context:\n${ctx}`,
  },
  technical: {
    label: "technical", icon: "◇", color: "#e8d9a9",
    system: (ctx) => `you are a rigorous technical partner. maximum precision — define terms, identify logical structure, flag unsupported claims, suggest frameworks. be specific and concrete. if the user is gesturing at something vague, help them formalize it. write in lowercase, 2-4 sentences. short lists are fine when they clarify structure (e.g. breaking an argument into premises). cite concepts and thinkers.\n\nconversation context:\n${ctx}`,
  },
  humorous: {
    label: "humorous", icon: "~", color: "#d0a9e8",
    system: (ctx) => `you are a witty partner. engage substance through humor — puns, absurdist reframings, deadpan observations. jokes should illuminate, not deflect. think "comedian who read too much philosophy." write in lowercase, 2-4 sentences. no lists.\n\nconversation context:\n${ctx}`,
  },
  docent: {
    label: "docent", icon: "◉", color: "#a9c8e8",
    system: (ctx) => `you are an intellectually passionate docent — a guide through knowledge-space who follows the user's curiosity rather than a fixed syllabus. your job depends on what the user is asking:

if they ask a broad "tell me about X" question: lay out the LANDSCAPE. give them 3-5 of the most interesting entry points into the topic, each with a vivid one-sentence hook that makes them want to pull on that thread. don't be encyclopedic — be curatorial. pick the things that are genuinely fascinating and say why. think "here's the map, what catches your eye?"

if they pick a specific thread and say "tell me more about Y": go DEEP. give them the real substance — the key ideas, the context, the stakes, why it matters — but always gesture toward further rabbit holes at the edges. end with implicit invitations to go deeper or sideways.

if they're engaging in actual discussion about a topic: match their level and discuss it substantively. have opinions. make connections they might not expect, especially to adjacent fields or ideas.

throughout: be the professor who clearly LOVES this material and has strong takes about what's interesting and why. not neutral wikipedia voice — passionate, opinionated, but honest about what you're less sure of. write in lowercase. when laying out a landscape of entry points, short bullet points with a hook for each are great — make each one vivid and clickable. when deep-diving or discussing, write in flowing prose. 3-6 sentences or equivalent depending on whether you're mapping or deep-diving.\n\nconversation context:\n${ctx}`,
  },
};

// ─── TONE SELECTOR ───
function ToneSelector({ current, onChange }) {
  return (
    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
      {Object.entries(TONES).map(([key, t]) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={t.label}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 20,
              border: active ? `1px solid ${t.color}66` : "1px solid #ffffff10",
              background: active ? `${t.color}15` : "transparent",
              color: active ? t.color : "#7d778e",
              cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            <span style={{ marginRight: 3, fontSize: 10 }}>{t.icon}</span>{t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── HELPERS ───
const PEONY_ART = "data:image/jpeg;base64,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";
let _nid = 0;
const mkId = () => `nd${++_nid}`;
let _eid = 0;
const mkEdgeId = () => `ed${++_eid}`;
const NODE_W = 300;
const NODE_MIN_H = 80;

const NODE_HUES = [
  { bg: "#0e0e1a", border: "#b8a9e833", accent: "#b8a9e8" },
  { bg: "#0e1418", border: "#a9d4e833", accent: "#a9d4e8" },
  { bg: "#140e18", border: "#d4a9e833", accent: "#d4a9e8" },
  { bg: "#0e1812", border: "#a9e8b833", accent: "#a9e8b8" },
  { bg: "#18140e", border: "#e8d4a933", accent: "#e8d4a9" },
  { bg: "#180e0e", border: "#e8a9a933", accent: "#e8a9a9" },
];
const getNodeHue = (i) => NODE_HUES[i % NODE_HUES.length];

// ─── PERSISTENCE ───
const STORAGE_KEY = "rhizome-graph";

async function saveGraph(nodes, edges) {
  try {
    const data = JSON.stringify({ nodes, edges, savedAt: Date.now() });
    await window.storage.set(STORAGE_KEY, data);
  } catch (e) {
    console.error("save failed:", e);
  }
}

async function loadGraph() {
  try {
    const result = await window.storage.get(STORAGE_KEY);
    if (result && result.value) {
      return JSON.parse(result.value);
    }
  } catch (e) {
    console.log("no saved graph or load error:", e);
  }
  return null;
}

async function clearGraph() {
  try {
    await window.storage.delete(STORAGE_KEY);
  } catch (e) {
    console.error("clear failed:", e);
  }
}

// ─── SVG EDGE LAYER ───
function EdgeLayer({ edges, nodes, panX, panY, zoom, selectedPath }) {
  const pathSet = new Set();
  if (selectedPath) {
    for (let i = 0; i < selectedPath.length - 1; i++) {
      pathSet.add(`${selectedPath[i]}->${selectedPath[i + 1]}`);
      pathSet.add(`${selectedPath[i + 1]}->${selectedPath[i]}`);
    }
  }

  return (
    <svg style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0,
    }}>
      {edges.map((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const x1 = (fromNode.x + NODE_W / 2) * zoom + panX;
        const y1 = (fromNode.y + (fromNode.h || NODE_MIN_H) / 2) * zoom + panY;
        const x2 = (toNode.x + NODE_W / 2) * zoom + panX;
        const y2 = (toNode.y + (toNode.h || NODE_MIN_H) / 2) * zoom + panY;

        const dx = x2 - x1;
        const cx1 = x1 + dx * 0.4;
        const cx2 = x2 - dx * 0.4;

        const toneColor = edge.tone && TONES[edge.tone] ? TONES[edge.tone].color : "#888888";
        const inPath = pathSet.has(`${edge.from}->${edge.to}`);

        return (
          <g key={edge.id}>
            <path
              d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
              stroke={inPath ? "#ffffff" : toneColor}
              strokeWidth={(inPath ? 2.5 : 1.5) * zoom}
              strokeOpacity={inPath ? 0.6 : 0.2}
              fill="none"
            />
            <circle r={2.5 * zoom} fill={toneColor} opacity={0.4}>
              <animateMotion
                dur="3s" repeatCount="indefinite"
                path={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
              />
            </circle>
          </g>
        );
      })}
    </svg>
  );
}

// ─── NODE CARD ───
function NodeCard({
  node, hue, zoom, onMouseDown, onStartConnect, onDropConnect,
  isConnectSource, isConnectTarget, onClickSentence, activeReplyNodeId,
  essayMode, onToggleEssaySelect, isInEssayPath,
}) {
  const [hoveredSeg, setHoveredSeg] = useState(null);
  const [segments, setSegments] = useState([]);
  const cardRef = useRef(null);

  useEffect(() => {
    if (node.role === "ai" && node.text) {
      const raw = node.text.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) || [node.text];
      const merged = [];
      raw.forEach((s) => {
        if (merged.length > 0 && s.trim().length < 15) merged[merged.length - 1] += s;
        else if (s.trim()) merged.push(s);
      });
      setSegments(merged);
    } else {
      setSegments([node.text || ""]);
    }
  }, [node.text, node.role]);

  useEffect(() => {
    if (cardRef.current && node.onMeasure) {
      const h = cardRef.current.getBoundingClientRect().height / zoom;
      node.onMeasure(h);
    }
  }, [segments, zoom]);

  const toneColor = node.tone && TONES[node.tone] ? TONES[node.tone].color : hue.accent;

  return (
    <div
      ref={cardRef}
      onMouseDown={(e) => {
        if (e.target.tagName === "TEXTAREA" || e.target.tagName === "BUTTON") return;
        if (essayMode) { e.stopPropagation(); onToggleEssaySelect(node.id); return; }
        onMouseDown(e);
      }}
      onMouseUp={() => { if (isConnectTarget) onDropConnect(node.id); }}
      style={{
        position: "absolute", left: node.x, top: node.y,
        width: NODE_W, minHeight: NODE_MIN_H,
        background: hue.bg,
        border: `1px solid ${
          isInEssayPath ? "#ffffff66"
          : isConnectSource ? "#ffffff55"
          : isConnectTarget ? toneColor + "88"
          : hue.border
        }`,
        borderRadius: 12, padding: "14px 16px",
        cursor: essayMode ? "pointer" : "grab",
        boxShadow: isInEssayPath
          ? `0 0 20px rgba(255,255,255,0.1), 0 0 0 1px #ffffff44`
          : `0 4px 20px rgba(0,0,0,0.3)`,
        transition: "box-shadow 0.2s, border-color 0.2s",
        userSelect: "none",
        animation: "nodeAppear 0.4s ease-out both",
        opacity: essayMode && !isInEssayPath ? 0.4 : 1,
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 8, fontFamily: "'DM Mono', monospace",
        fontSize: 9, color: hue.accent, opacity: 0.6, letterSpacing: "0.07em",
      }}>
        <span>
          {node.role === "user" ? "you" : `◈ ${node.tone || "ai"}`}
          {node.tone && TONES[node.tone] && <span style={{ marginLeft: 6 }}>{TONES[node.tone].icon}</span>}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {!essayMode && (
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); onStartConnect(node.id); }}
              title="link to another node"
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: 8,
                color: hue.accent, opacity: 0.5, background: "transparent",
                border: `1px solid ${hue.accent}22`, borderRadius: 3,
                padding: "1px 6px", cursor: "crosshair", letterSpacing: "0.05em",
              }}
            >link</button>
          )}
        </div>
      </div>

      {node.branchedFrom && (
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 8,
          color: hue.accent, opacity: 0.35, marginBottom: 6,
          borderLeft: `2px solid ${hue.accent}22`, paddingLeft: 6,
          fontStyle: "italic",
        }}>
          re: "{node.branchedFrom.slice(0, 50)}{node.branchedFrom.length > 50 ? "..." : ""}"
        </div>
      )}

      <div style={{
        fontFamily: "'Libre Baskerville', Georgia, serif",
        fontSize: 13, lineHeight: 1.7,
        color: node.role === "user" ? "#ddd8ea" + "bb" : "#ddd8ea",
      }}>
        {node.role === "user" || essayMode ? (
          <span>{node.text}</span>
        ) : (
          segments.map((seg, i) => (
            <span
              key={i}
              onMouseEnter={() => setHoveredSeg(i)}
              onMouseLeave={() => setHoveredSeg(null)}
              onClick={(e) => { e.stopPropagation(); onClickSentence(node.id, seg.trim(), i); }}
              style={{
                cursor: "pointer", transition: "all 0.2s",
                borderBottom: hoveredSeg === i ? `1.5px solid ${toneColor}66` : "1.5px solid transparent",
                backgroundColor: hoveredSeg === i ? `${toneColor}0a` : "transparent",
                borderRadius: hoveredSeg === i ? 2 : 0, padding: "1px 2px",
              }}
            >{seg}</span>
          ))
        )}
      </div>

      {node.role === "ai" && !essayMode && activeReplyNodeId !== node.id && (
        <div style={{
          marginTop: 8, fontFamily: "'DM Mono', monospace",
          fontSize: 8, color: hue.accent, opacity: 0.25, letterSpacing: "0.04em",
        }}>click sentence to reply · link to connect</div>
      )}

      {essayMode && (
        <div style={{
          marginTop: 8, fontFamily: "'DM Mono', monospace",
          fontSize: 8, color: isInEssayPath ? "#ffffffaa" : hue.accent,
          opacity: isInEssayPath ? 1 : 0.4, letterSpacing: "0.04em",
        }}>
          {isInEssayPath ? "✓ in essay path" : "click to add to path"}
        </div>
      )}

      {node.loading && (
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: toneColor, opacity: 0.5, letterSpacing: "0.08em",
          animation: "pulse 1.8s infinite",
        }}>thinking...</div>
      )}
    </div>
  );
}

// ─── REPLY PANEL ───
function ReplyPanel({ x, y, sentence, onSubmit, onCancel }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  useEffect(() => { setTimeout(() => ref.current?.focus(), 150); }, []);

  return (
    <div style={{
      position: "absolute", left: x, top: y, width: NODE_W,
      background: "#0c0c16", border: "1px solid #b8a9e833",
      borderRadius: 10, padding: "12px 14px", zIndex: 999,
      animation: "nodeAppear 0.3s ease-out",
      boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 8,
        color: "#b8a9e8", opacity: 0.5, marginBottom: 6, letterSpacing: "0.05em",
      }}>
        replying to: <span style={{
          fontFamily: "'Libre Baskerville', serif", fontStyle: "italic",
          fontSize: 10, color: "#ddd8ea88",
        }}>"{sentence.slice(0, 60)}{sentence.length > 60 ? "..." : ""}"</span>
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) onSubmit(text.trim()); }
          if (e.key === "Escape") onCancel();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="your thought..."
        rows={3}
        style={{
          width: "100%", background: "#08080e",
          border: "1px solid #b8a9e820", borderRadius: 6,
          padding: "8px 10px", color: "#ddd8ea",
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 13, lineHeight: 1.6, resize: "none", outline: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 6 }}>
        <button onClick={onCancel} onMouseDown={(e) => e.stopPropagation()} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          color: "#7d778e66", background: "transparent",
          border: "none", cursor: "pointer", padding: "3px 8px",
        }}>esc</button>
        <button
          onClick={() => { if (text.trim()) onSubmit(text.trim()); }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: text.trim() ? "#b8a9e8" : "#7d778e44",
            background: text.trim() ? "#b8a9e810" : "transparent",
            border: `1px solid ${text.trim() ? "#b8a9e833" : "#ffffff08"}`,
            borderRadius: 5, padding: "3px 10px",
            cursor: text.trim() ? "pointer" : "default", letterSpacing: "0.05em",
          }}
        >send</button>
      </div>
    </div>
  );
}

// ─── ESSAY PANEL ───
function EssayPanel({ essayText, generating, onClose, onCopy }) {
  return (
    <div style={{
      position: "absolute", top: 60, right: 16, bottom: 16,
      width: 380, maxWidth: "40vw",
      background: "#0a0a14ee", border: "1px solid #b8a9e822",
      borderRadius: 12, zIndex: 200, display: "flex", flexDirection: "column",
      backdropFilter: "blur(12px)",
      animation: "nodeAppear 0.3s ease-out",
    }}>
      <div style={{
        padding: "14px 16px", borderBottom: "1px solid #ffffff08",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: "#b8a9e8", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>essay draft</span>
        <div style={{ display: "flex", gap: 6 }}>
          {essayText && (
            <button onClick={onCopy} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 9,
              color: "#b8a9e8", background: "#b8a9e810",
              border: "1px solid #b8a9e833", borderRadius: 5,
              padding: "3px 10px", cursor: "pointer", letterSpacing: "0.05em",
            }}>copy</button>
          )}
          <button onClick={onClose} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 9,
            color: "#7d778e", background: "transparent",
            border: "1px solid #7d778e30", borderRadius: 5,
            padding: "3px 10px", cursor: "pointer",
          }}>close</button>
        </div>
      </div>
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px",
        fontFamily: "'Libre Baskerville', Georgia, serif",
        fontSize: 14, lineHeight: 1.85, color: "#ddd8ea",
      }}>
        {generating ? (
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            color: "#b8a9e8", opacity: 0.5, animation: "pulse 1.8s infinite",
          }}>weaving threads into prose...</div>
        ) : essayText ? (
          essayText.split("\n\n").map((p, i) => (
            <p key={i} style={{ marginBottom: 16 }}>{p}</p>
          ))
        ) : (
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: "#7d778e66", lineHeight: 1.8,
          }}>
            click nodes in order to build your essay path.
            <br />the ai will stitch them into prose.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SEED INPUT ───
function SeedInput({ onSubmit }) {
  const [text, setText] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div style={{
      position: "absolute", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: 400, maxWidth: "90vw",
      animation: "nodeAppear 0.5s ease-out", zIndex: 100,
    }}>
      <div style={{
        fontFamily: "'DM Mono', monospace", fontSize: 36,
        color: "#b8a9e8", opacity: 0.15, textAlign: "center", marginBottom: 16,
      }}>◈</div>
      <p style={{
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: "#7d778e", textAlign: "center", marginBottom: 16,
        letterSpacing: "0.05em", lineHeight: 1.8,
      }}>
        plant a seed thought<br />it will grow into a rhizome
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <textarea
          ref={ref} value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (text.trim()) onSubmit(text.trim()); }
          }}
          placeholder="a thought, a question, a provocation..."
          rows={2}
          style={{
            flex: 1, background: "#0a0a14", border: "1px solid #b8a9e822",
            borderRadius: 8, padding: "12px 14px", color: "#ddd8ea",
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 14, lineHeight: 1.6, resize: "none", outline: "none",
          }}
          onFocus={(e) => e.target.style.borderColor = "#b8a9e844"}
          onBlur={(e) => e.target.style.borderColor = "#b8a9e822"}
        />
        <button
          onClick={() => { if (text.trim()) onSubmit(text.trim()); }}
          style={{
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: text.trim() ? "#b8a9e8" : "#7d778e33",
            background: text.trim() ? "#b8a9e810" : "transparent",
            border: `1px solid ${text.trim() ? "#b8a9e833" : "#ffffff08"}`,
            borderRadius: 8, padding: "12px 16px", cursor: "pointer",
            letterSpacing: "0.1em", textTransform: "uppercase", alignSelf: "flex-end",
          }}
        >seed</button>
      </div>
    </div>
  );
}

// ─── MAIN ───
export default function RhizomeConversations() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [tone, setTone] = useState("familiar");
  const [responseLength, setResponseLength] = useState("medium"); // short, medium, long
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seeded, setSeeded] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // pan/zoom
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const [dragging, setDragging] = useState(null);
  const [connecting, setConnecting] = useState(null);
  const [replyState, setReplyState] = useState(null);

  // essay mode
  const [essayMode, setEssayMode] = useState(false);
  const [essayPath, setEssayPath] = useState([]);
  const [essayText, setEssayText] = useState("");
  const [essayGenerating, setEssayGenerating] = useState(false);

  // save status
  const [saveStatus, setSaveStatus] = useState("");

  const containerRef = useRef(null);

  // ─── LOAD ON MOUNT ───
  useEffect(() => {
    (async () => {
      const saved = await loadGraph();
      if (saved && saved.nodes && saved.nodes.length > 0) {
        setNodes(saved.nodes);
        setEdges(saved.edges || []);
        setSeeded(true);
        // restore id counters
        const maxNid = saved.nodes.reduce((m, n) => {
          const num = parseInt(n.id.replace("nd", ""), 10);
          return num > m ? num : m;
        }, 0);
        const maxEid = (saved.edges || []).reduce((m, e) => {
          const num = parseInt(e.id.replace("ed", ""), 10);
          return num > m ? num : m;
        }, 0);
        _nid = maxNid;
        _eid = maxEid;
        setSaveStatus("loaded");
        setTimeout(() => setSaveStatus(""), 2000);
      }
      setInitialized(true);
    })();
  }, []);

  // ─── AUTO-SAVE ON CHANGES ───
  const saveTimeout = useRef(null);
  useEffect(() => {
    if (!initialized || nodes.length === 0) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      // strip non-serializable stuff
      const cleanNodes = nodes.map(({ onMeasure, ...rest }) => rest);
      await saveGraph(cleanNodes, edges);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 1500);
    }, 1500);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [nodes, edges, initialized]);

  // ─── LENGTH INSTRUCTION ───
  const lengthInstruction = responseLength === "short"
    ? "\n\nIMPORTANT: keep your response very brief — 1-2 sentences max."
    : responseLength === "long"
    ? "\n\nIMPORTANT: give an extended, thorough response — 5-8 sentences, explore the idea fully."
    : "\n\nkeep your response to 2-4 sentences.";

  // ─── KEYBOARD SHORTCUTS ───
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "r" || e.key === " ") {
        e.preventDefault();
        handleRecenter();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nodes]);

  // ─── API ───
  const callClaude = async (userMsg, systemPrompt) => {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMsg }],
      }),
    });
    if (!resp.ok) throw new Error(`api ${resp.status}`);
    const data = await resp.json();
    return data.content?.filter((b) => b.type === "text").map((b) => b.text).join("\n") || "";
  };

  const buildContext = useCallback((nodeId) => {
    const visited = new Set();
    const result = [];
    const walk = (id, depth) => {
      if (visited.has(id) || depth > 6) return;
      visited.add(id);
      const node = nodes.find((n) => n.id === id);
      if (!node) return;
      result.push(`[${node.role}${node.tone ? ` (${node.tone})` : ""}]: ${node.text}`);
      edges.filter((e) => e.from === id || e.to === id).forEach((e) => {
        const nextId = e.from === id ? e.to : e.from;
        walk(nextId, depth + 1);
      });
    };
    walk(nodeId, 0);
    return result.join("\n\n");
  }, [nodes, edges]);

  // ─── SEED ───
  const handleSeed = async (text) => {
    setSeeded(true);
    setError(null);
    setLoading(true);

    const cx = window.innerWidth / 2 / zoom - panX / zoom - NODE_W / 2;
    const cy = window.innerHeight / 2 / zoom - panY / zoom - 60;

    const userNode = {
      id: mkId(), role: "user", text, x: cx - 80, y: cy - 40,
      h: NODE_MIN_H, tone: null, hueIdx: 0,
    };
    const aiId = mkId();
    const aiPlaceholder = {
      id: aiId, role: "ai", text: "", x: cx + 100, y: cy + 80,
      h: NODE_MIN_H, tone, hueIdx: 1, loading: true,
    };
    const edge = { id: mkEdgeId(), from: userNode.id, to: aiId, tone };

    setNodes([userNode, aiPlaceholder]);
    setEdges([edge]);

    try {
      const sys = TONES[tone].system(`[user]: ${text}`) + lengthInstruction;
      const reply = await callClaude(text, sys);
      setNodes((prev) => prev.map((n) =>
        n.id === aiId ? { ...n, text: reply, loading: false } : n
      ));
    } catch (err) {
      setError(err.message);
      setNodes((prev) => prev.filter((n) => n.id !== aiId));
    } finally {
      setLoading(false);
    }
  };

  // ─── REPLY ───
  const handleClickSentence = (nodeId, sentence, segIndex) => {
    if (loading || connecting || essayMode) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setReplyState({ nodeId, sentence, segIndex, x: node.x + NODE_W + 20, y: node.y });
  };

  const handleSubmitReply = async (text) => {
    if (!replyState || loading) return;
    const { nodeId, sentence } = replyState;
    setLoading(true);
    setError(null);

    const parentNode = nodes.find((n) => n.id === nodeId);
    if (!parentNode) return;

    const angle = (Math.random() - 0.5) * Math.PI * 0.6;
    const dist = 200 + Math.random() * 80;
    const newX = parentNode.x + Math.cos(angle) * dist;
    const newY = parentNode.y + (parentNode.h || NODE_MIN_H) + 40 + Math.sin(angle) * 60;

    const userNode = {
      id: mkId(), role: "user", text, x: newX, y: newY,
      h: NODE_MIN_H, tone: null, hueIdx: nodes.length, branchedFrom: sentence,
    };
    const aiId = mkId();
    const aiNode = {
      id: aiId, role: "ai", text: "", x: newX + 60, y: newY + 120,
      h: NODE_MIN_H, tone, hueIdx: nodes.length + 1, loading: true,
    };

    setNodes((prev) => [...prev, userNode, aiNode]);
    setEdges((prev) => [...prev,
      { id: mkEdgeId(), from: nodeId, to: userNode.id, tone },
      { id: mkEdgeId(), from: userNode.id, to: aiId, tone },
    ]);
    setReplyState(null);

    try {
      const ctx = buildContext(nodeId) +
        `\n\n[user responds to: "${sentence}"]\n[user]: ${text}`;
      const sys = TONES[tone].system(ctx) + lengthInstruction;
      const reply = await callClaude(text, sys);
      setNodes((prev) => prev.map((n) =>
        n.id === aiId ? { ...n, text: reply, loading: false } : n
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── CONNECT ───
  const handleStartConnect = (nodeId) => { setConnecting(nodeId); setReplyState(null); };
  const handleDropConnect = (targetId) => {
    if (!connecting || connecting === targetId) { setConnecting(null); return; }
    const exists = edges.some(
      (e) => (e.from === connecting && e.to === targetId) || (e.from === targetId && e.to === connecting)
    );
    if (!exists) {
      setEdges((prev) => [...prev, { id: mkEdgeId(), from: connecting, to: targetId, tone: "manual" }]);
    }
    setConnecting(null);
  };

  // ─── ESSAY MODE ───
  const toggleEssayMode = () => {
    if (essayMode) {
      setEssayMode(false);
      setEssayPath([]);
      setEssayText("");
    } else {
      setEssayMode(true);
      setEssayPath([]);
      setEssayText("");
      setReplyState(null);
      setConnecting(null);
    }
  };

  const toggleEssaySelect = (nodeId) => {
    setEssayPath((prev) => {
      if (prev.includes(nodeId)) return prev.filter((id) => id !== nodeId);
      return [...prev, nodeId];
    });
  };

  const generateEssay = async () => {
    if (essayPath.length < 2) return;
    setEssayGenerating(true);
    setError(null);

    const pathNodes = essayPath.map((id) => nodes.find((n) => n.id === id)).filter(Boolean);
    const threadContent = pathNodes
      .map((n, i) => `[${i + 1}. ${n.role}${n.tone ? ` (${n.tone})` : ""}]: ${n.text}`)
      .join("\n\n");

    try {
      const sys = `you are a skilled essayist. the user has been having a rhizomatic conversation — branching, non-linear, exploratory — and has selected a path through it that they want woven into an essay draft. your job is to take the raw conversational thread and transform it into flowing, coherent prose. preserve the IDEAS and the intellectual energy but give it essay structure — an opening that draws the reader in, development that builds, and an ending that lands. write in lowercase. maintain the voice and tone of the conversation. don't add ideas that weren't in the thread, but do make connections explicit that were only implicit. this should read like a great blog post or substack essay, not an academic paper. no headers, no lists. just prose.`;

      const reply = await callClaude(
        `here is the conversational thread to weave into an essay:\n\n${threadContent}`,
        sys
      );
      setEssayText(reply);
    } catch (err) {
      setError(err.message);
    } finally {
      setEssayGenerating(false);
    }
  };

  const copyEssay = () => {
    navigator.clipboard.writeText(essayText).catch(() => {});
  };

  // ─── PAN / ZOOM / DRAG ───
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    const newZoom = Math.max(0.15, Math.min(3, zoom * delta));
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setPanX(mx - (mx - panX) * (newZoom / zoom));
    setPanY(my - (my - panY) * (newZoom / zoom));
    setZoom(newZoom);
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target !== containerRef.current && e.target !== containerRef.current.firstChild) return;
    if (connecting) { setConnecting(null); return; }
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, px: panX, py: panY };
    setReplyState(null);
  };

  const handleNodeMouseDown = (nodeId) => (e) => {
    if (connecting || essayMode) return;
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDragging({
      nodeId,
      offsetX: (e.clientX - rect.left - panX) / zoom - node.x,
      offsetY: (e.clientY - rect.top - panY) / zoom - node.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      setPanX(panStart.current.px + e.clientX - panStart.current.x);
      setPanY(panStart.current.py + e.clientY - panStart.current.y);
    }
    if (dragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const wx = (e.clientX - rect.left - panX) / zoom;
      const wy = (e.clientY - rect.top - panY) / zoom;
      setNodes((prev) => prev.map((n) =>
        n.id === dragging.nodeId
          ? { ...n, x: wx - dragging.offsetX, y: wy - dragging.offsetY }
          : n
      ));
    }
  }, [isPanning, dragging, panX, panY, zoom]);

  const handleMouseUp = useCallback(() => { setIsPanning(false); setDragging(null); }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const h = (e) => e.preventDefault();
    el.addEventListener("wheel", h, { passive: false });
    return () => el.removeEventListener("wheel", h);
  }, []);

  const handleRecenter = () => {
    if (nodes.length === 0) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pad = 80;
    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + NODE_W));
    const maxY = Math.max(...nodes.map((n) => n.y + (n.h || NODE_MIN_H)));
    const graphW = maxX - minX + pad * 2;
    const graphH = maxY - minY + pad * 2;
    const newZoom = Math.min(1.2, Math.max(0.25, Math.min(rect.width / graphW, rect.height / graphH)));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setPanX(rect.width / 2 - centerX * newZoom);
    setPanY(rect.height / 2 - centerY * newZoom);
    setZoom(newZoom);
  };

  const handleReset = async () => {
    setNodes([]); setEdges([]); setSeeded(false);
    setReplyState(null); setConnecting(null);
    setEssayMode(false); setEssayPath([]); setEssayText("");
    setError(null); setLoading(false);
    setPanX(0); setPanY(0); setZoom(1);
    _nid = 0; _eid = 0;
    await clearGraph();
    setSaveStatus("cleared");
    setTimeout(() => setSaveStatus(""), 1500);
  };

  if (!initialized) {
    return (
      <div style={{
        width: "100%", height: "100vh", background: "#07070c",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          color: "#b8a9e866", animation: "pulse 1.8s infinite",
        }}>loading rhizome...</div>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
          * { box-sizing: border-box; margin: 0; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: "100vh", background: "#07070c",
      overflow: "hidden", position: "relative",
      cursor: isPanning ? "grabbing" : connecting ? "crosshair" : "default",
    }}>
      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff04 1px, transparent 0)",
        backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
        backgroundPosition: `${panX}px ${panY}px`,
      }} />

      {/* Corner art — peony wireframe */}
      <div style={{
        position: "absolute", bottom: 0, right: 0,
        width: seeded ? 300 : 450, height: seeded ? 300 : 450,
        pointerEvents: "none", zIndex: 0,
        backgroundImage: `url(${PEONY_ART})`,
        backgroundSize: "cover",
        backgroundPosition: "top left",
        opacity: seeded ? 0.07 : 0.16,
        maskImage: "radial-gradient(ellipse at 100% 100%, black 20%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(ellipse at 100% 100%, black 20%, transparent 75%)",
        transition: "opacity 1.5s ease, width 1.5s ease, height 1.5s ease",
      }} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        padding: "12px 16px", zIndex: 50,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        background: "linear-gradient(180deg, #07070cee 0%, #07070c88 70%, transparent 100%)",
        pointerEvents: "none",
      }}>
        <div style={{ pointerEvents: "auto" }}>
          <h1 style={{
            fontFamily: "'DM Mono', monospace", fontSize: 11,
            fontWeight: 400, color: "#b8a9e8",
            letterSpacing: "0.14em", textTransform: "uppercase", margin: 0,
          }}>rhizome</h1>
          <p style={{
            fontFamily: "'DM Mono', monospace", fontSize: 8,
            color: "#7d778e55", marginTop: 3, letterSpacing: "0.05em",
          }}>
            {connecting ? "click a node to connect" : essayMode ? "click nodes in order to build essay path" : "click sentences · drag nodes · link · [r] recenter"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flexWrap: "wrap", pointerEvents: "auto", maxWidth: "65%" }}>
          <ToneSelector current={tone} onChange={setTone} />
          <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: 8,
              color: "#7d778e55", letterSpacing: "0.05em", marginRight: 4,
            }}>len</span>
            {["short", "medium", "long"].map((len) => {
              const active = responseLength === len;
              const widths = { short: 8, medium: 14, long: 22 };
              return (
                <button
                  key={len}
                  onClick={() => setResponseLength(len)}
                  title={len}
                  style={{
                    width: 28, height: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: active ? "#b8a9e815" : "transparent",
                    border: active ? "1px solid #b8a9e844" : "1px solid #ffffff10",
                    borderRadius: 4, cursor: "pointer", padding: 0,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{
                    width: widths[len], height: 2,
                    background: active ? "#b8a9e8" : "#7d778e55",
                    borderRadius: 1, transition: "all 0.2s",
                  }} />
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {seeded && (
              <button
                onClick={handleRecenter}
                title="fit all nodes in view"
                style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  color: "#7d778e", background: "transparent",
                  border: "1px solid #7d778e30", borderRadius: 5,
                  padding: "4px 10px", cursor: "pointer", letterSpacing: "0.05em",
                }}>recenter</button>
            )}
            {seeded && (
              <button
                onClick={toggleEssayMode}
                style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 9,
                  color: essayMode ? "#e8c9a9" : "#7d778e",
                  background: essayMode ? "#e8c9a910" : "transparent",
                  border: `1px solid ${essayMode ? "#e8c9a944" : "#7d778e30"}`,
                  borderRadius: 5, padding: "4px 10px",
                  cursor: "pointer", letterSpacing: "0.05em",
                }}
              >{essayMode ? "exit essay" : "essay mode"}</button>
            )}
            {seeded && (
              <button onClick={handleReset} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                color: "#7d778e", background: "transparent",
                border: "1px solid #7d778e30", borderRadius: 5,
                padding: "4px 10px", cursor: "pointer", letterSpacing: "0.05em",
              }}>reset</button>
              <button onClick={() => {
                const data = JSON.stringify({ nodes, edges, savedAt: Date.now() }, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "rhizome-snapshot-" + new Date().toISOString().slice(0,10) + ".json";
                a.click();
                URL.revokeObjectURL(url);
              }} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                color: "#7d778e", background: "transparent",
                border: "1px solid #7d778e30", borderRadius: 5,
                padding: "4px 10px", cursor: "pointer", letterSpacing: "0.05em",
              }}>save ↓</button>
              <button onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".json";
                input.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const snap = JSON.parse(text);
                    if (snap.nodes && snap.edges) {
                      setNodes(snap.nodes);
                      setEdges(snap.edges);
                      setSeeded(snap.nodes.length > 0);
                      _nid = Math.max(0, ...snap.nodes.map(n => n.id)) + 1;
                      _eid = Math.max(0, ...snap.edges.map(x => x.id)) + 1;
                      await saveGraph(snap.nodes, snap.edges);
                      setSaveStatus("loaded");
                      setTimeout(() => setSaveStatus(""), 1500);
                    }
                  } catch (err) {
                    console.error("import failed:", err);
                  }
                };
                input.click();
              }} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 9,
                color: "#7d778e", background: "transparent",
                border: "1px solid #7d778e30", borderRadius: 5,
                padding: "4px 10px", cursor: "pointer", letterSpacing: "0.05em",
              }}>load ↑</button>
            )}
          </div>
        </div>
      </div>

      {/* Essay generate button */}
      {essayMode && essayPath.length >= 2 && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%",
          transform: "translateX(-50%)", zIndex: 100, pointerEvents: "auto",
        }}>
          <button
            onClick={generateEssay}
            disabled={essayGenerating}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: 11,
              color: "#e8c9a9", background: "#e8c9a915",
              border: "1px solid #e8c9a944", borderRadius: 8,
              padding: "10px 24px", cursor: "pointer",
              letterSpacing: "0.08em", textTransform: "uppercase",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            {essayGenerating ? "weaving..." : `weave ${essayPath.length} nodes into essay`}
          </button>
        </div>
      )}

      {/* Essay panel */}
      {essayMode && (essayText || essayGenerating) && (
        <EssayPanel
          essayText={essayText}
          generating={essayGenerating}
          onClose={() => { setEssayText(""); }}
          onCopy={copyEssay}
        />
      )}

      {/* Error toast */}
      {error && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%",
          transform: "translateX(-50%)", zIndex: 100,
          padding: "10px 18px", borderRadius: 8,
          background: "#1a0808ee", border: "1px solid #ff4a4a22",
          fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#ff6b6b99",
        }}>{error}</div>
      )}

      {/* Save status */}
      {saveStatus && (
        <div style={{
          position: "absolute", bottom: 14, left: 20, zIndex: 50,
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          color: "#b8a9e855", letterSpacing: "0.05em",
          animation: "nodeAppear 0.3s ease-out",
        }}>
          {saveStatus === "saved" ? "✓ saved" : saveStatus === "loaded" ? "✓ restored" : "✓ cleared"}
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          position: "absolute", inset: 0,
          cursor: isPanning ? "grabbing" : connecting ? "crosshair" : "grab",
        }}
      >
        <EdgeLayer edges={edges} nodes={nodes} panX={panX} panY={panY} zoom={zoom} selectedPath={essayMode ? essayPath : null} />

        <div style={{
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
          transformOrigin: "0 0",
          position: "absolute", top: 0, left: 0, width: 0, height: 0,
        }}>
          {!seeded && <SeedInput onSubmit={handleSeed} />}

          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={{
                ...node,
                onMeasure: (h) => {
                  setNodes((prev) => prev.map((n) =>
                    n.id === node.id && n.h !== h ? { ...n, h } : n
                  ));
                },
              }}
              hue={getNodeHue(node.hueIdx || 0)}
              zoom={zoom}
              onMouseDown={handleNodeMouseDown(node.id)}
              onStartConnect={handleStartConnect}
              onDropConnect={handleDropConnect}
              isConnectSource={connecting === node.id}
              isConnectTarget={!!connecting && connecting !== node.id}
              onClickSentence={handleClickSentence}
              activeReplyNodeId={replyState?.nodeId}
              essayMode={essayMode}
              onToggleEssaySelect={toggleEssaySelect}
              isInEssayPath={essayPath.includes(node.id)}
            />
          ))}

          {replyState && (
            <ReplyPanel
              x={replyState.x} y={replyState.y}
              sentence={replyState.sentence}
              onSubmit={handleSubmitReply}
              onCancel={() => setReplyState(null)}
            />
          )}
        </div>
      </div>

      {/* Status bar */}
      <div style={{
        position: "absolute", bottom: 14, right: 20, zIndex: 50,
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        color: "#7d778e44", letterSpacing: "0.05em",
      }}>
        {Math.round(zoom * 100)}% · {nodes.length} nodes · {edges.length} links
        {essayMode && ` · ${essayPath.length} selected`}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
        @keyframes nodeAppear {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        * { box-sizing: border-box; margin: 0; }
      `}</style>
    </div>
  );
}
