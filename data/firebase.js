import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

fetch('data/staData.json')
  .then(res => res.json())
  .then(f => {
    const app = initializeApp(f.firebase);
    getAnalytics(app);
    const auth = getAuth(app);
    let userStatus = document.getElementById("useStatus");
    let loginBtn = document.getElementById("login");
    onAuthStateChanged(auth, user => {
      if (user) {
        userStatus.innerText = "ログイン中";
        loginBtn.innerText = "ログアウト";
      } else {
        userStatus.innerText = "未ログイン";
        loginBtn.innerText = "ログイン";
      }
    });
  });