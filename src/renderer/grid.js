'use strict';

/**
 * Layout rules for the terminal grid.
 *
 *   1   → 1×1   |  2   → 2×1  |  3   → 3×1
 *   4   → 2×2   |  5   → 3×2  |  6   → 3×2
 *   7-9 → 3×3   |  10+ → ceil(sqrt(n)) columns
 */
function getGridSize(n) {
  if (n <= 0) return [1, 1];
  if (n === 1) return [1, 1];
  if (n === 2) return [2, 1];
  if (n === 3) return [3, 1];
  if (n === 4) return [2, 2];
  if (n === 5 || n === 6) return [3, 2];
  if (n >= 7 && n <= 9) return [3, 3];

  const cols = Math.ceil(Math.sqrt(n));
  return [cols, Math.ceil(n / cols)];
}

window.TermGrid = window.TermGrid || {};
window.TermGrid.grid = { getGridSize };