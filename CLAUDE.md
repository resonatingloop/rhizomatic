# CLAUDE.md — project context for claude code

## what this is
rhizome is a rhizomatic conversation interface — an infinite canvas where ideas become draggable nodes, connections are visible, and AI responses branch nonlinearly. it runs as a single-file react artifact in claude.ai.

## architecture
- **single file**: `rhizome.jsx` — entire app in one react component with default export
- **no build step**: runs directly in claude.ai's artifact sandbox
- **API**: calls `api.anthropic.com/v1/messages` directly (claude.ai handles auth)
- **persistence**: uses `window.storage` (claude.ai artifact storage API, NOT localStorage)
- **styling**: all inline styles, no CSS files. uses DM Mono font from google fonts.

## key design decisions
- dark theme (#07070c background) with muted jewel-tone accents
- 7 conversation tones with distinct system prompts and color coding
- nodes are draggable divs positioned absolutely on a transformed canvas layer
- edges rendered as SVG quadratic bezier curves in a separate layer
- essay mode lets user select a path through nodes, then generates a woven essay
- peony/polyhedra artwork embedded as base64 in bottom-right corner (PEONY_ART constant)

## available libraries (in claude.ai artifact sandbox)
- react (with hooks)
- lucide-react@0.263.1
- recharts, d3, plotly, three.js r128
- lodash, mathjs, papaparse, sheetjs
- shadcn/ui components
- tailwind (core utility classes only, no compiler)

## constraints
- NO localStorage/sessionStorage (will crash in artifact sandbox)
- must use `window.storage.get/set/delete/list` for persistence
- single file only — no imports from local files
- no `<form>` tags in react artifacts
- all state management via react hooks (useState, useRef, useEffect, useCallback)

## the user
- electrical engineer, philosophically playful, into techno-occultism and electronic music
- prefers lowercase responses, late millennial slang, esoteric interpretations
- wants honest critique, no empty flattery
- has bipolar 1, CPTSD, ADHD — the tool is partly a thinking aid

## current state & known issues
- export/import buttons recently added (save ↓ / load ↑)
- peony corner art opacity may need tuning (currently 0.07 seeded / 0.16 empty)
- the file is ~1200 lines and growing — may want to consider splitting if moving to local dev

## future directions
- multiple saved projects/workspaces
- node search/filter
- richer node types
- local dev setup with vite
- collaborative mode
