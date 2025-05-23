import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxNjiWJCzO8Y36veQxt4ElPUwyvmyhRzc",
  authDomain: "devdash-8b926.firebaseapp.com",
  projectId: "devdash-8b926",
  storageBucket: "devdash-8b926.firebasestorage.app",
  messagingSenderId: "174970728036",
  appId: "1:174970728036:web:06879dec4bfebb256d3971",
  measurementId: "G-8P2XFKDWGB"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize services
const db = initializeFirestore(firebaseApp, {
  ignoreUndefinedProperties: true,
});
const auth = getAuth(firebaseApp);

// Configuração para desenvolvimento local com emulator
const isDevelopment = import.meta.env.DEV;
let emulatorsConnected = false;

if (isDevelopment && !emulatorsConnected) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    emulatorsConnected = true;
    console.log('✅ Emulators conectados');
  } catch (error) {
    console.warn('⚠️ Emulators já conectados');
    emulatorsConnected = true;
  }
}

const timestamp = serverTimestamp();

export { db, auth, timestamp };