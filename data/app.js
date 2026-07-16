import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

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
const analytics = getAnalytics(app);