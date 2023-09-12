// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import {getFirestore} from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJM9aNj0Gh1kLLmpsHf9aTzVVW96oTKEA",
  authDomain: "react-native-audio-recor-506b1.firebaseapp.com",
  projectId: "react-native-audio-recor-506b1",
  storageBucket: "react-native-audio-recor-506b1.appspot.com",
  messagingSenderId: "777219339456",
  appId: "1:777219339456:web:f8633297e1ffc615a16925"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app)

const storage = getStorage(app);

export { auth, storage, db }