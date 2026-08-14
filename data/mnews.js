import {
    getNews
} from "./news.js";

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

if (id) setNews(1, id);
else setNews();

async function setNews(n = -1, id = null) {
    let statusN = document.getElementById("newsStatus");
    if (statusN) statusN.innerText = "読込中...";

    let data = await getNews(n, "", true, id);

    if (data === "ニュースの取得に失敗しました。") {
        if (statusN) statusN.innerText = data;
    } else if (id != null) {
        if (data) {
            renderNews1(data);
            if (statusN) statusN.innerText = "";
        } else if (statusN) {
            statusN.innerText = "指定されたニュースが見つかりません。";
        }
    } else {
        renderNewsList(data);
    }
}

function renderNewsList(data) {
    let newsS = document.getElementById("newsSpace");
    let statusN = document.getElementById("newsStatus");

    if (data.length === 0) {
        if (statusN) statusN.innerText = "ニュースはありません。";
        return;
    }

    data.forEach((news, i) => {
        if (i > 0) {
            newsS.appendChild(document.createElement("br"));
        }

        let g = document.createElement("div");
        g.classList.add("news");
        g.classList.add("snews");
        g.id = `news${news.ID}`;

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
        g.addEventListener("click", () => {
            location.href = `https://fftdareka.github.io/ototetsu_memory/member/editNews.html?id=${news.ID}`;
        });

        newsS.appendChild(g);
    });

    if (statusN) statusN.innerText = "";
}

function renderNews1(data) {
    let titleS = document.getElementById("addNews_title");
    let bodyS = document.getElementById("addNews_body");
    let rankS = document.getElementById("addNews_rank");
    titleS.value = data.title;
    bodyS.value = data.body;
    rankS.value = data.rank;
}

export {
    setNews
};