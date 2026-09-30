<div align="center">

<img src="build/icon.svg" alt="TermGrid logo" width="96" height="96">

# TermGrid

**All your project terminals in one window, side by side.**

A grid-style terminal panel for Windows — open as many CMD / PowerShell sessions as you need, see them all at once, no more juggling windows.

[![MIT License](https://img.shields.io/github/license/your-username/termgrid?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue?style=flat-square)](#-requirements)
[![Electron](https://img.shields.io/badge/electron-33-9feaf9?style=flat-square)](https://www.electronjs.org)
[![Node](https://img.shields.io/badge/node-%E2%89%A518-339933?style=flat-square)](https://nodejs.org)

[Features](#-features) • [Quick Start](#-quick-start) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](CONTRIBUTING.md)

</div>

---

## ❓ Why TermGrid?

If you work on multiple projects, you probably have a folder full of CMD windows floating around your taskbar. Switching between them is annoying, you lose context, and your screen gets cluttered.

**TermGrid** puts every terminal in a single window as a grid. See them all at once. Click `+`, pick a folder, get a new cell. No tabs, no hidden windows, no mess.

---

## ✨ Features

| | |
|---|---|
| 🟦 **Auto-arranging grid** | 1 → 1×1, 2 → 2×1, **4 → 2×2**, 6 → 3×2, 9 → 3×3, … |
| ➕ **One-click add** | Floating action button or `Ctrl+G` |
| 🪟 **Dark title bar** | Native Windows dark chrome with custom overlay |
| 🎨 **Themed scrollbars** | Dark, minimal, no jarring white bars |
| ⚡ **Real terminal** | ConPTY + xterm.js — full ANSI / 256-color support |
| 🪶 **Lightweight** | ~80 MB RAM per window, lazy init, debounced resize |
| 🧩 **Modular codebase** | Main / preload / renderer cleanly separated |

---

## 📸 Screenshots

```
docs/screenshots/
├── empty.png        # Initial empty state
├── grid-4.png       # 2×2 grid with 4 terminals
└── dark-theme.png   # Dark title bar visible
```

Example markdown image syntax once you add screenshots:

```markdown
![Empty state](docs/screenshots/empty.png)
![2×2 grid](docs/screenshots/grid-4.png)
```

---

## 🚀 Quick Start

### Option A — Run from source

Requirements: **Node.js 18+** and **Windows 10 1809+**.

```bash
git clone https://github.com/your-username/termgrid.git
cd termgrid
npm install
npm start
```

`node-pty` ships with prebuilt binaries for Windows — no compiler required.

### Option B — Use the portable .exe

1. Go to [Releases](https://github.com/your-username/termgrid/releases)
2. Download the latest `TermGrid-portable.exe`
3. Double-click to run — no installation needed

---

## ⌨️ Usage

| Shortcut | Action |
|---|---|
| `Ctrl + G` | Open folder picker and spawn new terminal |
| Click `+` (bottom-right) | Same as above |
| Click `×` on cell header | Close that terminal |
| Hover cell header | Reveal close button |

### Grid layout rules

The grid auto-resizes based on terminal count:

| Cells | Layout |
|---:|:---|
| 1 | 1×1 (full screen) |
| 2 | 2×1 (side by side) |
| 3 | 3×1 (in a row) |
| **4** | **2×2** |
| 5 – 6 | 3×2 |
| 7 – 9 | 3×3 |
| 10+ | `√n` columns, rounded up |

See [`src/renderer/grid.js`](src/renderer/grid.js) for the implementation.

---

## 🏗️ Architecture

```
┌──────────────┐  IPC   ┌───────────────┐  PTY   ┌─────────┐
│   Renderer   │ ◄────► │  Main process │ ◄────► │  cmd.exe│
│ (xterm.js)   │        │ (PtyManager)  │        │ (ConPTY)│
└──────────────┘        └───────────────┘        └─────────┘
       ▲                          │
       │      contextBridge       │
       └────── preload.js ────────┘
```

### Project layout

```
termgrid/
├── src/
│   ├── main/                # Electron main process
│   │   ├── index.js         #   app lifecycle, branding
│   │   ├── window.js        #   BrowserWindow + dark title bar
│   │   ├── pty-manager.js   #   PtyManager class
│   │   └── ipc.js           #   IPC handler registry
│   ├── preload/
│   │   └── preload.js       #   contextBridge — sandboxed API
│   └── renderer/            # Chromium renderer
│       ├── index.html
│       ├── styles.css       #   theme + layout
│       ├── grid.js          #   grid size logic
│       ├── terminal.js      #   Terminal class (xterm + DOM)
│       └── main.js          #   renderer entry
├── build/
│   ├── icon.svg             #   source design
│   ├── icon.png             #   256×256 raster
│   └── icon.ico             #   Windows executable icon
├── scripts/
│   └── build-icons.js       #   generate icon files
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── package.json
├── LICENSE                  # MIT
├── CHANGELOG.md
├── CONTRIBUTING.md
├── README.md
└── SECURITY.md
```

### Process responsibilities

- **Main process** owns the PTY processes. `PtyManager` keeps a `Map<id, IPty>` and exposes lifecycle hooks (`spawn`, `write`, `resize`, `kill`, `killAll`).
- **Preload** is the only bridge between main and renderer. It exposes a minimal `window.api` via `contextBridge`. `nodeIntegration: false`.
- **Renderer** is just a browser. `terminal.js` encapsulates one xterm + DOM cell; `main.js` wires IPC events and the grid layout.

---

## 🛠️ Development

### Prerequisites

| | |
|---|---|
| Node.js | 18 or newer |
| OS | Windows 10 1809+ / macOS 12+ / Linux (with X11) |
| Disk | ~500 MB for `node_modules` |

### Scripts

```bash
npm start          # run in dev mode (electron .)
npm run icons      # regenerate icon.png and icon.ico from icon.svg design
npm run pack       # build unpacked app for local testing
npm run build      # build portable .exe (auto-runs icons first)
```

### Code style

- `'use strict'` everywhere
- ES modules for renderer (loaded as classic scripts), CommonJS for main
- JSDoc on every public function in main/

### Adding a new IPC channel

1. Add handler in `src/main/ipc.js`
2. Expose on `contextBridge` in `src/preload/preload.js`
3. Use from renderer

---

## 📦 Building distributables

```bash
npm run build
```

Output: `dist/TermGrid-portable.exe` (~80 MB, single-file, no install).

Configuration lives in `package.json` under the `build` key.

---

## 🐛 Troubleshooting

**`npm install` fails with `gyp ERR! find Python`**

`node-pty` ships prebuilt binaries for Windows since 1.0.0, so this shouldn't happen. If it does, install the [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) or update Node.js to 18+.

**The window opens but the folder picker never appears**

Open DevTools with `Ctrl+Shift+I` → Console tab. If you see `Cannot read properties of undefined (reading 'selectFolder')`, your preload script failed to load. Check that `src/preload/preload.js` is in the `build.files` array.

**Terminals render but colors look wrong**

Make sure your shell is launched with `TERM=xterm-256color`. TermGrid sets this automatically via `PtyManager.spawn`.

**Dark title bar not showing**

Requires Windows 10 1903+ or Windows 11. On older versions the title bar falls back to the OS default.

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- 🐛 [Report a bug](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Request a feature](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔧 [Open a PR](.github/PULL_REQUEST_TEMPLATE.md)

---

## 🔐 Security

Found a security issue? Please follow the disclosure process in [SECURITY.md](SECURITY.md) instead of opening a public issue.

---

## 📄 License

[MIT](LICENSE) © 2026 TermGrid contributors

---

## 🙏 Acknowledgments

- [xterm.js](https://xtermjs.org/) — terminal renderer
- [node-pty](https://github.com/microsoft/node-pty) — PTY bindings
- [Electron](https://www.electronjs.org/) — desktop runtime
- PuTTY's panel feature — original inspiration
