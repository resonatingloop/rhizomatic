# rhizome

a rhizomatic conversation interface — an infinite canvas where ideas become nodes, connections become visible, and AI dialogue branches nonlinearly.

built as a single-file react artifact for claude.ai. designed for thinking out loud, exploring ideas across multiple tones, and weaving conversation threads into essays.

## features

- **infinite canvas** — pan/zoom with mouse, drag nodes around
- **7 conversation tones** — familiar, socratic, adversarial, poetic, technical, humorous, docent
- **manual connections** — shift+click to link any two nodes
- **response length control** — short/medium/long per-response
- **essay mode** — select a path through nodes and weave them into a coherent essay
- **persistence** — graph auto-saves via claude.ai's artifact storage API
- **snapshot export/import** — download/upload graph state as JSON
- **keyboard shortcuts** — `r` or `spacebar` to recenter, tone hotkeys

## usage

currently runs as a claude.ai artifact (`.jsx` file). drop `rhizome.jsx` into a claude.ai conversation as an artifact to use it.

### for local development (future)

the file uses the anthropic API directly (`api.anthropic.com/v1/messages`) and claude.ai's `window.storage` API for persistence. to run locally you'd need to:

1. set up a react environment (vite, next, etc.)
2. swap `window.storage` calls for localStorage or similar
3. proxy API calls through a backend (the artifact environment handles auth automatically)

## art

the bottom-right corner features a ghosted peony/wireframe polyhedra composition — original artwork embedded as base64.

## status

early prototype. active development. things that want to exist eventually:
- multiple saved projects/workspaces
- node search/filter
- richer node types (images, links, code)
- collaborative mode
- proper local dev setup with vite
