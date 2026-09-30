'use strict';

(function () {
  window.addEventListener('error', e => {
    console.error('[termgrid] uncaught:', e.error || e.message);
  });
  window.addEventListener('unhandledrejection', e => {
    console.error('[termgrid] unhandled rejection:', e.reason);
  });

  try {
    init();
  } catch (e) {
    console.error('[termgrid] init failed:', e);
  }

  function init() {
    const tg = window.TermGrid || {};
    const grid = tg.grid;
    const Terminal = tg.Terminal;

    if (!grid || !Terminal) {
      console.error('[termgrid] required modules missing');
      return;
    }

    const gridEl     = document.getElementById('grid');
    const newTabBtn  = document.getElementById('new-tab');
    const emptyState = document.getElementById('empty-state');

    if (!newTabBtn) {
      console.error('[termgrid] #new-tab element missing');
      return;
    }

    const terminals = [];

    function applyGridLayout() {
      const n = terminals.length;
      emptyState.classList.toggle('hidden', n > 0);
      if (n === 0) return;
      const [cols, rows] = grid.getGridSize(n);
      gridEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      gridEl.style.gridTemplateRows    = `repeat(${rows}, 1fr)`;
      for (const t of terminals) t.refit();
    }

    async function addTerminal(cwd) {
      const term = new Terminal(cwd);
      gridEl.appendChild(term.cellEl);
      term.cellEl.querySelector('.close').addEventListener('click', e => {
        e.stopPropagation();
        removeTerminal(term);
      });
      term.cellEl.addEventListener('mousedown', () => term.focus());
      terminals.push(term);
      await term.attachPty();
      applyGridLayout();
      term.focus();
    }

    function removeTerminal(term) {
      const idx = terminals.indexOf(term);
      if (idx === -1) return;
      term.dispose();
      terminals.splice(idx, 1);
      applyGridLayout();
    }

    async function onAddClick() {
      try {
        const cwd = await window.api.selectFolder();
        if (cwd) await addTerminal(cwd);
      } catch (e) {
        console.error('[termgrid] folder picker failed:', e);
      }
    }

    // Expose for the inline `onclick` in index.html and the early
    // Ctrl+G handler in <head>.
    window.__tgNew = onAddClick;

    window.api.onPtyData(({ id, data }) => {
      const t = terminals.find(x => x.ptyId === id);
      if (t) t.write(data);
    });

    window.api.onPtyExit(({ id, exitCode }) => {
      const t = terminals.find(x => x.ptyId === id);
      if (!t) return;
      t.term.write(`\r\n\x1b[33m[Process exited with code ${exitCode}]\x1b[0m\r\n`);
      t.ptyId = null;
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        for (const t of terminals) t.refit();
      }, 60);
    });

    // Keyboard activation for the role="button" FAB (Enter / Space).
    newTabBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onAddClick();
      }
    });

    applyGridLayout();
  }
})();