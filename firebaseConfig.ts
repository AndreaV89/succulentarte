// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaSrCU7FfZAXJR1Fz3CuTuQXyoiyFPOUs",
  authDomain: "succulentarte.firebaseapp.com",
  projectId: "succulentarte",
  storageBucket: "succulentarte.firebasestorage.app",
  messagingSenderId: "331368890082",
  appId: "1:331368890082:web:672d00ce9b3c0b7280a8bb",
  measurementId: "G-EFDJ65M0V9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
