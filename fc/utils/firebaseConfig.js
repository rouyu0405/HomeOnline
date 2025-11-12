// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcTjEMOO5eXUImfKmF20D3__wKc3_U5K8",
  authDomain: "week6-cc1ae.firebaseapp.com",
  projectId: "week6-cc1ae",
  storageBucket: "week6-cc1ae.appspot.com",
  messagingSenderId: "552604067439",
  appId: "1:552604067439:web:8ad25caa20b1c94b1e0f9a"
};

// Initialize Firebase
export const firebase_app = initializeApp(firebaseConfig);
export const firebase_auth = getAuth(firebase_app);
export const db = getFirestore(firebase_app);
export const storage = getStorage(firebase_app);