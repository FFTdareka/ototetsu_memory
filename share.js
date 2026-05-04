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
        fetch('staData.json')
        .then(res => res.json())
        .then(g => {
            d = g.d;
            fetch(`${g.gas}?type=rec&nor=1&page=1&opt=${opt}`)
            .then(res => res.json())
            .then(data => {
                if (data.status == 'success') {
                    data = data.body[0];
                    date = data[i].date;
                    sta = data[i].station;
                    line = data[i].line.split("_");
                    trk = data[i].track;
                    cho = data[i].chorus;
                    time = data[i].time;
                    del = data[i].delay;
                    if (del == 0) del = "";
                    else del = `+${del}`;
                    trn = data[i].train;
                    bfor = data[i].for;
                    com = data[i].comment;
                    let dt = [date, sta, line[0], trk, cho, time, trn, bfor, com];
                    let rDatas = document.createElement("span");
                    let br = document.createElement("br");
                    for (var j = 0; j < d.length; j++) {
                        rDatas.innerText += `${d[j]}:`;
                        var rData = document.createElement('span');
                        rData.innerText = dt[j];
                        if (j == 2)
                            for (var k = 0; k < sc.length; k++) if (line[1] == sc[k][0]) rData.classList.add(sc[k][1]);
                        if (j == 5 && del != 0) {
                            delE = document.createElement("span");
                            delE.innerText = del;
                            delE.classList.add("delay");
                            rData.appendChild(delE);
                        }
                        rDatas.appendChild(rData);
                        rDatas.appendChild(br);
                    }
                    document.getElementById("recSpace").appendChild(rDatas);
                    document.getElementById("recStatus").innerText = "";
                } else if (data.status == 'no record') document.getElementById('recStatus').innerText = "指定した鳴動記録のデータがありません。";
            })
        })
    } else document.getElementById("recStatus").innerText = "表示する鳴動記録が指定されていません。";
})