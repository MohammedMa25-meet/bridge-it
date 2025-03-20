// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDajHX8nPIqCwA3VZ51fn7AJ0Do0mx4rWc",
  authDomain: "bridge-it-12c3b.firebaseapp.com",
  projectId: "bridge-it-12c3b",
  storageBucket: "bridge-it-12c3b.firebasestorage.app",
  messagingSenderId: "1049400462323",
  appId: "1:1049400462323:web:88a6e34c217d8dc256e086",
  measurementId: "G-6L573WHBWF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
