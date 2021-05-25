const {ipcMain} = require("electron");
const https = require("https");
const fs = require("fs");

// request paths to client API
// all client requests will be made to localRoutingValue + desired path
const localRoutingValue = "https://127.0.0.1:";
const requestPaths = {
    missions: "/lol-missions/v1/missions",
    playerId: "/lol-summoner/v1/current-summoner",
    invite: "/lol-lobby/v2/lobby/invitations",
    validLobby: "/lol-lobby/v2/party-active",
};

let lockfile = {}; // lockfile format is process:pid:port:password:protocol
let lockfileSuccess = false;

function readLockfile(lockfilePath) {
    fs.readFile(lockfilePath, (error, lockfileData) => {
        if (error) {
            console.log("ERROR: " + error);

            return false;
        }

        let lockfileText = String(lockfileData).split(":");

        lockfile.process = lockfileText[0];
        lockfile.pid = lockfileText[1];
        lockfile.port = lockfileText[2];
        lockfile.password = lockfileText[3];
        lockfile.protocol = lockfileText[4];
        lockfileSuccess = true;

        console.log("SUCCESS: Read from lockfile!");

        /*
        console.log(`process: ${lockfile.process}`);
        console.log(`pid: ${lockfile.pid}`);
        console.log(`port: ${lockfile.port}`);
        console.log(`password: ${lockfile.password}`);
        console.log(`protocol: ${lockfile.protocol}`);
        */

        return true;
    });
}

function retrieveClientData(requestPath, callback) {
    if (lockfileSuccess) {
        let authCode = `riot:${lockfile.password}`;

        // https request options to client
        let requestOptions = {
            host: "127.0.0.1",
            port: lockfile.port,
            path: requestPath,
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Authorization": `Basic ${Buffer.from(authCode).toString("base64")}`,
            },
            rejectUnauthorized: false, // TODO: temp fix for cert error
        };

        // make request to client via https
        let clientRequest = https.request(requestOptions, (response) => {
            console.log("Request:", requestPath);
            console.log("Response status code:", response.statusCode);
            console.log("Response headers:", response.headers);

            let responseData = "";

            response.on("data", (data) => {
                responseData += data;
            });

            response.on("end", () => {
                if (requestPath === requestPaths.missions) {
                    let filteredMissions = parseMissionData(JSON.parse(responseData));
                    callback(requestPath, filteredMissions);
                } else if (requestPath === requestPaths.playerId) {
                    callback(requestPath, JSON.parse(responseData));
                } else if (requestPath == requestPaths.validLobby) {
                    callback(requestPath, responseData);
                }
            });
        });

        clientRequest.on("error", (error) => {
            console.log(error);
            // TODO: handle error more elegantly
        });

        clientRequest.end();

    } else {
        // lockfile has not been read yet
        console.log("ERROR: Lockfile not read");
        // TODO: handle error more elegantly
    }
}

// TODO: check if user is in party first
function invitePlayer(otherPlayerInfo, callback) {
    if (lockfileSuccess) {
        let authCode = `riot:${lockfile.password}`;

        let playerInviteData = [{
            "invitationId": "string",
            "state": "Requested",
            "timestamp": "",
            "toSummonerId": otherPlayerInfo.summonerId,
            "toSummonerName": otherPlayerInfo.displayName,
        }];

        // https request options to client
        let requestOptions = {
            host: "127.0.0.1",
            port: lockfile.port,
            path: requestPaths.invite,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Basic ${Buffer.from(authCode).toString("base64")}`,
            },
            rejectUnauthorized: false, // TODO: temp fix for cert error
        };

        // make request to client via https
        let clientRequest = https.request(requestOptions, (response) => {
            console.log("Request:", requestPaths.invite);
            console.log("Response status code:", response.statusCode);
            console.log("Response headers:", response.headers);

            let responseData = "";

            response.on("data", (data) => {
                responseData += data;
            });

            response.on("end", () => {
                console.log("POST request response:", responseData);
                if (response.statusCode === 200) {
                    callback("invite", response.statusCode);
                } else {
                    callback("invite", JSON.parse(responseData).message);
                }
            });
        });

        clientRequest.on("error", (error) => {
            console.log(error);
            // TODO: handle error more elegantly
        });

        clientRequest.write(JSON.stringify(playerInviteData));
        clientRequest.end();
    } else {
        // lockfile has not been read yet
        console.log("ERROR: Lockfile not read");
        // TODO: handle error more elegantly
    }
}

// parse mission data in json format
function parseMissionData(data) {
    let pendingMissions = data.filter(mission =>
        mission.status === "PENDING" &&
        mission.displayType !== "TUTORIAL_ONLY" &&
        mission.rewards.length > 0 &&
        mission.title);
    
    return pendingMissions;
}

module.exports = {
    requestPaths,
    readLockfile,
    retrieveClientData,
    invitePlayer,
};
