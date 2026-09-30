'use strict';

const pty = require('node-pty');
const os = require('os');

/**
 * Owns every PTY the renderer asks for. Main process only.
 * Data and exit callbacks are wired up by `registerIpc`.
 */
class PtyManager {
  constructor() {
    this.ptys = new Map();
    this.counter = 0;
    this._onData = () => {};
    this._onExit = () => {};
  }

  setDataHandler(fn) { this._onData = fn || (() => {}); }
  setExitHandler(fn) { this._onExit = fn || (() => {}); }

  /**
   * @param {string} cwd
   * @param {string} [shell]
   * @returns {{ id: number|null, error?: string }}
   */
  spawn(cwd, shell) {
    const id = ++this.counter;
    const cmd = shell || process.env.COMSPEC || 'cmd.exe';

    let proc;
    try {
      proc = pty.spawn(cmd, [], {
        cwd: cwd || os.homedir(),
        env: { ...process.env, TERM: 'xterm-256color' },
        cols: 100,
        rows: 30,
        useConpty: true,
      });
    } catch (err) {
      return { id: null, error: err.message };
    }

    this.ptys.set(id, proc);

    proc.onData(data => this._onData(id, data));
    proc.onExit(({ exitCode }) => {
      this.ptys.delete(id);
      this._onExit(id, exitCode);
    });

    return { id };
  }

  write(id, data) {
    const p = this.ptys.get(id);
    if (p) p.write(data);
  }

  resize(id, cols, rows) {
    const p = this.ptys.get(id);
    if (!p) return;
    try { p.resize(cols, rows); } catch (_) {}
  }

  kill(id) {
    const p = this.ptys.get(id);
    if (!p) return;
    try { p.kill(); } catch (_) {}
    this.ptys.delete(id);
  }

  killAll() {
    for (const [, p] of this.ptys) {
      try { p.kill(); } catch (_) {}
    }
    this.ptys.clear();
  }
}

module.exports = { PtyManager };