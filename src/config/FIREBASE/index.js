// Import Firebase
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYOpfbns6KQ2bvEIobYm8I3JYR1VJLzSk",
  authDomain: "netrisapp-fb033.firebaseapp.com",
  databaseURL: "https://netrisapp-fb033-default-rtdb.firebaseio.com", // Add this line
  projectId: "netrisapp-fb033",
  storageBucket: "netrisapp-fb033.appspot.com", // Fixed storage bucket
  messagingSenderId: "1078477614953",
  appId: "1:1078477614953:web:e52dd751df5a59317a97f8",
  measurementId: "G-7L8PCYT5C8"
};

// Initialize Firebase if it hasn't been initialized yet
let FIREBASE_APP;
if (!firebase.apps.length) {
  FIREBASE_APP = firebase.initializeApp(firebaseConfig);
} else {
  FIREBASE_APP = firebase.app();
}

// Create shortcuts
const FIREBASE_AUTH = firebase.auth();
const FIREBASE_DB = firebase.database();

// Export for use in other files
export default firebase;
export { FIREBASE_APP, FIREBASE_AUTH, FIREBASE_DB };