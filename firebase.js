// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGasIhrjc-7nv4JlYct0on9Hk-2JMD76c",
  authDomain: "de-je-blue.firebaseapp.com",
  projectId: "de-je-blue",
  storageBucket: "de-je-blue.firebasestorage.app",
  messagingSenderId: "213345773472",
  appId: "1:213345773472:web:5d0fbed7b68741e2c2e6c5",
  measurementId: "G-V187CTTKMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
