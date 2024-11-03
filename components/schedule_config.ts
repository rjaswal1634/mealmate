import admin from 'firebase-admin';
// Initialize Firebase Admin SDK with service account
import serviceAccount from "./firebase-key.json";
import { ServiceAccount } from 'firebase-admin';
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as ServiceAccount),
  databaseURL: "https://food-detector-134f5-default-rtdb.firebaseio.com" // Replace with your database URL
});

// Initialize Realtime Database
const db = admin.database();

module.exports = { db };
