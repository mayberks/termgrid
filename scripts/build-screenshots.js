'use strict';

/**
 * Generates README screenshots that mirror the app's real layout.
 *
 *   docs/screenshots/empty.png        — empty state with hint
 *   docs/screenshots/grid-2x2.png     — 2×2 grid, 4 terminals
 *   docs/screenshots/grid-3x2.png     — 3×2 grid, 6 terminals
 *
 * The renderer source in src/renderer/ is the source of truth for colors
 * and layout. Anything that drifts should be updated here too.
 */

const fs   = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// -- Palette (mirrors src/renderer/styles.css) -----------------------------
const COLORS = {
  bgPage:    [0x1e, 0x1e, 0x1e, 0xff],
  bgToolbar: [0x25, 0x25, 0x26, 0xff],
  bgGridGap: [0x0a, 0x0a, 0x0a, 0xff],
  bgCell:    [0x1e, 0x1e, 0x1e, 0xff],
  bgHeader:  [0x2a, 0x2a, 0x2c, 0xff],
  border:    [0x1a, 0x1a, 0x1a, 0xff],
  dot:       [0x4e, 0xc9, 0xb0, 0xff],
  textLabel: [0xaa, 0xaa, 0xaa, 0xff],
  textDim:   [0x66, 0x66, 0x66, 0xff],
  textMute:  [0xb0, 0xb0, 0xb0, 0xff],
  textWhite: [0xd4, 0xd4, 0xd4, 0xff],
  textCmd:   [0xcc, 0xcc, 0xcc, 0xff],
  textKey:   [0xaa, 0xaa, 0xaa, 0xff],
  textKeyBg: [0x2a, 0x2a, 0x2a, 0xff],
  textBlue:  [0x00, 0x7a, 0xcc, 0xff],
  textGreen: [0x0d, 0xbc, 0x79, 0xff],
  textYellow:[0xe5, 0xe5, 0x10, 0xff],
  textCyan:  [0x4e, 0xc9, 0xb0, 0xff],
  textRed:   [0xcd, 0x31, 0x31, 0xff],
  fabBg:     [0x00, 0x7a, 0xcc, 0xff],
  fabShadow: [0x00, 0x00, 0x00, 0x80],
};

// -- Layout constants ------------------------------------------------------
const W = 1280;
const TOOLBAR_H = 38;
const GRID_GAP = 3;
const CELL_HEADER_H = 22;
const CELL_PAD = 4;

