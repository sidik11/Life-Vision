import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, collection, addDoc, getDocs, query, orderBy, 
  serverTimestamp, doc, updateDoc, deleteDoc, onSnapshot 
} from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAHavU9_Fj9-b3n-NE5ijVcQmfQoz-3t0E",
  authDomain: "life-vision-society.firebaseapp.com",
  projectId: "life-vision-society",
  storageBucket: "life-vision-society.firebasestorage.app",
  messagingSenderId: "398061301908",
  appId: "1:398061301908:web:73f9a6636295face6ec481",
  measurementId: "G-LPDNJMQXK8"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);

export { 
  app, 
  analytics, 
  db, 
  auth,
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
};
