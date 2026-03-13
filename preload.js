const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    savePDF: (buffer, filename) => ipcRenderer.invoke('save-pdf', buffer, filename),
    checkForUpdates: () => ipcRenderer.send('check-for-updates')
});
