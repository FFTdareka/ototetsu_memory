import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

let app,
    auth,
    db,
    uid;

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
            uid = user.uid;
            userStatus.innerText = " としてログイン中";
            loginBtn.innerText = "ログアウト";
            loginBtn.removeEventListener("click", userLogin);
            loginBtn.addEventListener("click", userLogout);
            if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let sSpace = document.getElementById("setting");
                sSpace.innerHTML = `<div id="nameS">現在の名前: <span id="userNameS"></span><br>新しい名前: <input id="newName" type="text" placeholder="名前を入力"></div><button id="updateBtn" type="button">更新</button>`;
                document.getElementById("updateBtn").addEventListener("click", updateUser);
            }
            loadUserdata(uid);
        } else {
            userStatus.innerText = "未ログイン";
            userName.innerText = "";
            loginBtn.innerText = "ログイン";
            loginBtn.removeEventListener("click", userLogout);
            loginBtn.addEventListener("click", userLogin);
            if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let sSpace = document.getElementById("setting");
                sSpace.innerHTML = `<span>このページはGoogleアカウントにログインした人のみ利用可能です。<br><span id="login2">ログインはこちら</span></div>`;
                document.getElementById("login2").addEventListener("click", userLogin);
            }
        }
    });
}

function userLogin() {
    let provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then(res => {
            console.log("ログイン成功:", res.user);
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
        setTimeout(() => document.getElementById("logoutStatus").remove(), 5000);
    }).catch((error) => {
        logoutStatus.innerText = "ログアウト中にエラーが発生しました。";
        userSpace.appendChild(logoutStatus);
        setTimeout(() => document.getElementById("logoutStatus").remove(), 5000);
    });
}

function loadUserdata(uid) {
    getDoc(doc(db, "user", uid))
        .then(snap => {
            let userName = document.getElementById("userName");
            if (snap.exists()) {
                let d = snap.data();
                console.log("データ:", d);
                userName.innerText = d.name || "匿名";
                if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") document.getElementById("userNameS").innerText = d.name || "匿名";
            } else {
                console.log("データが存在しません");
                userName.innerText = "匿名";
                if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") document.getElementById("userNameS").innerText = "匿名";
            }
        })
        .catch(er => console.error("読み込み失敗:", er));
}

function updateUser() {
    let newNameE = document.getElementById("newName");
    if (newNameE) {
        setDoc(doc(db, "user", uid), {
            name: newNameE.value
        }, { merge: true })
        .then(() => {
            console.log("更新成功");
            let noticeU = document.createElement("div");
            noticeU.id = "noticeU";
            noticeU.classList.add("notice");
            noticeU.innerText = "更新が完了しました。";
            document.getElementById("setting").appendChild(noticeU);
            setTimeout(() => document.getElementById("noticeU").remove(), 5000);
        })
        .catch(error => {
            let noticeU = document.createElement("div");
            noticeU.id = "noticeU";
            noticeU.classList.add("notice");
            noticeU.innerText = "更新に失敗しました。";
            document.getElementById("setting").appendChild(noticeU);
            setTimeout(() => document.getElementById("noticeU").remove(), 5000);
            console.error("保存失敗:", error)
        });
    }
}
