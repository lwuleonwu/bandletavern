import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "bandle-tavern-v2.firebaseapp.com",
    databaseURL: "https://bandle-tavern-v2.firebaseio.com",
    projectId: "bandle-tavern-v2",
    storageBucket: "bandle-tavern-v2.appspot.com",
    messagingSenderId: "417771338735",
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: "G-2FWDL56D2G"
};

firebase.initializeApp(firebaseConfig);
let database = firebase.database();

// check if user with accountId is registered for mission
// return null if not registered, return missionId if registered
function checkUser(accountId, callback) {
    console.log("Checking database for user with accountId:", accountId);
    database.ref(`users/${accountId}`).once("value").then(response => {
        let registeredMissionId = response.val();
        if (registeredMissionId !== null) {
            callback(registeredMissionId.missionId);
        }
        callback(-1);
    });
}

// register user under missionId
function registerMission(playerInfo, missionId) {
    console.log("Registering user:", playerInfo.displayName, "for mission:", 
        missionId);
    // create database entry under mission id with player info
    let databaseMissionPath = `missions/${missionId}/${playerInfo.accountId}`;
    database.ref(databaseMissionPath).set({
        accountId: playerInfo.accountId,
        summonerId: playerInfo.summonerId,
        displayName: playerInfo.displayName,
        puuid: playerInfo.puuid
    }, (error) => {
        if (error) {
            // write to database failed
            console.log("Failed to write player info under missionId:", missionId);
            console.log(error);
        } else {
            console.log("Wrote player info under missionId:", missionId);
        }
    });

    // add player to list of active users
    let databaseUserPath = `users/${playerInfo.accountId}`;
    database.ref(databaseUserPath).set({
        missionId: missionId
    }, (error) => {
        if (error) {
            // write to databse failed
            console.log("Failed to write player info in user list with missionId:", missionId);
            console.log(error);
        } else {
            // data written complete
            console.log("Added player to list of active users for missionId:", missionId);
        }
    });
}

// remove user from database
function unregisterMission(playerInfo, missionId) {
    console.log("Removing user:", playerInfo.displayName, "from missionId:",
         missionId);
    let databaseMissionPath = `missions/${missionId}/${playerInfo.accountId}`;
    database.ref(databaseMissionPath).remove();

    let databaseUserPath = `users/${playerInfo.accountId}`;
    database.ref(databaseUserPath).remove();
}

// listen for updates to user list under missionId
function addMissionListener(missionId, callback) {
    console.log("Adding listener for missionId:", missionId);
    let databaseMissionPath = `missions/${missionId}`;
    database.ref(databaseMissionPath).on("child_added", snapshot => {
        let snapshotJSON = snapshot.toJSON();
        console.log(snapshotJSON);
        callback(snapshotJSON, true);
    }, (error) => {
        console.log("Failed to add listener for child_added under:",
            databaseMissionPath);
        console.log(error);
    });

    database.ref(databaseMissionPath).on("child_removed", snapshot => {
        let snapshotJSON = snapshot.toJSON();
        console.log(snapshotJSON);
        callback(snapshotJSON, false);
    }, (error) => {
        console.log("Failed to add listener for child_removed under:",
            databaseMissionPath);
        console.log(error);
    });
}

// stop listening for updates to user list under missionId
function removeMissionListener(missionId) {
    console.log("Removing listener for missionId:", missionId);
    let databaseMissionPath = `missions/${missionId}`;
    database.ref(databaseMissionPath).off("child_added");
    database.ref(databaseMissionPath).off("child_removed");
}

function signIn(token) {
    console.log("Signing in with token");
    firebase.auth().signInWithCustomToken(token)
        .then((userCredential) => {
            let user = userCredential.user;
            console.log("Signed in for:", user);
        })
        .catch((error) => {
            let errorCode = error.code;
            let errorMessage = error.message;
            console.log("ERROR (%s): %s", errorCode, errorMessage);
        });
}

function signOut() {
    firebase.auth().signOut()
        .then(() => {
            // signout success
        })
        .catch((error) => {
            console.log("Error signing out:", error);
        });
}

export {checkUser, registerMission, unregisterMission, addMissionListener,
    removeMissionListener, signIn, signOut};