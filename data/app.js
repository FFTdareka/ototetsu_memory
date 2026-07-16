import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCx0xxbgLL3N2JPjU6NWnMycqoAYcCiMZg",
    authDomain: "ototetsu-memory.firebaseapp.com",
    projectId: "ototetsu-memory",
    storageBucket: "ototetsu-memory.firebasestorage.app",
    messagingSenderId: "93907965715",
    appId: "1:93907965715:web:e2df51223aa895253e6ce6",
    measurementId: "G-JJX9BB6553"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

await function test(data) {
    setDoc(doc(db, "record", data.id), data);
}