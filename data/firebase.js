import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, deleteUser, reauthenticateWithPopup } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

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
    onAuthStateChanged(auth, async user => {
        if (user) {
            uid = user.uid;
            localStorage.setItem('uid', uid);
            userStatus.innerText = " としてログイン中";
            loginBtn.innerText = "ログアウト";
            loginBtn.classList.add("redB");
            loginBtn.removeEventListener("click", userLogin);
            loginBtn.addEventListener("click", userLogout);
            if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let sSpace = document.getElementById("setting");
                sSpace.innerHTML = `<div id="nameS">現在の名前: <span id="userNameS"></span><br>新しい名前: <input id="newName" type="text" placeholder="名前を入力"></div><button id="updateBtn" type="button">更新</button><br><br><div id="delS">みんなの音鉄記録帳から退会される方はこちら　<button id="deleteBtn" class="redB" type="button">退会する</button></div>`;
                document.getElementById("updateBtn").addEventListener("click", updateUser);
                document.getElementById("deleteBtn").addEventListener("click", userDelete);
            }
            let uName = await loadUserdata(uid, true);
            userName.innerText = uName;
            if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") document.getElementById("userNameS").innerText = uName;
        } else {
            localStorage.setItem('uid', '');
            userStatus.innerText = "未ログイン";
            userName.innerText = "";
            loginBtn.innerText = "Googleでログイン";
            loginBtn.classList.remove("redB");
            loginBtn.removeEventListener("click", userLogout);
            loginBtn.addEventListener("click", userLogin);
            if (location.href == "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let sSpace = document.getElementById("setting");
                sSpace.innerHTML = `<span>このページはアカウントにログインしている方のみ利用可能です。<br><span id="login2">ログイン(Google)はこちら</span></div>`;
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
    signOut(auth).then(() => {
        showNotice("ログアウトが完了しました。", "user", true, "L");
    }).catch((error) => {
        showNotice("ログアウト中にエラーが発生しました。", "user", true, "L");
    });
}

function userDelete() {
    let user = auth.currentUser;
    if (!user) return;

    if (!confirm("本当に退会しますか？この操作は取り消せません。")) return;

    deleteDoc(doc(db, "user", user.uid))
        .then(() => {
            return deleteUser(user);
        })
        .then(() => {
            showNotice("退会が完了しました。これまでのご利用ありがとうございました。", "setStatus", true, "D");
        })
        .catch(error => {
            if (error.code === "auth/requires-recent-login") {
                let provider = new GoogleAuthProvider();
                reauthenticateWithPopup(user, provider)
                    .then(() => deleteDoc(doc(db, "user", user.uid)))
                    .then(() => deleteUser(user))
                    .then(() => {
                        showNotice("退会が完了しました。これまでのご利用ありがとうございました。", "setStatus", true, "D");
                    })
                    .catch(err => {
                        console.error("退会失敗:", err);
                        showNotice("退会に失敗しました。", "setStatus", true, "D");
                    });
            } else {
                console.error("退会失敗:", error);
                showNotice("退会に失敗しました。", "setStatus", true, "D");
            }
        });
}

function loadUserdata(uid = "guest", tf = false) {
    return getDoc(doc(db, "user", uid))
        .then(snap => {
            if (snap.exists()) {
                let d = snap.data();
                return d.name || "匿名";
            } else if (tf) {
                return setDoc(doc(db, "user", uid), {
                    name: "匿名"
                }, { merge: true })
                .then(() => "匿名")
                .catch(error => {
                    console.error("作成失敗:", error);
                    throw error;
                });
            } else {
                return "削除されたユーザー";
            }
        })
        .catch(er => {
            console.error("読込失敗:", er);
            throw er;
        });
}

function updateUser() {
    let newNameE = document.getElementById("newName");
    if (newNameE) {
        setDoc(doc(db, "user", uid), {
            name: newNameE.value
        }, { merge: true })
        .then(() => {
            showNotice("更新が完了しました。", "setting", false, "U");
            document.getElementById("userNameS").innerText = newNameE.value;
            document.getElementById("userName").innerText = newNameE.value;
        })
        .catch(error => {
            let noticeU = document.createElement("div");
            noticeU.id = "noticeU";
            noticeU.classList.add("notice");
            noticeU.innerText = "更新に失敗しました。";
            document.getElementById("setting").appendChild(noticeU);
            setTimeout(() => document.getElementById("noticeU").remove(), 5000);
            console.error("更新失敗:", error)
        });
    }
}

window.userDelete = userDelete;
window.loadUserdata = loadUserdata;
