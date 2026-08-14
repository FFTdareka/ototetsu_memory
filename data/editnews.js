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

init();

async function init() {
    chkS.addEventListener("change", () => {
        btnS.disabled = !chkS.checked;
    });

    if (id != null) {
        // URLにidパラメータがある場合は編集・削除モード
        btnS.innerText = "編集";
        if (delS) {
            delS.style.display = "inline-block";
            delS.addEventListener("click", onDelete);
        }
        if (statusS) statusS.innerText = "読込中...";

        const data = await getNews(1, "", true, id);
        if (!data || data === "ニュースの取得に失敗しました。") {
            if (statusS) {
                statusS.innerText = data ?
                    data :
                    "指定されたニュースが見つかりません。";
            }
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

async function onCreate() {
    btnS.disabled = true;
    if (statusS) statusS.innerText = "作成中...";

    try {
        const res = await createNews({
            title: titleS.value,
            body: bodyS.value,
            rank: Number(rankS.value),
        });

        if (statusS) statusS.innerText = res.message || "";
    } catch (e) {
        console.error("ニュース作成失敗:", e);
        if (statusS) statusS.innerText = "エラー:作成に失敗しました。";
    }

    btnS.disabled = !chkS.checked;
}

async function onUpdate() {
    btnS.disabled = true;
    if (statusS) statusS.innerText = "編集中...";

    try {
        const res = await editNews({
            id: id,
            title: titleS.value,
            body: bodyS.value,
            rank: Number(rankS.value),
        });

        if (statusS) statusS.innerText = res.message || "";
    } catch (e) {
        console.error("ニュース編集失敗:", e);
        if (statusS) statusS.innerText = "エラー:編集に失敗しました。";
    }

    btnS.disabled = !chkS.checked;
}

async function onDelete() {
    if (!confirm("本当に削除しますか?この操作は取り消せません。")) return;

    delS.disabled = true;
    if (statusS) statusS.innerText = "削除中...";

    try {
        const res = await deleteNews({id: id});

        if (res && res.message) {
            if (statusS) statusS.innerText = res.message;
            delS.disabled = false;
            return;
        }

        if (statusS) statusS.innerText = "削除が完了しました。";
        setTimeout(() => {
            location.href = "https://fftdareka.github.io/ototetsu_memory/member/news.html";
        }, 800);
    } catch (e) {
        console.error("ニュース削除失敗:", e);
        if (statusS) statusS.innerText = "エラー:削除に失敗しました。";
        delS.disabled = false;
    }
}