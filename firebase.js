// Import Firebase SDKs
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your Firebase config (the one you shared)
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export functions for app.js and admin.js
export async function saveOrder(order) {
  const docRef = await addDoc(collection(db, "orders"), order);
  await updateDoc(docRef, { id: docRef.id });
  return docRef.id;
}

export async function fetchOrders() {
  const snap = await getDocs(collection(db, "orders"));
  return snap.docs.map(d => d.data());
}

export async function updateOrder(id, patch) {
  await updateDoc(doc(db, "orders", id), patch);
}

export async function removeOrder(id) {
  await deleteDoc(doc(db, "orders", id));
}

export async function uploadReceipt(file) {
  const path = `receipts/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function adminLogin() {
  await signInAnonymously(auth);
}

export async function adminLogout() {
  await signOut(auth);
}
