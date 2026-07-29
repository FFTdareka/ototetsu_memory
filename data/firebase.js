import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let app,
    auth,
    db;

fetch('data/staData.json')
    .then(res => res.json())
    .then(f => {
        app = initializeApp(f.firebase);
        getAnalytics(app);
        auth = getAuth(app);
        db = getFirestore(app);
        status();
    });

function status() {
    let userStatus = document.getElementById("userStatus");
    let userName = document.getElementById("userName");
    let loginBtn = document.getElementById("login");
    onAuthStateChanged(auth, user => {
        if (user) {
            userStatus.innerText = "ログイン中";
            loginBtn.innerText = "ログアウト";
            loginBtn.removeEventListener("click", userLogin);
            loginBtn.addEventListener("click", userLogout);
        } else {
            userStatus.innerText = "未ログイン";
            userName.innerText = "";
            loginBtn.innerText = "ログイン";
            loginBtn.removeEventListener("click", userLogout);
            loginBtn.addEventListener("click", userLogin);
        }
    });
}

function userLogin() {
    let provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(res => {
            console.log("ログイン成功:", res.user);
            loadUserdata(res.user.uid);
        })
        .catch(er => console.error("ログイン失敗:", er.code, er.message));
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

function loadUserdata(uid) {
    getDoc(doc(db, "user", uid))
        .then(snap => {
            let userName = document.getElementById("userName");
            if (snap.exists()) {
                let d = snap.data();
                console.log("データ:", d);
                if (d.name) userName.innerText = d.name; else userName.innerText = "匿名";
            } else {
                console.log("データが存在しません");
                userName.innerText = "匿名";
            }
        })
        .catch(er => console.error("読み込み失敗:", er));
}
