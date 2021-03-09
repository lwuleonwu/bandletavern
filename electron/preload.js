const {contextBridge, ipcRenderer} = require("electron");

// refer to https://github.com/electron/electron/issues/9920#issuecomment-575839738
contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        let validChannels = ["toMain", "missions", "player"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["fromMain", "missions", "player"];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));

        }
    }
});