// -- 5x7 bitmap font (monospace, ~3x5 per char, 1px space) -----------------
const FONT = {
  W: 4, H: 6, // cell size 4x6 incl. spacing
  glyphs: {
    ' ': '.....\n.....\n.....\n.....\n.....',
    'A': '..#.\n.#.#\n#####\n#...#\n#...#',
    'B': '####\n#...#\n####\n#...#\n####',
    'C': '.####\n#....\n#....\n#....\n.####',
    'D': '####\n#...#\n#...#\n#...#\n####',
    'E': '#####\n#....\n####.\n#....\n#####',
    'F': '#####\n#....\n####.\n#....\n#....',
    'G': '.####\n#....\n#.###\n#...#\n.####',
    'H': '#...#\n#...#\n#####\n#...#\n#...#',
    'I': '###..\n.#...\n.#...\n.#...\n###..',
    'J': '..###\n....#\n....#\n#...#\n.###.',
    'K': '#...#\n#..#.\n###..\n#..#.\n#...#',
    'L': '#....\n#....\n#....\n#....\n#####',
    'M': '#...#\n##.##\n#.#.#\n#...#\n#...#',
    'N': '#...#\n##..#\n#.#.#\n#..##\n#...#',
    'O': '.###.\n#...#\n#...#\n#...#\n.###.',
    'P': '####.\n#...#\n####.\n#....\n#....',
    'Q': '.###.\n#...#\n#.#.#\n#..#.\n.##.#',
    'R': '####.\n#...#\n####.\n#..#.\n#...#',
    'S': '.####\n#....\n.###.\n....#\n####.',
    'T': '#####\n..#..\n..#..\n..#..\n..#..',
    'U': '#...#\n#...#\n#...#\n#...#\n.###.',
    'V': '#...#\n#...#\n#...#\n.#.#.\n..#..',
    'W': '#...#\n#...#\n#.#.#\n##.##\n#...#',
    'X': '#...#\n.#.#.\n..#..\n.#.#.\n#...#',
    'Y': '#...#\n.#.#.\n..#..\n..#..\n..#..',
    'Z': '#####\n....#\n..##.\n.#...\n#####',
    '0': '.###.\n#...#\n#..##\n#.#.#\n.###.',
    '1': '..#..\n.##..\n..#..\n..#..\n.###.',
    '2': '.###.\n#...#\n...#.\n..#..\n#####',
    '3': '####.\n....#\n.###.\n....#\n####.',
    '4': '#..#.\n#.#.#\n#####\n...#.\n...#.',
    '5': '#####\n#....\n####.\n....#\n####.',
    '6': '.###.\n#....\n####.\n#...#\n.###.',
    '7': '#####\n....#\n...#.\n..#..\n.#...',
    '8': '.###.\n#...#\n.###.\n#...#\n.###.',
    '9': '.###.\n#...#\n.####\n....#\n.###.',
    '.': '.....\n.....\n.....\n.....\n..#..',
    ',': '.....\n.....\n.....\n..#..\n.#...',
    ':': '.....\n..#..\n.....\n..#..\n.....',
    '/': '....#\n...#.\n..#..\n.#...\n#....',
    '\\':'#....\n.#...\n..#..\n...#.\n....#',
    '-': '.....\n.....\n#####\n.....\n.....',
    '_': '.....\n.....\n.....\n.....\n#####',
    '+': '.....\n..#..\n#####\n..#..\n.....',
    '=': '.....\n#####\n.....\n#####\n.....',
    '(': '..##.\n.#...\n.#...\n.#...\n..##.',
    ')': '.##..\n...#.\n...#.\n...#.\n.##..',
    '[': '..###\n..#..\n..#..\n..#..\n..###',
    ']': '###..\n..#..\n..#..\n..#..\n###..',
    '<': '...#.\n..#..\n.#...\n..#..\n...#.',
    '>': '.#...\n..#..\n...#.\n..#..\n.#...',
    '|': '..#..\n..#..\n..#..\n..#..\n..#..',
    '#': '.#.#.\n#####\n.#.#.\n#####\n.#.#.',
    '&': '.##..\n#.#..\n.#...\n#.#.#\n.##.#',
    '*': '.....\n#.#.#\n.###.\n#.#.#\n.....',
    '\'':'..#..\n..#..\n.....\n.....\n.....',
    '"': '.#.#.\n.#.#.\n.....\n.....\n.....',
    '?': '.###.\n#...#\n...#.\n.....\n..#..',
    '!': '..#..\n..#..\n..#..\n.....\n..#..',
  },
};

// -- Pixel helpers ---------------------------------------------------------
function makePng(width, height) {
  return new PNG({ width, height });
}
function setPx(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const i = (png.width * y + x) << 2;
  png.data[i]     = color[0];
  png.data[i + 1] = color[1];
  png.data[i + 2] = color[2];
  png.data[i + 3] = color[3];
}
function fillRect(png, x0, y0, w, h, color) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) setPx(png, x, y, color);
}
function strokeRect(png, x0, y0, w, h, color) {
  for (let x = x0; x < x0 + w; x++) { setPx(png, x, y0, color); setPx(png, x, y0 + h - 1, color); }
  for (let y = y0; y < y0 + h; y++) { setPx(png, x0, y, color); setPx(png, x0 + w - 1, y, color); }
}
function fillRoundedRect(png, x0, y0, w, h, r, color) {
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const cx = Math.min(Math.max(x, x0 + r), x0 + w - 1 - r);
      const cy = Math.min(Math.max(y, y0 + r), y0 + h - 1 - r);
      const dist = Math.hypot(x - cx, y - cy);
      if (dist > r) continue;
      setPx(png, x, y, color);
    }
  }
}

