let userStatus = document.getElementById("useStatus");
let loginBtn = document.getElementById("login");
firebase.auth().onAuthStateChanged(user => {
    if (user) {
        userStatus.innerText = "ログイン中";
        loginBtn.innerText = "ログアウト";
    } else {
        userStatus.innerText = "未ログイン";
        loginBtn.innerText = "ログイン";
    }
});