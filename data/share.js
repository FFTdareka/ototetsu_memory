const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", () => {
    if (id != null) {
        opt = JSON.stringify({
            filter: {
                sid: id,
                eid: id
            },
            sort: {}
        });
        document.getElementById('recStatus').innerText = "読み込み中...";
        fetch('data/staData.json')
        .then(res => res.json())
        .then(g => {
            d = g.d;
            sc = g.line;
            fetch(`${g.gas}?type=rec&nor=1&page=1&opt=${opt}`)
            .then(res => res.json())
            .then(data => {
                if (data.status == 'success') {
                    data = data.body[0];
                    date = data.date;
                    sta = data.station;
                    line = data.line.split("_");
                    trk = data.track;
                    cho = data.chorus;
                    time = data.time;
                    del = data.delay;
                    if (del == 0) del = "";
                    else del = `+${del}`;
                    trn = data.train;
                    bfor = data.for;
                    com = data.comment;
                    rid = data.ID;
                    log = data.log.split("\\n");
                    var s = document.createElement("div");
                    for (var i = 0; i < log.length; i++) {
                        if (i > 0) {
                            var br = document.createElement("br");
                            s.appendChild(br);
                        }
                        var sp = document.createElement("span");
                        sp.innerText = log[i];
                        s.appendChild(sp);
                    }
                    let dt = [date, sta, line[0], trk, cho, time, trn, bfor, com];
                    let rDatas = document.createElement("span");
                    rDatas.id = rid;
                    for (var j = 0; j < d.length; j++) {
                        var rd = document.createElement("span");
                        rd.innerText = `${d[j]}:`;
                        var rData = document.createElement('span');
                        rData.classList.add("data");
                        rData.innerText = dt[j];
                        if (j == 2)
                            for (var k = 0; k < sc.length; k++) if (line[1] == sc[k][0]) rData.classList.add(sc[k][1]);
                        if (j == 5 && del != 0) {
                            delE = document.createElement("span");
                            delE.innerText = del;
                            delE.classList.add("delay");
                            delE.classList.add("data");
                            rData.appendChild(delE);
                        }
                        rd.appendChild(rData);
                        rDatas.appendChild(rd);
                        rDatas.appendChild(document.createElement("br"));
                    }
                    rDatas.appendChild(document.createElement("br"));
                    var rd2 = document.createElement('span');
                    rd2.innerText = "履歴";
                    rd2.appendChild(document.createElement("br"));
                    var rData2 = document.createElement('span');
                    rData2.classList.add("data");
                    rData2.appendChild(s);
                    rd2.appendChild(rData2);
                    rDatas.appendChild(rd2);
                    document.getElementById("recSpace").appendChild(rDatas);
                    document.getElementById("recStatus").innerText = "";
                } else if (data.status == 'no record') document.getElementById('recStatus').innerText = "指定した鳴動記録のデータがありません。";
            })
        })
    } else document.getElementById("recStatus").innerText = "表示する鳴動記録が指定されていません。";
})