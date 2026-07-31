const params = new URLSearchParams(window.location.search);
const id = params.get("id");

document.addEventListener("DOMContentLoaded", getRec1);

fetch('data/staData.json')
    .then(res => res.json())
    .then(data => {
        setR = data;
        d = setR.d;
        sc = setR.line;
        let sLine = document.getElementById("selectline") || document.getElementById("addRec_line");
        if (sLine) {
            let ls = setR.sta;
            for (var i = 0; i < ls.length; i++) {
                var lg = document.createElement("optgroup");
                lg.label = ls[i][0];
                for (var j = 0; j < ls[i][1].length; j++) {
                    var le = document.createElement("option");
                    le.value = `${i}_${j}`;
                    le.innerText = ls[i][1][j][0];
                    lg.appendChild(le);
                }
                sLine.appendChild(lg);
            }
        }
    });

function getRec1() {
    document.getElementById("editRecBtn").innerText = "読込中...";
    document.getElementById("editRecBtn").disabled = true;
    document.getElementById("editRecBtn").removeEventListener("click", editRec);
    document.getElementById("addRec").style.display = "none";
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
            .then(async data => {
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
                    ruid = data.uid;
                    log = data.log.split("\\n");
                    uid = data.uid;
                    var s = document.createElement("div");
                    for (var i = 0; i < log.length; i++) {
                        if (i > 0) {
                            var br = document.createElement("br");
                            s.appendChild(br);
                        }
                        var sp = document.createElement("span");
                        sp.classList.add("data");
                        sp.innerText = log[i];
                        s.appendChild(sp);
                    }
                    let dt = [date, sta, line[0], trk, cho, time, trn, bfor, com, ruid];
                    let rDatas = document.createElement("span");
                    rDatas.id = rid;
                    for (var j = 0; j < d.length; j++) {
                        var rd = document.createElement("span");
                        rd.innerText = `${d[j]}:`;
                        var rData = document.createElement('span');
                        rData.classList.add("data");
                        if (j == 2)
                            for (var k = 0; k < sc.length; k++) if (line[1] == sc[k][0]) rData.classList.add(sc[k][1]);
                            rData.innerText = dt[j];
                        if (j == 5 && del != 0) {
                            delE = document.createElement("span");
                            delE.innerText = del;
                            delE.classList.add("delay");
                            delE.classList.add("data");
                            rData.innerText = dt[j];
                            rData.appendChild(delE);
                        }
                        if (j == 9) {
                            rData.innerText = await loadUserdata(dt[j] || "guest");
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
                    rData2.appendChild(s);
                    rd2.appendChild(rData2);
                    rDatas.appendChild(rd2);
                    document.getElementById("recSpace").appendChild(rDatas);
                    document.getElementById("recStatus").innerText = "";
                    if (uid == getUid()) {
                        document.getElementById("editRecBtn").innerText = "編集";
                        document.getElementById("editRecBtn").disabled = false;
                        document.getElementById("editRecBtn").addEventListener("click", editRec);
                        document.getElementById("addRec").style.display = "block";
                    } else document.getElementById("editRecBtn").innerText = "編集権限なし";
                } else if (data.status == 'no record') document.getElementById('recStatus').innerText = "指定した鳴動記録のデータがありません。";
            })
        })
    } else document.getElementById("recStatus").innerText = "表示する鳴動記録が指定されていません。";
}

