function getNews(n = 0, e = "newsSpace") {
    let el = document.getElementById(e);
    if (el) {
        document.getElementById('newsStatus').innerText = "読み込み中...";
        document.getElementById('newsSpace').innerHTML = "";
        fetch('staData.json')
            .then(res => res.json())
            .then(g => {
                fetch(`${g.gas}?type=news`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.status == 'success') {
                            let ns = data.body;
                            if (n > data.nor || n == -1) n = data.nor;
                            for (var i = 0; i < n; i++) {
                                if (i > 0) {
                                    var br = document.createElement(
                                        "br");
                                    el.appendChild(br);
                                }
                                var g = document.createElement("div");
                                g.classList.add("news");
                                var t = document.createElement("div");
                                t.innerText = ns[i][0];
                                t.style = "font-weight: bold;";
                                g.appendChild(t);
                                var txt = ns[i][1].split("\\n");
                                var s = document.createElement("div");
                                for (var j = 0; j < txt.length; j++) {
                                    if (j > 0) {
                                        var br = document.createElement(
                                            "br");
                                        s.appendChild(br);
                                    }
                                    var sp = document.createElement(
                                        "span");
                                    sp.innerText = txt[j];
                                    s.appendChild(sp);
                                }
                                g.appendChild(s);
                                var p = document.createElement("div");
                                p.innerText = `執筆者:${ns[i][2]}`;
                                g.appendChild(p);
                                el.appendChild(g);
                                document.getElementById('newsStatus').innerText =
                                    "";
                            }
                            if (n == 0) document.getElementById(
                                    'newsStatus').innerText =
                                "ニュースはありません。";
                        }
                    })
            })
    }
}
