import {
    getNewsData,
} from "./firebase.js";

async function getNews(n = -1, e = "newsSpace", tf = false, id = null) {
    let el = document.getElementById(e);
    if (!el && !tf) return;

    let statusEl = document.getElementById("newsStatus");
    if (statusEl) statusEl.innerText = "読み込み中...";
    if (el) el.innerHTML = "";

    try {
        let data = await getNewsData(n, id);
        console.log(data);
        if (tf) return data;
        renderNews(data, el);
        if (statusEl) {
            statusEl.innerText = data.length === 0 ?
                "ニュースはありません。" :
                `全${data.length}件`;
        }
    } catch (er) {
        console.error("ニュース取得失敗:", er);
        if (tf) return "ニュースの取得に失敗しました。";
        if (statusEl) statusEl.innerText = "ニュースの取得に失敗しました。";
    }
}

function renderNews(data, el) {
    data.forEach((news, i) => {
        if (i > 0) {
            el.appendChild(document.createElement("br"));
        }

        let g = document.createElement("div");
        g.classList.add("news");

        let t = document.createElement("div");
        t.innerText = news.title;
        t.style = "font-weight: bold;";
        g.appendChild(t);

        let s = document.createElement("div");
        let txt = news.body.split("\n");
        txt.forEach((line, j) => {
            if (j > 0) s.appendChild(document.createElement("br"));
            let sp = document.createElement("span");
            sp.innerText = line;
            s.appendChild(sp);
        });
        g.appendChild(s);

        let p = document.createElement("div");
        p.innerText = `執筆者:${news.author}`;
        g.appendChild(p);

        el.appendChild(g);
    });
}

if (location.href == "https://fftdareka.github.io/ototetsu_memory/" || location.href == "https://fftdareka.github.io/ototetsu_memory/index.html") getNews(2);
else if (location.href == "https://fftdareka.github.io/ototetsu_memory/news.html") getNews(-1);

export {
    getNews
};
