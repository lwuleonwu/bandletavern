const admin = require("firebase-admin");

const serviceAccount = require("../bandle-tavern-v2-firebase-adminsdk-c109n-48af4fc0d4.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://bandle-tavern-v2.firebaseio.com"
});

function createToken(accountId, callback) {
    admin.auth().createCustomToken(accountId)
        .then((customToken) => {
            // send token to  client
            console.log("Token creation success! Sending token to client");
            callback("token", customToken);
        })
        .catch((error) => {
            console.log("Error creating custom token:", error);
        });
}

module.exports = {
    createToken,
}