function editRec() {
    let er = document.getElementById("error");
    if (er) er.remove();
    let i;
    let j;
    let k;
    let k2;
    let date;
    let time;
    let date2 = document.getElementById("addRec_date").value;
    let delay = document.getElementById("addRec_del").value;
    let line;
    let line2 = document.getElementById("addRec_line").value;
    let line4;
    let station;
    let station2 = document.getElementById("addRec_sta").value;
    let track = document.getElementById("addRec_trk").value;
    let chorus = document.getElementById("addRec_cho").value;
    let train = document.getElementById("addRec_trn").value;
    let tfor = document.getElementById("addRec_for").value;
    let comment = document.getElementById("addRec_com").value;
    let error = "エラー:";
    if (!check.checked) {
        error += "確認欄がチェックされていません。";
    }
    if (date2.length == 0) {
        error += "日付が選択されていません。";
    } else {
        let date3 = new Date(date2);
        date =
            `${date3.getFullYear()}/${date3.getMonth() + 1}/${date3.getDate()}`;
        time =
            `${date3.getHours()}:${date3.getMinutes().toString().padStart(2, "0")}`;
    }
    if (delay.length == 0) {
        delay = "0";
    }
    if (line2 == "-1_-1") {
        error += "路線が選択されていません。";
    } else {
        let lineData = line2.split("_");
        i = Number(lineData[0]);
        j = Number(lineData[1]);
        line = setR.sta[i][1][j][3] || setR.sta[i][1][j][0];
        line4 = setR.sta[i][1][j][2];
        if (line == "その他") {
            let line3 = document.getElementById("line").value;
            if (line3.length == 0) {
                error += "路線が入力されていません。";
            } else {
                line = line3;
                line4 = "その他";
            }
        }
    }
    if (station2 == "-1_-1") {
        error += "駅名が選択されていません。";
    } else {
        let staD = station2.split("_");
        k = Number(staD[0]);
        k2 = Number(staD[1]);
        station = setR.sta[i][1][j][1][k][1][k2];
        if (station == "その他") {
            let station3 = document.getElementById("station").value;
            if (station3.length == 0) {
                error += "駅名が入力されていません。";
            } else {
                station = station3;
            }
        }
    }
    if (track.length == 0) {
        error += "番線が入力されていません。";
    }
    if (chorus.length == 0) {
        error += "記録が入力されていません。"
    } else {
        while (chorus.includes("c")) chorus = chorus.replace("c", "");
        while (chorus.includes("C")) chorus = chorus.replace("C", "");
        while (chorus.includes("C")) chorus = chorus.replace("ｃ", "");
        while (chorus.includes("C")) chorus = chorus.replace("Ｃ", "");
        ch = chorus.split("+");
        for (i = 0; i < ch.length; i++) ch[i] += "c";
        chorus = ch.join("+");
    }
    if (train.length == 0) {
        error += "種別が入力されていません。";
    }
    if (tfor.length == 0) {
        error += "行先が入力されていません。";
    }
    if (error != "エラー:") {
        let err = document.createElement("div");
        err.id = "error";
        err.innerText = error;
        document.getElementById("addRec").appendChild(err);
    } else {
        document.getElementById("editRecBtn").disabled = true;
        let data = {
            'date': date,
            'station': station,
            'line': `${line}_${line4}`,
            'track': track,
            'chorus': chorus,
            'time': time,
            'delay': delay,
            'train': train,
            'for': tfor,
            'comment': comment,
            'uid': getUid(),
            'edit': true
        };
        editRecord(data);
    }
}

function setSta(data) {
    let l = document.getElementById("line");
    let s = document.getElementById("station");
    let line = data.value.split("_");
    let i = Number(line[0]);
    let j = Number(line[1]);
    let sSta = document.getElementById("addRec_sta");
    sSta.innerHTML = '<option value="-1_-1">-駅を選択-</option>';
    if (i != -1 && j != -1) {
        let staData = setR.sta[i][1][j][1];
        for (var k = 0; k < staData.length; k++) {
            var lg = document.createElement("optgroup");
            lg.label = staData[k][0];
            for (var k2 = 0; k2 < staData[k][1].length; k2++) {
                var le = document.createElement("option");
                le.value = `${k}_${k2}`;
                le.innerText = staData[k][1][k2];
                lg.appendChild(le);
            }
            sSta.appendChild(lg);

        }
        if (setR.sta[i][1][j][0] == "その他") {
            let input = document.createElement("input");
            input.id = "line";
            input.type = "text";
            input.placeholder = "例:横浜線";
            document.getElementById("addRec").children[4].appendChild(input);
        } else {
            if (l) l.remove();
            if (s) s.remove();
        }
    } else {
        if (l) l.remove();
        if (s) s.remove();
    }
}

function setSta2(data) {
    let s = document.getElementById("station");
    let sta = data.value.split("_");
    let k = Number(sta[0]);
    let k2 = Number(sta[1]);
    if (k != -1 && k2 != -1) {
        let line = document.getElementById("addRec").children[4].children[0].value
            .split("_");
        let i = Number(line[0]);
        let j = Number(line[1]);
        if (setR.sta[i][1][j][1][k][1][k2] == "その他") {
            let input = document.createElement("input");
            input.id = "station";
            input.type = "text";
            input.placeholder = "例:淵野辺";
            document.getElementById("addRec").children[6].appendChild(input);
        } else {
            if (s) s.remove();
        }
    } else {
        if (s) s.remove();
    }
}

function editRecord(data) {
    fetch('data/staData.json')
        .then(res => res.json())
        .then(g => {
            fetch(g.gas, {
                    'method': 'POST',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'body': JSON.stringify(data)
                })
                .then(res => res.text())
                .then(data => {
                    showNotice(data, "addRec", true);
                    document.getElementById('addRec_cho').value = "";
                    document.getElementById('addRec_trk').value = "";
                    document.getElementById('addRec_com').value = "";
                    check.checked = false;
                    addButton.disabled = true;
                    document.getElementById('addRec_date').value = "";
                    document.getElementById('addRec_del').value = "";
                    document.getElementById('addRec_line').value = "-1_-1";
                    document.getElementById('addRec_sta').value = "-1_-1";
                    document.getElementById('addRec_trn').value = "";
                    document.getElementById('addRec_for').value = "";
                    setSta({
                        value: "-1_-1"
                    });
                });
                getRec1();
        });
}
