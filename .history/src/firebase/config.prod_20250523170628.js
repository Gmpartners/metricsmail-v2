// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);