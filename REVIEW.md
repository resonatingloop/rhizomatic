# codebase review: rhizome.jsx

single-file react app, ~1218 lines, 63KB. runs as a claude.ai artifact — infinite canvas, draggable nodes, AI branching, essay mode.

## architecture

solid for a single-file artifact. clean component hierarchy:

```
RhizomeConversations (main)
├── ToneSelector
├── EdgeLayer (SVG bezier curves)
├── NodeCard (draggable conversation nodes)
├── ReplyPanel (inline reply to sentences)
├── EssayPanel (essay generation UI)
└── SeedInput (initial prompt)
```

- 7-tone system with distinct prompts + color-coding — well-designed
- canvas pan/zoom/drag works well
- graph context injection (walks edges up to depth 6) gives good conversational continuity
- auto-save with debounce, export/import for portability

---

## bugs & correctness issues

### 1. ID counter corruption on malformed data
**`rhizome.jsx:560-566`**

```js
const num = parseInt(n.id.replace("nd", ""), 10);
```

if ID is malformed (e.g. just `"nd"`), `parseInt` returns `NaN`. `Math.max(NaN, ...)` propagates → `_nid = NaN` → all future IDs become `"ndNaN"`, breaking the app permanently.

**fix:** `parseInt(n.id.replace("nd", ""), 10) || 0`

### 2. unguarded TONES lookup
**`rhizome.jsx:670, 725`**

```js
const sys = TONES[tone].system(ctx) + lengthInstruction;
```

if `tone` is invalid (corrupted storage, future code change), this throws uncaught TypeError.

**fix:** validate tone exists, fallback to `"familiar"`

### 3. handleSubmitReply stuck loading on early return
**`rhizome.jsx:694-698`**

```js
setLoading(true);
// ...
const parentNode = nodes.find((n) => n.id === nodeId);
if (!parentNode) return;  // loading never set back to false
```

if parentNode is null, the app stays in permanent loading state.

**fix:** move the parentNode check before `setLoading(true)`, or add `setLoading(false)` before return

### 4. buildContext walks bidirectionally
**`rhizome.jsx:637-640`**

```js
edges.filter((e) => e.from === id || e.to === id)
```

walks both directions, so context can include sibling branches not relevant to the current thread. may produce confusing AI responses when the graph has many branches.

### 5. essay path lost on accidental toggle
**`rhizome.jsx:754`**

`essayPath` resets to `[]` when essay mode toggles off — no confirmation, no undo. easy to lose a carefully selected path.

### 6. setTimeout leak on unmount
**`rhizome.jsx:570, 586`**

```js
setTimeout(() => setSaveStatus(""), 2000);
```

these status-clear timeouts have no cleanup. if component unmounts while pending, they'll try to setState on an unmounted component. the auto-save timeout (line 581) IS properly cleaned up, but these aren't.

---

## security

### 7. no schema validation on file import
**`rhizome.jsx:1058`**

```js
const snap = JSON.parse(text);
if (snap.nodes && snap.edges) { ... }
```

only checks property existence, not structure or types. malicious JSON could contain deeply nested objects causing memory exhaustion, or nodes with unexpected properties that break rendering.

**fix:** validate structure and types of imported nodes/edges

### 8. error messages are raw
**`rhizome.jsx:1126`**

API error strings rendered directly (`"api 429"`, `"api 500"`). safe in React (no dangerouslySetInnerHTML), but confusing to users.

**fix:** map status codes to friendly messages

---

## performance

### 9. no React.memo on sub-components

`NodeCard`, `EdgeLayer`, `ToneSelector` all re-render on every parent state change. with 50+ nodes, drag/pan performance will degrade noticeably.

**fix:** wrap `NodeCard` and `EdgeLayer` in `React.memo`

### 10. onMeasure callback recreated every render
**`rhizome.jsx:1165`**

inline `(h) => { setNodes(...) }` creates new function ref each render, defeating any future memoization.

**fix:** use `useCallback` or stable reference pattern

### 11. O(n) node lookup in EdgeLayer
**`rhizome.jsx:138-140`**

`nodes.find()` for every edge on every render = O(edges * nodes).

**fix:** build a `Map<id, node>` once per render

### 12. keyboard listener re-registers on every node change
**`rhizome.jsx:609`**

```js
useEffect(() => { ... }, [nodes]);
```

re-adds/removes the keydown listener every time nodes change. unnecessary overhead.

**fix:** use a ref for nodes or remove the dependency

### 13. no requestAnimationFrame on drag/pan

every pixel of mouse movement triggers setState → full re-render cycle. visible jank on larger graphs.

**fix:** throttle via `requestAnimationFrame`

---

## code quality

### 14. global mutable state
**`rhizome.jsx:73-76`**

```js
let _nid = 0;
let _eid = 0;
```

module-level mutable variables — not React-friendly. acceptable for single-artifact use, but would break on unmount/remount.

### 15. no data versioning for persistence
**`rhizome.jsx:87-94`**

no schema version in saved data. if node/edge shape changes in a future version, old saves will silently break or corrupt.

**fix:** add a `version` field to saved data

### 16. inconsistent style values

- border-radius: 3, 4, 5, 6, 8, 10, 12, 20 — no scale
- opacity: .05, .15, .25, .4, .5, .6, .7, .8, .88, .9 — no steps
- font sizes: 9, 10, 11, 13, 14, 36 — no type scale

not bugs, but makes visual consistency harder to maintain as the file grows.

---

## accessibility

### 17. no keyboard navigation for nodes
essay mode and node selection require mouse only. no Tab key support, no arrow key navigation.

### 18. low contrast on status text
`#b8a9e855` (save status) — very low contrast against dark background. hard to read even with good vision.

### 19. missing ARIA attributes
tone buttons lack `aria-pressed`, no `aria-live` on status messages, no `role` attributes on interactive canvas elements.

### 20. no focus management
after seeding or replying, focus isn't directed to the result. screen reader users have no way to know something happened.

---

## missing features (noted, not bugs)

- no undo/redo
- no node deletion
- no search/filter across nodes
- no multi-select for bulk operations
- no rate limit handling or retry logic on API calls
- no request cancellation (AbortController)
- no confirmation before clearing graph

---

## summary

| category | count | severity |
|----------|-------|----------|
| bugs / correctness | 6 | high |
| security | 2 | medium |
| performance | 5 | medium-high (scales with graph size) |
| code quality | 3 | low |
| accessibility | 4 | medium |
| **total** | **20** | |

the app is well-architected for its constraints (single file, artifact sandbox, no build step). the tone system, canvas interaction, and essay mode are thoughtfully designed. the main risks are around performance scaling (50+ nodes), data integrity (ID corruption, no versioning), and the missing validation on imported files. most fixes are straightforward — memoization, input validation, defensive fallbacks.
