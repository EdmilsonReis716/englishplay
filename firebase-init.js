// firebase-init.js
// IMPORTANT: replace the firebaseConfig object with your project's credentials
// Get them in Firebase Console -> Project Settings -> SDK setup
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};
if (typeof firebase !== 'undefined') {
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
} else {
  console.warn('Firebase SDK not loaded. Add Firebase scripts to HTML to enable cloud chat.');
}
