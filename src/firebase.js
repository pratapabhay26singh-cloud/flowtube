import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVAoverCDFsu9dCx_bTsAYLNJBHCdqPyA",
  authDomain: "flowtube-fc54c.firebaseapp.com",
  projectId: "flowtube-fc54c",
  storageBucket: "flowtube-fc54c.firebasestorage.app",
  messagingSenderId: "481840958328",
  appId: "1:481840958328:web:a8021ad4b52917a024568d",
  measurementId: "G-XE7NS5FN9C",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
