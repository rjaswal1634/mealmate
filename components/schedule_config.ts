const admin = require('firebase-admin');
// Initialize Firebase Admin SDK with service account
const serviceAccount = require("./firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://food-detector-134f5-default-rtdb.firebaseio.com" // Replace with your database URL
});

// Initialize Realtime Database
const db = admin.database();

module.exports = { db };
