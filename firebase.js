// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB6asthrjc-7nv4JlyCt0on9HK-2JMD76C",
  authDomain: "de-jo-bluea.firebaseapp.com",
  projectId: "de-jo-bluea",
  storageBucket: "de-jo-bluea.appspot.com",
  messagingSenderId: "213345773472",
  appId: "1:213345773472:web:5d0fbed7b68741e2c2e6c5",
  measurementId: "G-V187CTTKMT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Export Firestore instance
export { db };
