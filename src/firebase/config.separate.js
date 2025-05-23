import { initializeApp } from "firebase/app";
import { initializeFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

// 🔥 CONFIGURAÇÃO PARA PROJETO FIREBASE SEPARADO DE DESENVOLVIMENTO
const firebaseConfigDev = {
  apiKey: "SUA_API_KEY_DO_PROJETO_DEV",
  authDomain: "seu-projeto-dev.firebaseapp.com",
  projectId: "seu-projeto-dev",
  storageBucket: "seu-projeto-dev.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456",
};

// CONFIGURAÇÃO PRODUÇÃO (atual)
const firebaseConfigProd = {
  apiKey: "AIzaSyB09KvwgeCxx4pt2fjGW_KzuKh3bDIYHlc",
  authDomain: "dashadmin-19344.firebaseapp.com",
  projectId: "dashadmin-19344",
  storageBucket: "dashadmin-19344.firebasestorage.app",
  messagingSenderId: "909444659913",
  appId: "1:909444659913:web:5d5e1398538488359eab18",
  measurementId: "G-5K1J2GWLR0"
};

// Usar config baseado no ambiente
const firebaseConfig = import.meta.env.DEV ? firebaseConfigDev : firebaseConfigProd;

console.log(`🔥 Usando Firebase: ${import.meta.env.DEV ? 'DESENVOLVIMENTO' : 'PRODUÇÃO'}`);

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