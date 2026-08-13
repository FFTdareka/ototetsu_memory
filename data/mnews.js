import {
    getNews
} from "./news.js";

async function setNews() {
    let newsS = document.getElementById("newsSpace");
    let statusN = document.getElementById("newsStatus");
    statusN.innerText = "読込中...";
    let data = await getNews(-1, "", true);
    if (data == "ニュースの取得に失敗しました。") {
        statusN.innerText = data;
    } else {
        data.forEach((news, i) => {
            if (i > 0) {
                newsS.appendChild(document.createElement("br"));
            }

            let g = document.createElement("div");
            g.classList.add("news");
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
            statusN.innerText = "";
        });
    }
}

setNews();
