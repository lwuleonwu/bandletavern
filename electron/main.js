const {app, BrowserWindow, ipcMain} = require("electron");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const client = require("./client.js");
const auth = require("./auth.js");

let mainWindow;
let lockfilePath = "C:/Riot Games/League of Legends/lockfile";
let playerData;
client.readLockfile(lockfilePath);

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
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
    } else if (args === "validLobby") { 
        client.retrieveClientData(client.requestPaths.validLobby, sendToRenderer);
    } else if (args === "exit") {
        app.quit();
    }
});

// receive player information
ipcMain.on("player", (event, args) => {
    playerData = args;
    
    // start database auth process
    auth.createToken(String(playerData.accountId), sendToRenderer);
});

// make post request to client to invite player
ipcMain.on("invite", (event, args) => {
    let otherPlayerData = args;
    client.invitePlayer(otherPlayerData, sendToRenderer);
});

function sendToRenderer(channel, data) {
    if (channel === client.requestPaths.missions) {
        mainWindow.webContents.send("missions", data);
    } else if (channel === client.requestPaths.playerId) {
        mainWindow.webContents.send("player", data);
    } else if (channel === "token") {
        mainWindow.webContents.send("token", data);
    } else if (channel === "invite") { 
        mainWindow.webContents.send("invite", data);
    } else if (channel === "validLobby") {
        mainWindow.webContents.send("validLobby", data);
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