function drawChar(png, ch, x, y, color, scale = 1) {
  const g = FONT.glyphs[ch.toUpperCase()] || FONT.glyphs['?'];
  const rows = g.split('\n');
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < rows[r].length; c++) {
      if (rows[r][c] === '#') {
        if (scale === 1) setPx(png, x + c, y + r, color);
        else fillRect(png, x + c * scale, y + r * scale, scale, scale, color);
      }
    }
  }
}
function drawText(png, text, x, y, color, scale = 1) {
  for (let i = 0; i < text.length; i++) {
    drawChar(png, text[i], x + i * FONT.W * scale, y, color, scale);
  }
}
function textWidth(text, scale = 1) { return text.length * FONT.W * scale; }

// -- Window-frame primitives ----------------------------------------------
function drawToolbar(png, withLogo = true) {
  fillRect(png, 0, 0, W, TOOLBAR_H, COLORS.bgToolbar);
  // Bottom border
  fillRect(png, 0, TOOLBAR_H - 1, W, 1, COLORS.border);

  if (withLogo) {
    // Inline mini logo (matches src/renderer/index.html toolbar svg)
    const ox = 14, oy = 9;
    const colors = [COLORS.dot, COLORS.textBlue, COLORS.textBlue, COLORS.dot];
    const positions = [[0,0],[11,0],[0,11],[11,11]];
    for (let i = 0; i < 4; i++) {
      const [dx, dy] = positions[i];
      // 9x9 outline box, scaled 1px stroke
      const x0 = ox + dx, y0 = oy + dy;
      strokeRect(png, x0, y0, 10, 10, colors[i]);
    }
    // Wordmark "TermGrid"
    drawText(png, 'TERM', 36, 16, COLORS.textWhite, 1);
    drawText(png, 'GRID', 36 + 4 * FONT.W, 16, COLORS.textBlue, 1);
  }

  // TitleBarOverlay window controls (right-aligned, ~140px reserved)
  const ctrlY = TOOLBAR_H / 2;
  const ctrls = [
    { dx: W - 110, c: COLORS.textDim }, // minimize
    { dx: W - 80,  c: COLORS.textDim }, // maximize
    { dx: W - 50,  c: COLORS.textRed  }, // close
  ];
  // Minimize: dash
  fillRect(png, ctrls[0].dx + 4, ctrlY, 8, 1, ctrls[0].c);
  // Maximize: square outline
  strokeRect(png, ctrls[1].dx + 3, ctrlY - 4, 10, 9, ctrls[1].c);
  // Close: X
  for (let i = 0; i < 8; i++) {
    setPx(png, ctrls[2].dx + 3 + i, ctrlY - 3 + i, ctrls[2].c);
    setPx(png, ctrls[2].dx + 10 - i, ctrlY - 3 + i, ctrls[2].c);
  }
}

function drawCell(png, x0, y0, w, h, label) {
  // Body
  fillRect(png, x0, y0, w, h, COLORS.bgCell);
  // Header
  fillRect(png, x0, y0, w, CELL_HEADER_H, COLORS.bgHeader);
  // Border between header and body
  fillRect(png, x0, y0 + CELL_HEADER_H - 1, w, 1, COLORS.border);
  // Status dot
  fillRect(png, x0 + 8, y0 + 8, 6, 6, COLORS.dot);
  // Label
  drawText(png, label, x0 + 22, y0 + 8, COLORS.textLabel, 1);
}

function drawCursor(png, x, y) {
  fillRect(png, x, y, 5, FONT.H, COLORS.textWhite);
}

