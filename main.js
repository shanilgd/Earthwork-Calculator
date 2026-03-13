const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'icon.png')
    });

    mainWindow.loadFile('index.html');
    mainWindow.setMenuBarVisibility(false);
}

// IPC Handler for Saving PDF
ipcMain.handle('save-pdf', async (event, buffer, filename) => {
    try {
        // Determine save location: 'Reports' folder next to the executable
        const exeDir = path.dirname(app.getPath('exe'));
        const reportsDir = path.join(exeDir, 'Reports');

        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const filePath = path.join(reportsDir, filename);

        // buffer comes as Uint8Array from renderer, convert to Buffer
        fs.writeFileSync(filePath, Buffer.from(buffer));

        return { success: true, path: filePath };
    } catch (error) {
        console.error("Failed to save PDF:", error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
// --- Auto-Update Logic ---
const { autoUpdater } = require('electron-updater');

// Configure logging
// In electron-log v5+, you MUST require 'electron-log/main' in the main process
const log = require("electron-log/main");
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

// Catch entirely unhandled exceptions that crash the app before windows load
process.on('uncaughtException', (error) => {
    log.error('Uncaught Exception:', error);
    try {
        const desktopPath = path.join(require('os').homedir(), 'Desktop');
        fs.writeFileSync(path.join(desktopPath, 'Earthwork_Crash_Log.txt'), `Fatal Error:\n${error.stack || error.message}`);
    } catch(e) {}
});

// Check for updates manually via IPC
app.on('ready', () => {
    // Only configure, don't auto-check
});

ipcMain.on('check-for-updates', () => {
    if (process.env.NODE_ENV !== 'development') {
        autoUpdater.checkForUpdatesAndNotify();
    }
});

// Optional: Listen for events to show custom UI or logs
autoUpdater.on('checking-for-update', () => {
    // console.log('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
    // console.log('Update available.', info);
});
autoUpdater.on('update-not-available', (info) => {
    // console.log('Update not available.', info);
});
autoUpdater.on('error', (err) => {
    // console.log('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
    // let log_message = "Download speed: " + progressObj.bytesPerSecond;
    // log_message = " - Downloaded " + progressObj.percent + "%";
    // log_message = " (" + progressObj.transferred + "/" + progressObj.total + ")";
    // console.log(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
    // console.log('Update downloaded');
});
