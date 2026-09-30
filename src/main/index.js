'use strict';

const { app, nativeTheme, BrowserWindow } = require('electron');

const { createWindow, getWindow } = require('./window');
const { registerIpc } = require('./ipc');
const { PtyManager } = require('./pty-manager');

app.setName('TermGrid');
app.setAppUserModelId('com.termgrid.app');
nativeTheme.themeSource = 'dark';

const ptyManager = new PtyManager();

app.whenReady().then(() => {
  registerIpc(ptyManager, getWindow);
  createWindow();
});

app.on('window-all-closed', () => {
  ptyManager.killAll();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});