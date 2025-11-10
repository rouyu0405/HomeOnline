// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcTjEMOO5eXUImfKmF20D3__wKc3_U5K8",
  authDomain: "week6-cc1ae.firebaseapp.com",
  projectId: "week6-cc1ae",
  storageBucket: "week6-cc1ae.firebasestorage.app",
  messagingSenderId: "552604067439",
  appId: "1:552604067439:web:8ad25caa20b1c94b1e0f9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db=getFirestore(app);
export const storage = getStorage(app);