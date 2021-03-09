const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const fs = require("fs");
const client = require("./client.js");

let mainWindow;
let lockfilePath = "C:/Riot Games/League of Legends/lockfile";
client.readLockfile(lockfilePath);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js"),
            // webSecurity: false
        }
    });

    // change if not doing testing
    const startURL = "https://127.0.0.1:3000";

    mainWindow.loadURL(startURL);
    mainWindow.openDevTools();
}

ipcMain.on("toMain", (event, args) => {
    if (args === "mission") {
        client.retrieveClientData(client.requestPaths.missions, sendToRenderer);
    } else if (args === "player") {
        client.retrieveClientData(client.requestPaths.playerId, sendToRenderer);
    }
});

function sendToRenderer(channel, data) {
    if (channel === client.requestPaths.missions) {
        mainWindow.webContents.send("missions", data);
    } else if (channel === client.requestPaths.playerId) {
        mainWindow.webContents.send("player", data);
    } else {
        mainWindow.webContents.send("fromMain", data);
    }
}

app.whenReady().then(createWindow);
app.commandLine.appendSwitch("ignore-certificate-errors");

app.on("window-all-closed", () => {
    app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0)
        createWindow();
});
