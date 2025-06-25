import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxNjiWJCzO8Y36veQxt4ElPUwyvmyhRzc",
  authDomain: "devdash-8b926.firebaseapp.com",
  projectId: "devdash-8b926",
  storageBucket: "devdash-8b926.firebasestorage.app",
  messagingSenderId: "174970728036",
  appId: "1:174970728036:web:06879dec4bfebb256d3971",
  measurementId: "G-8P2XFKDWGB"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});
const auth = getAuth(firebaseApp);
const timestamp = serverTimestamp();

console.log("Firebase inicializado em modo PRODUCAO");

export { db, auth, timestamp };