import {
    getNews
} from "./news.js";

async function setNews() {
    let newsS = document.getElementById("newsSpace");
    newsS.innerText = "読込中...";
    let data = await getNews(-1, "", true);
    if (data == "ニュースの取得に失敗しました。") {
        newsS.innerText = data;
    } else {
        
    }
}