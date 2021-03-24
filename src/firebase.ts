import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyDZmMZxHbQTI4dYZgr5Ieoql0YCBUEjY4Q",
  authDomain: "squat-watch.firebaseapp.com",
  projectId: "squat-watch",
  storageBucket: "squat-watch.appspot.com",
  messagingSenderId: "675094569621",
  appId: "1:675094569621:web:9131c523fd56cff096b19c",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
