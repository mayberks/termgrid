'use strict';

const TerminalCtor = window.Terminal;
const FitAddonCtor = window.FitAddon ? window.FitAddon.FitAddon : null;

if (!TerminalCtor || !FitAddonCtor) {
  throw new Error('xterm.js or xterm-addon-fit failed to load.');
}

const THEME = {
  background: '#1e1e1e',
  foreground: '#cccccc',
  cursor: '#ffffff',
  cursorAccent: '#1e1e1e',
  selectionBackground: '#264f78',
  black:        '#000000',
  red:          '#cd3131',
  green:        '#0dbc79',
  yellow:       '#e5e510',
  blue:         '#2472c8',
  magenta:      '#bc3fbc',
  cyan:         '#11a8cd',
  white:        '#e5e5e5',
  brightBlack:  '#666666',
  brightRed:    '#f14c4c',
  brightGreen:  '#23d18b',
  brightYellow: '#f5f543',
  brightBlue:   '#3b8eea',
  brightMagenta:'#d670d6',
  brightCyan:   '#29b8db',
  brightWhite:  '#e5e5e5',
};

const OPTIONS = {
  fontFamily: '"Cascadia Code", "Cascadia Mono", Consolas, monospace',
  fontSize: 13,
  lineHeight: 1.1,
  cursorBlink: true,
  cursorStyle: 'block',
  allowProposedApi: true,
  scrollback: 5000,
  theme: THEME,
};

function basename(p) {
  if (!p) return '';
  return p.split(/[\\/]/).filter(Boolean).pop() || p;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

class Terminal {
  constructor(cwd) {
    this.cwd = cwd;
    this.name = basename(cwd) || 'shell';
    this.ptyId = null;

    this.term = new TerminalCtor(OPTIONS);
    this.fit  = new FitAddonCtor();
    this.term.loadAddon(this.fit);

    this.cellEl = this._createCellEl();
    this.bodyEl = this.cellEl.querySelector('.cell-body');

    this.term.open(this.bodyEl);

    this.term.onData(data => {
      if (this.ptyId != null) window.api.writePty(this.ptyId, data);
    });
  }

  _createCellEl() {
    const el = document.createElement('div');
    el.className = 'terminal-cell';
    el.innerHTML = `
      <div class="cell-header">
        <span class="dot" aria-hidden="true"></span>
        <span class="label" title="${escapeHtml(this.cwd)}">${escapeHtml(this.name)}</span>
        <button class="close" type="button" title="Close" aria-label="Close">×</button>
      </div>
      <div class="cell-body"></div>
    `;
    return el;
  }

  async attachPty() {
    const { id, error } = await window.api.createPty(this.cwd);
    if (error) {
      this.term.write(`\r\n\x1b[31mPTY failed to start: ${error}\x1b[0m\r\n`);
      return;
    }
    this.ptyId = id;
    this.refit();
  }

  refit() {
    requestAnimationFrame(() => {
      try {
        this.fit.fit();
        if (this.ptyId != null) {
          window.api.resizePty(this.ptyId, this.term.cols, this.term.rows);
        }
      } catch (_) {}
    });
  }

  write(data) {
    this.term.write(data);
  }

  focus() {
    try { this.term.focus(); } catch (_) {}
  }

  dispose() {
    if (this.ptyId != null) {
      try { window.api.killPty(this.ptyId); } catch (_) {}
      this.ptyId = null;
    }
    try { this.term.dispose(); } catch (_) {}
    this.cellEl.remove();
  }
}

window.TermGrid = window.TermGrid || {};
window.TermGrid.Terminal = Terminal;