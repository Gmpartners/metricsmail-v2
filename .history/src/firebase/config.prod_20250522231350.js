import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

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

// 🔥 CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL COM EMULATOR
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_USE_EMULATOR === 'true';

if (isDevelopment) {
  console.log('🔥 Usando Firebase Emulator para desenvolvimento local');
  
  // Conectar ao Auth Emulator
  if (!auth._delegate._config.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  }
  
  // Conectar ao Firestore Emulator
  if (!db._delegate._databaseId.database.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  // Conectar ao Storage Emulator
  if (!storage._delegate._host.includes('localhost')) {
    connectStorageEmulator(storage, 'localhost', 9199);
  }
  
  // Conectar ao Functions Emulator
  if (!functions._delegate._url.includes('localhost')) {
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
} else {
  console.log('🔥 Usando Firebase em produção');
}

// Timestamp
const timestamp = serverTimestamp();

export { db, auth, storage, functions, timestamp };