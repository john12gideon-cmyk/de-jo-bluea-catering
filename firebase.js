// firebase.js

// ====== Firebase Configuration (Use the complete keys here) ======
const firebaseConfig = {
  apiKey: "AIzaSyB6asthrjc-7nv4JlyCt0on9HK-2JMD76C",
  authDomain: "de-jo-bluea.firebaseapp.com",
  projectId: "de-jo-bluea",
  storageBucket: "de-jo-bluea.appspot.com",
  messagingSenderId: "213345773472",
  appId: "1:213345773472:web:5d0fbed7b68741e2c2e6c5",
  measurementId: "G-V187CTTKMT" // Added measurementId for completeness
};

// Compatibility script paths (used by both main.js and admin.js to load the SDKs)
const firebaseScripts = [
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage-compat.js"
];

// Function to load and initialize Firebase if the config is present
function loadFirebaseIfConfigured() {
  return new Promise((resolve) => {
    // Only proceed if API key is provided
    if (!firebaseConfig.apiKey) {
        console.warn("Firebase API key is missing. Using LocalStorage mode.");
        resolve(null);
        return;
    }

    let loaded = 0;
    firebaseScripts.forEach(src => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => {
        loaded++;
        if (loaded === firebaseScripts.length) {
          // Initialize using the global 'firebase' object from the compat scripts
          firebase.initializeApp(firebaseConfig);
          resolve({
            db: firebase.firestore(),
            storage: firebase.storage()
          });
        }
      };
      document.head.appendChild(s);
    });
  });
}

// Export the config and the loader function so other files can use them
export { firebaseConfig, loadFirebaseIfConfigured };
