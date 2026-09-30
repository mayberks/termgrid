'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// The renderer's only bridge to the main process. Keep this surface
// minimal — anything added here is callable from the renderer.
contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),

  createPty: (cwd, shell) => ipcRenderer.invoke('pty:create', { cwd, shell }),
  writePty:  (id, data)   => ipcRenderer.send('pty:write',  { id, data }),
  resizePty: (id, cols, rows) => ipcRenderer.send('pty:resize', { id, cols, rows }),
  killPty:   (id)         => ipcRenderer.send('pty:kill',    { id }),

  onPtyData: (cb) => ipcRenderer.on('pty:data', (_, payload) => cb(payload)),
  onPtyExit: (cb) => ipcRenderer.on('pty:exit', (_, payload) => cb(payload)),
});