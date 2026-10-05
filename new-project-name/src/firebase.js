import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBi_BLcOKlbLmvqL7XZXWAo9vPcuBLzLH4",
  authDomain: "elite-trade-d242b.firebaseapp.com",
  projectId: "elite-trade-d242b",
  storageBucket: "elite-trade-d242b.firebasestorage.app",
  messagingSenderId: "198657419058",
  appId: "1:198657419058:web:4b531c638eddb42a9b992b",
  measurementId: "G-EX97L49KX2"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
