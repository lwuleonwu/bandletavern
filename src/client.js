// request paths to client API
// all client requests will be made to localRoutingValue + desired path
const localRoutingValue = "https://127.0.0.1:";
const requestPaths = {
    missions: "/lol-missions/v1/missions",
    playerId: "/lol-summoner/v1/current-summoner",
};

let lockfileSuccess = false; // redundancy for safety
let lockfile = {}; // lockfile format is process:pid:port:password:protocol
let lockfileInterval;

// detects when session storage receives lockfile data from electron/main.js
function clientInit() {
    lockfileInterval = setInterval(detectLockfile, 500);
    console.log("Setting interval");
}

function detectLockfile() {
    console.log("Attempting read");
    let lockfileAttempt = readLockfile();
    if (lockfileAttempt) {
        clearInterval(lockfileInterval);
    }
}

// read lockfile contents saved in session storage
// must be ran before anything else in client.js!
function readLockfile() {
    let lockfileText = sessionStorage.getItem("lockfile");
    if (lockfileText) {
        lockfileText = lockfileText.split(":");
        lockfile.process = lockfileText[0];
        lockfile.pid = lockfileText[1];
        lockfile.port = lockfileText[2];
        lockfile.password = lockfileText[3];
        lockfile.protocol = lockfileText[4];
        lockfileSuccess = true;

        console.log(lockfile);
        return true;
    }
    return false;
}

function retrieveClientData(requestPath) {
    if (lockfileSuccess) {
        let completePath = localRoutingValue + lockfile.port + requestPath;
        let authCode = `riot:${lockfile.password}`;

        // create http request to client
        let fetchOptions = {
            method: "GET",
            mode: "cors",
            headers: {
                "Accept": "application/json",
                "Authorization": `Basic ${window.btoa(authCode)}`,
            }
        };

        fetch(completePath, fetchOptions).then(response => {
                response.json().then(jsonResponse => {
                    // TODO: testing
                    let validMissions = parseMissionData(jsonResponse);
                    console.log(validMissions);
                });
            })
            .catch(error => {
                console.log(error);
                console.log("ERROR: could not find endpoint");
            });

    } else {
        // lockfile has not been read yet
        console.log("ERROR: Lockfile not read");
    }
}

// parse mission data in json format
function parseMissionData(data) {
    let pendingMissions = data.filter(mission =>
        mission.status === "PENDING" &&
        mission.displayType !== "TUTORIAL_ONLY" &&
        mission.rewards.length > 0);
    
    return pendingMissions;
}

export {requestPaths, clientInit, readLockfile, retrieveClientData};
