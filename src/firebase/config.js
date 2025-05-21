import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyB09KvwgeCxx4pt2fjGW_KzuKh3bDIYHlc",
  authDomain: "dashadmin-19344.firebaseapp.com",
  projectId: "dashadmin-19344",
  storageBucket: "dashadmin-19344.firebasestorage.app",
  messagingSenderId: "909444659913",
  appId: "1:909444659913:web:5d5e1398538488359eab18",
  measurementId: "G-5K1J2GWLR0"
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});
const auth = getAuth(firebaseApp);
const storage = getStorage(firebaseApp);
const functions = getFunctions(firebaseApp, 'us-central1');

// Timestamp
const timestamp = serverTimestamp();

export { db, auth, storage, functions, timestamp };