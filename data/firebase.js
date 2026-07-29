import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

let app,
    auth;

fetch('data/staData.json')
    .then(res => res.json())
    .then(f => {
        app = initializeApp(f.firebase);
        getAnalytics(app);
        auth = getAuth(app);
        status();
    });

function status() {
    let userStatus = document.getElementById("userStatus");
    let loginBtn = document.getElementById("login");
    onAuthStateChanged(auth, user => {
        if (user) {
            userStatus.innerText = "ログイン中";
            loginBtn.innerText = "ログアウト";
            loginBtn.removeEventListener("click", userLogin);
            loginBtn.addEventListener("click", userLogout);
        } else {
            userStatus.innerText = "未ログイン";
            loginBtn.innerText = "ログイン";
            loginBtn.removeEventListener("click", userLogout);
            loginBtn.addEventListener("click", userLogin);
        }
    });
}

function userLogin() {
    let provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(result => console.log("ログイン成功:", result.user))
        .catch(error => console.error("ログイン失敗:", error.code, error.message));
}

function userLogout() {
    let logoutStatus = document.createElement("span");
    let userSpace = document.getElementById("user");
    logoutStatus.id = "logoutStatus";
    logoutStatus.classList.add("notice");
    signOut(auth).then(() => {
        logoutStatus.innerText = "ログアウトが完了しました。";
        userSpace.appendChild(logoutStatus);
        setTimeout(() => document.getElementById(logoutStatus).innerText = "", 5000);
    }).catch((error) => {
        logoutStatus.innerText = "ログアウト中にエラーが発生しました。";
        userSpace.appendChild(logoutStatus);
        setTimeout(() => document.getElementById(logoutStatus).innerText = "", 5000);
    });
}