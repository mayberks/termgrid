'use strict';

const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 600,
    minHeight: 300,
    backgroundColor: '#1e1e1e',
    title: 'TermGrid',
    autoHideMenuBar: true,
    icon: path.join(__dirname, '..', '..', 'build', 'icon.png'),

    // Windows 10/11 dark title bar: hide the OS chrome and overlay
    // the standard window controls onto our toolbar.
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#252526',
      symbolColor: '#d4d4d4',
      height: 38,
    },

    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.on('closed', () => { mainWindow = null; });
  return mainWindow;
}

function getWindow() {
  return mainWindow;
}

module.exports = { createWindow, getWindow };