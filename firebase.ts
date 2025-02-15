// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXq2XDddEqjWmdgw8uMXs9Dm-ro_HVFPI",
  authDomain: "isscohub-da69b.firebaseapp.com",
  projectId: "isscohub-da69b",
  storageBucket: "isscohub-da69b.firebasestorage.app",
  messagingSenderId: "592754390453",
  appId: "1:592754390453:web:f32e2b0ba99329caec15fc",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