function drawFab(png) {
  const cx = W - 24 - 28, cy = (TOOLBAR_H + (png.height - TOOLBAR_H)) - 24 - 28;
  const r  = 28;
  // Soft shadow
  for (let dy = 4; dy <= 8; dy++) {
    fillRoundedRect(png, cx - r + 2, cy - r + dy, r * 2, r * 2, r, COLORS.fabShadow);
  }
  fillRoundedRect(png, cx - r, cy - r, r * 2, r * 2, r, COLORS.fabBg);
  // Plus sign
  fillRect(png, cx - 10, cy - 1, 20, 2, [0xff, 0xff, 0xff, 0xff]);
  fillRect(png, cx - 1, cy - 10, 2, 20, [0xff, 0xff, 0xff, 0xff]);
}

// -- Per-cell content ------------------------------------------------------
const PROMPTS = [
  { cwd: 'C:\\Users\\dev\\projects\\api',         name: 'api',         lines: [
      { t: 'C:\\Users\\dev\\projects\\api>', c: COLORS.textCmd },
      { t: 'npm run dev', c: COLORS.textWhite, cursor: true },
    ] },
  { cwd: 'C:\\Users\\dev\\projects\\web',         name: 'web',         lines: [
      { t: 'C:\\Users\\dev\\projects\\web>', c: COLORS.textCmd },
      { t: 'pnpm install', c: COLORS.textWhite },
      { t: 'Progress: 42/42', c: COLORS.textGreen },
      { t: 'C:\\Users\\dev\\projects\\web>', c: COLORS.textCmd, cursor: true },
    ] },
  { cwd: 'C:\\Users\\dev\\projects\\db',          name: 'db',          lines: [
      { t: 'PS C:\\Users\\dev\\projects\\db>', c: COLORS.textCyan },
      { t: 'docker compose up -d', c: COLORS.textWhite },
      { t: '[+] Running 4/4', c: COLORS.textGreen },
      { t: ' ✔ Network db_default  Created', c: COLORS.textGreen },
      { t: ' ✔ Container pg       Started', c: COLORS.textGreen },
      { t: 'PS C:\\Users\\dev\\projects\\db>', c: COLORS.textCyan, cursor: true },
    ] },
  { cwd: 'C:\\Users\\dev\\projects\\docs',        name: 'docs',        lines: [
      { t: '$ mkdocs serve', c: COLORS.textCmd },
      { t: 'INFO    -  Building documentation...', c: COLORS.textDim },
      { t: 'INFO    -  Documentation built in 1.2s', c: COLORS.textGreen },
      { t: 'INFO    -  Serving on http://127.0.0.1:8000/', c: COLORS.textGreen },
      { t: '$', c: COLORS.textCmd, cursor: true },
    ] },
  { cwd: 'C:\\Users\\dev\\projects\\infra',       name: 'infra',       lines: [
      { t: 'C:\\Users\\dev\\projects\\infra>', c: COLORS.textCmd },
      { t: 'terraform plan', c: COLORS.textWhite },
      { t: 'Plan: 3 to add, 0 to change, 0 to destroy.', c: COLORS.textYellow },
      { t: 'C:\\Users\\dev\\projects\\infra>', c: COLORS.textCmd, cursor: true },
    ] },
  { cwd: 'C:\\Users\\dev\\projects\\scratch',     name: 'scratch',     lines: [
      { t: '$ python scratch.py', c: COLORS.textCmd },
      { t: 'Traceback (most recent call last):', c: COLORS.textRed },
      { t: '  File "scratch.py", line 4', c: COLORS.textRed },
      { t: 'ZeroDivisionError: division by zero', c: COLORS.textRed },
      { t: '$', c: COLORS.textCmd, cursor: true },
    ] },
];

