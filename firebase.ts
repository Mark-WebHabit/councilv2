// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAErHahEXLwZWekIHLcEJSaPdYJMlEhrNs",
  authDomain: "medu-dc976.firebaseapp.com",
  databaseURL: "https://medu-dc976-default-rtdb.firebaseio.com",
  projectId: "medu-dc976",
  storageBucket: "medu-dc976.appspot.com",
  messagingSenderId: "530458759557",
  appId: "1:530458759557:web:7f3a7b4cb9aed6b2dfb4ec",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
