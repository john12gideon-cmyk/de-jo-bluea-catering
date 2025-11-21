// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC7WUC_ujbDuZl_4bAfLbfaTLaT_ferYTw",
  authDomain: "de-jo-blue.firebaseapp.com",
  projectId: "de-jo-blue",
  storageBucket: "de-jo-blue.firebasestorage.app",
  messagingSenderId: "364732854636",
  appId: "1:364732854636:web:996a9b849c5a7d1b8a8349",
  measurementId: "G-RKBCX1YXP1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
