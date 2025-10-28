// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGc0F7vgPv9dxYFJB9AjOVxnVnkbwc26c",
  authDomain: "reservation-system-58a94.firebaseapp.com",
  projectId: "reservation-system-58a94",
  storageBucket: "reservation-system-58a94.firebasestorage.app",
  messagingSenderId: "259228980090",
  appId: "1:259228980090:web:5213f5db65c83987b8bcc3",
  measurementId: "G-S1J9MD0H40"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


