// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage' 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeexi_jLLxIw3x0abNRQw6rMU4e3FGhMs",
  authDomain: "myproject-9b943.firebaseapp.com",
  projectId: "myproject-9b943",
  storageBucket: "myproject-9b943.appspot.com",
  messagingSenderId: "554871911567",
  appId: "1:554871911567:web:45ce4c44b175c9ae07ecfa",
  measurementId: "G-5C8FK0TW2B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getFirestore(app)
const storage = getStorage(app)
export { app, database, analytics, storage }