import {
    getNews
} from "./news.js";
import {
    createNews,
    editNews,
    deleteNews,
} from "./firebase.js";

const params = new URLSearchParams(window.location.search);
const idParam = params.get("id");
const id = idParam ? Number(idParam) : null;

const titleS = document.getElementById("addNews_title");
const bodyS = document.getElementById("addNews_body");
const rankS = document.getElementById("addNews_rank");
const chkS = document.getElementById("addNews_chk");
const btnS = document.getElementById("addNews_btn");
const delS = document.getElementById("deleteNews_btn");
const statusS = document.getElementById("newsStatus");
const msgS = document.getElementById("newsMsg");

const NEWS_LIST_URL = "https://fftdareka.github.io/ototetsu_memory/member/news.html";

let msgTimer = null;

init();

async function init() {
    chkS.addEventListener("change", () => {
        btnS.disabled = !chkS.checked;
    });

    if (id != null) {
        // URLにidパラメータがある場合は編集・削除モード
        btnS.innerText = "更新";
        if (delS) {
            delS.style.display = "inline-block";
            delS.addEventListener("click", onDelete);
        }
        if (statusS) statusS.innerText = "読込中...";

        const data = await getNews(1, "", true, id);
        if (!data || data === "ニュースの取得に失敗しました。") {
            if (statusS) statusS.innerText = "";
            showMessage(
                data ? data : "指定されたニュースが見つかりません。",
                "error",
            );
            titleS.disabled = true;
            bodyS.disabled = true;
            rankS.disabled = true;
            chkS.disabled = true;
            return;
        }

        titleS.value = data.title;
        bodyS.value = data.body;
        rankS.value = data.rank;
        if (statusS) statusS.innerText = "";

        btnS.addEventListener("click", onUpdate);
    } else {
        // URLにidパラメータがない場合は新規作成モード
        btnS.innerText = "作成";
        if (delS) delS.style.display = "none";
        btnS.addEventListener("click", onCreate);
    }
}

function validateNewsInput() {
    if (!titleS.value.trim()) return "エラー:タイトルが入力されていません。";
    if (!bodyS.value.trim()) return "エラー:本文が入力されていません。";

    if (rankS.value === "") {
        return "エラー:掲載順位が入力されていません。";
    }
    const rank = Number(rankS.value);
    if (!Number.isInteger(rank) || rank < 1) {
        return "エラー:掲載順位は1以上の整数で入力してください。";
    }

    return null;
}

function showMessage(text, type = "notice") {
    if (!msgS) return;

    if (msgTimer) {
        clearTimeout(msgTimer);
        msgTimer = null;
    }

    msgS.innerText = text;
    msgS.className = type;
    msgS.style.display = text ? "block" : "none";

    if (text) {
        msgTimer = setTimeout(() => {
            msgS.style.display = "none";
            msgTimer = null;
        }, 5000);
    }
}

function clearMessage() {
    showMessage("");
}

async function onCreate() {
    const validationError = validateNewsInput();
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }
    clearMessage();

    btnS.disabled = true;
    if (statusS) statusS.innerText = "作成中...";

    try {
        const res = await createNews({
            title: titleS.value,
            body: bodyS.value,
            rank: Number(rankS.value),
        });

        if (statusS) statusS.innerText = "";

        if (isErrorMessage(res.message)) {
            showMessage(res.message, "error");
            btnS.disabled = !chkS.checked;
            return;
        }

        location.href = NEWS_LIST_URL;
    } catch (e) {
        console.error("ニュース作成失敗:", e);
        if (statusS) statusS.innerText = "";
        showMessage("エラー:作成に失敗しました。", "error");
        btnS.disabled = !chkS.checked;
    }
}

async function onUpdate() {
    const validationError = validateNewsInput();
    if (validationError) {
        showMessage(validationError, "error");
        return;
    }
    clearMessage();

    btnS.disabled = true;
    if (statusS) statusS.innerText = "編集中...";

    try {
        const res = await editNews({
            id: id,
            title: titleS.value,
            body: bodyS.value,
            rank: Number(rankS.value),
        });

        if (statusS) statusS.innerText = "";

        if (isErrorMessage(res.message)) {
            showMessage(res.message, "error");
            btnS.disabled = !chkS.checked;
            return;
        }

        location.href = NEWS_LIST_URL;
    } catch (e) {
        console.error("ニュース編集失敗:", e);
        if (statusS) statusS.innerText = "";
        showMessage("エラー:編集に失敗しました。", "error");
        btnS.disabled = !chkS.checked;
    }
}

async function onDelete() {
    if (!confirm("本当に削除しますか?この操作は取り消せません。")) return;

    delS.disabled = true;
    if (statusS) statusS.innerText = "削除中...";
    clearMessage();

    try {
        const res = await deleteNews({id: id});

        if (statusS) statusS.innerText = "";

        if (res && res.message) {
            showMessage(res.message, "error");
            delS.disabled = false;
            return;
        }

        location.href = NEWS_LIST_URL;
    } catch (e) {
        console.error("ニュース削除失敗:", e);
        if (statusS) statusS.innerText = "";
        showMessage("エラー:削除に失敗しました。", "error");
        delS.disabled = false;
    }
}

/**
 * Cloud Functionsからのmessageがエラーを表しているかを判定する。
 * (作成・編集は成功時も"投稿が完了しました。"等のmessageを返すため、
 *  "エラー:"接頭辞の有無で判定する)
 * @param {string|null|undefined} message
 * @return {boolean}
 */
function isErrorMessage(message) {
    return !!message && message.startsWith("エラー:");
}