function drawCellContent(png, x0, y0, w, h, idx) {
  const data = PROMPTS[idx % PROMPTS.length];
  const padX = CELL_PAD + 2;
  const padY = CELL_HEADER_H + CELL_PAD + 2;
  const lineH = FONT.H + 2;
  const availW = w - padX * 2;
  const availH = h - padY - CELL_PAD;

  // Truncate displayed label so it fits the cell width minus close button.
  const maxLabelChars = Math.floor((w - 50) / FONT.W);
  const label = data.name.length > maxLabelChars
    ? data.name.slice(0, Math.max(1, maxLabelChars - 1)) + '…'
    : data.name;
  // Header is already drawn by drawCell with truncated label; we don't redraw it.

  // Clip and draw content rows.
  const maxLines = Math.floor(availH / lineH);
  for (let i = 0; i < Math.min(data.lines.length, maxLines); i++) {
    const line = data.lines[i];
    let text = line.t;
    const maxChars = Math.floor(availW / FONT.W);
    if (text.length > maxChars) text = text.slice(0, Math.max(0, maxChars - 1)) + '…';

    const ly = y0 + padY + i * lineH;
    drawText(png, text, x0 + padX, ly, line.c, 1);

    if (line.cursor) {
      const cx = x0 + padX + textWidth(text, 1) + 1;
      drawCursor(png, cx, ly);
    }
  }
}

// -- Top-level compositions -----------------------------------------------
function makeEmpty() {
  const H = 720;
  const png = makePng(W, H);
  fillRect(png, 0, 0, W, H, COLORS.bgPage);
  drawToolbar(png);

  // Empty state copy
  const sub = 'PICK A PROJECT FOLDER - A TERMINAL OPENS THERE.';
  const hint1 = 'CLICK THE + BUTTON AT THE BOTTOM-RIGHT';
  const hint2 = 'CTRL+G SHORTCUT';

  const subW = textWidth(sub);
  const subX = Math.floor((W - subW) / 2);
  const subY = Math.floor(H / 2) - 10;
  drawText(png, sub, subX, subY, COLORS.textMute, 1);

  const hint1W = textWidth(hint1);
  drawText(png, hint1, Math.floor((W - hint1W) / 2), subY + 26, COLORS.textDim, 1);

  // Small + glyph rendered in blue inline with hint text
  const hint2W = textWidth(hint2);
  const hint2X = Math.floor((W - hint2W) / 2);
  drawText(png, hint2, hint2X, subY + 44, COLORS.textDim, 1);

  drawFab(png);
  return png;
}

function makeGrid(cols, rows) {
  const H = 720;
  const png = makePng(W, H);
  fillRect(png, 0, 0, W, H, COLORS.bgPage);
  drawToolbar(png);

  // Grid area (mirrors #grid padding/gap).
  const gx0 = GRID_GAP;
  const gy0 = TOOLBAR_H + GRID_GAP;
  const gw  = W - GRID_GAP * 2;
  const gh  = H - TOOLBAR_H - GRID_GAP * 2;
  fillRect(png, gx0, gy0, gw, gh, COLORS.bgGridGap);

  const cellW = Math.floor((gw - GRID_GAP * (cols - 1)) / cols);
  const cellH = Math.floor((gh - GRID_GAP * (rows - 1)) / rows);

  const total = cols * rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const x0 = gx0 + c * (cellW + GRID_GAP);
      const y0 = gy0 + r * (cellH + GRID_GAP);
      drawCell(png, x0, y0, cellW, cellH, PROMPTS[idx % PROMPTS.length].name);
      drawCellContent(png, x0, y0, cellW, cellH, idx);
    }
  }

  drawFab(png);
  return png;
}

// -- IO --------------------------------------------------------------------
async function writePng(png, outPath) {
  await new Promise((res, rej) => {
    png.pack().pipe(fs.createWriteStream(outPath))
      .on('finish', res)
      .on('error', rej);
  });
}

async function main() {
  const outDir = path.join(__dirname, '..', 'docs', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const targets = [
    { name: 'empty.png',     png: makeEmpty() },
    { name: 'grid-2x2.png',  png: makeGrid(2, 2) },
    { name: 'grid-3x2.png',  png: makeGrid(3, 2) },
  ];

  for (const t of targets) {
    const p = path.join(outDir, t.name);
    await writePng(t.png, p);
    console.log('wrote', p);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
