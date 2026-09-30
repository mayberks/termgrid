'use strict';

const { ipcMain, dialog } = require('electron');

function registerIpc(ptyManager, getWindow) {
  // Forward PTY output to the renderer.
  ptyManager.setDataHandler((id, data) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('pty:data', { id, data });
    }
  });

  ptyManager.setExitHandler((id, exitCode) => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('pty:exit', { id, exitCode });
    }
  });

  // Open as a free-standing dialog (no parent window) to avoid
  // Windows modal-parent edge cases.
  ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select a project folder',
      defaultPath: process.env.USERPROFILE || process.env.HOME,
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('pty:create', (_e, { cwd, shell }) => ptyManager.spawn(cwd, shell));
  ipcMain.on('pty:write',   (_e, { id, data })      => ptyManager.write(id, data));
  ipcMain.on('pty:resize',  (_e, { id, cols, rows }) => ptyManager.resize(id, cols, rows));
  ipcMain.on('pty:kill',    (_e, { id })            => ptyManager.kill(id));
}

module.exports = { registerIpc };