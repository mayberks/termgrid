'use strict';

/**
 * Generates the app icon from scratch:
 *   build/icon.png  — 256×256 raster (used in dev and as the source for ICO)
 *   build/icon.ico  — Windows taskbar/exe icon (used by electron-builder)
 *
 * Pixels are drawn directly so no external renderer is required.
 * See build/icon.svg for the design reference.
 */

const fs   = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const toIco   = require('to-ico');

const SIZE  = 256;
const BG    = [0x1e, 0x1e, 0x1e, 0xff];
const TEAL  = [0x4e, 0xc9, 0xb0, 0xff];
const BLUE  = [0x00, 0x7a, 0xcc, 0xff];

function createPng() {
  const png = new PNG({ width: SIZE, height: SIZE });

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (SIZE * y + x) << 2;
      png.data[i]     = BG[0];
      png.data[i + 1] = BG[1];
      png.data[i + 2] = BG[2];
      png.data[i + 3] = BG[3];
    }
  }

  // 2×2 grid of rounded squares with stroked outlines.
  const pad    = 30;
  const gap    = 16;
  const cell   = (SIZE - 2 * pad - gap) / 2;
  const radius = 14;
  const stroke = 9;

  function drawRoundRect(x0, y0, w, h, r, color) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        // Distance from the rounded corner center.
        const cx = Math.min(Math.max(x, x0 + r), x0 + w - 1 - r);
        const cy = Math.min(Math.max(y, y0 + r), y0 + h - 1 - r);
        const dist = Math.hypot(x - cx, y - cy);
        if (dist > r) continue;

        const distFromEdge = Math.min(dist, w - (x - x0) - 1, h - (y - y0) - 1, (x - x0), (y - y0));
        const inner = r - stroke;
        if (distFromEdge < inner) continue; // hollow interior

        const idx = (SIZE * y + x) << 2;
        png.data[idx]     = color[0];
        png.data[idx + 1] = color[1];
        png.data[idx + 2] = color[2];
        png.data[idx + 3] = color[3];
      }
    }
  }

  drawRoundRect(pad,                  pad,                  cell, cell, radius, TEAL);
  drawRoundRect(pad + cell + gap,     pad,                  cell, cell, radius, BLUE);
  drawRoundRect(pad,                  pad + cell + gap,     cell, cell, radius, BLUE);
  drawRoundRect(pad + cell + gap,     pad + cell + gap,     cell, cell, radius, TEAL);

  return png;
}

async function main() {
  const buildDir = path.join(__dirname, '..', 'build');
  fs.mkdirSync(buildDir, { recursive: true });

  const png = createPng();
  const pngPath = path.join(buildDir, 'icon.png');
  await new Promise((res, rej) => {
    png.pack().pipe(fs.createWriteStream(pngPath))
      .on('finish', res)
      .on('error', rej);
  });
  console.log('wrote', pngPath);

  const pngBuf = fs.readFileSync(pngPath);
  const icoBuf = await toIco([pngBuf]);
  const icoPath = path.join(buildDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuf);
  console.log('wrote', icoPath);
}

main().catch(err => { console.error(err); process.exit(1); });