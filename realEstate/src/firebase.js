// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "realestate-385b0.firebaseapp.com",
  projectId: "realestate-385b0",
  storageBucket: "realestate-385b0.appspot.com",
  messagingSenderId: "978597411304",
  appId: "1:978597411304:web:22e0f3ead570f41fb78c5d"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);