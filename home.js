const gasurl = 'https://script.google.com/macros/s/AKfycbwRp66MsHKGyFQKRIpTg0nEulGlmc-wGxrTdvvAt1W03xWeTAZdJyAic01mOuMEd1b_/exec';
let d;
let sc;
let setR;
fetch('staData.json')
.then(res => res.json())
.then(data => {
    setR = data;
    d = setR.d;
    sc = setR.line;
    let sLine = document.getElementById("addRec_line");
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
    getRecord(10, 1);
})

function setSta(data) {
    let l = document.getElementById("line");
    let s = document.getElementById("station");
    let line = data.value.split("_");
    let i = Number(line[0]);
    let j = Number(line[1]);
    let sSta = document.getElementById("addRec_sta");
    sSta.innerHTML = '<option value="-1">-駅を選択-</option>';
    if (i != -1 && j != -1) {
        let staData = setR.sta[i][1][j][1];
        for (var k = 0; k < staData.length; k++) {
            var le = document.createElement("option");
            le.value = k;
            le.innerText = staData[k];
            sSta.appendChild(le);
        }
        if (setR.sta[i][1][j][0] == "その他") {
            let input = document.createElement("input");
            input.id = "line";
            input.type = "text";
            input.placeholder = "例:横浜線";
            document.getElementById("addRec").children[5].appendChild(input);
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
    let k = Number(data.value);
    if (k != -1) {
        let line = document.getElementById("addRec").children[5].children[0].value.split("_");
        let i = Number(line[0]);
        let j = Number(line[1]);
        if (setR.sta[i][1][j][1][k] == "その他") {
            let input = document.createElement("input");
            input.id = "station";
            input.type = "text";
            input.placeholder = "例:淵野辺";
            document.getElementById("addRec").children[7].appendChild(input);
        } else {
            document.getElementById("station").remove();
        }
    } else {
        document.getElementById("station").remove();
    }
}

function setRecord(data) {
    /*
        {
            'date': '2025/10/24',
            'station': '淵野辺',
            'line': '横浜線',
            'track': '2',
            'chorus': '1.0c',
            'time': '8:10',
            'delay': '0',
            'train': '各駅停車',
            'for': '八王子',
            'comment': '無被り'
        }
    */
    fetch(gasurl, {
        'method': 'POST',
        'Content-Type': 'application/x-www-form-urlencoded',
        'body': JSON.stringify(data)
    })
    .then(res => res.text())
    .then(data => {
        alert(data);
        document.getElementById('addRec_date').value = "";
        document.getElementById('addRec_del').value = "";
        document.getElementById('addRec_line').value = "-1_-1";
        document.getElementById('addRec_sta').value = "-1";
        document.getElementById('addRec_cho').value = "";
        document.getElementById('addRec_trk').value = "";
        document.getElementById('addRec_trn').value = "";
        document.getElementById('addRec_for').value = "";
        document.getElementById('addRec_com').value = "";
        setSta({value: "-1_-1"});
        getRecord(10, 1);
        document.getElementById('addRec_btn').disabled = false;
    });
}

function getRecord(n, p) {
    document.getElementById('recStatus').innerText = "読み込み中...";
    document.getElementById('recSpace').innerHTML = "";
    fetch(`${gasurl}?nor=${n}&page=${p}`)
    .then(res => res.json())
    .then(data => {
        if (data.status == 'success') {
            nor = data.nor;
            data = data.body;
            console.log(data);
            let table = document.createElement('table');
            table.id = 'record';
            let thead = document.createElement('thead');
            let trh = document.createElement('tr');
            for (var i = 0; i < d.length; i++) {
                th = document.createElement('th');
                th.innerText = d[i];
                trh.appendChild(th);
            }
            thead.appendChild(trh);
            table.appendChild(thead);
            let tbody = document.createElement('tbody');
            for (var i = 0; i < data.length; i++) {
                var trb = document.createElement('tr');
                date = data[i].date;
                sta = data[i].station;
                line = data[i].line;
                trk = data[i].track;
                cho = data[i].chorus;
                time = data[i].time;
                del = data[i].delay;
                if (del == 0) del = ""; else del = `+${del}`;
                trn = data[i].train;
                bfor = data[i].for;
                com = data[i].comment;
                let dt = [date, sta, line, trk, cho, time, trn, bfor, com];
                console.log(dt);
                for (var j = 0; j < d.length; j++) {
                    var td = document.createElement('td');
                    td.innerText = dt[j];
                    if (j == 2) for (var k = 0; k < sc.length; k++) if (dt[j] == sc[k][0]) td.classList.add(sc[k][1]);
                    if (j == 5 && del != 0) {
                        delE = document.createElement("span");
                        delE.innerText = del;
                        delE.classList.add("delay");
                        td.appendChild(delE);
                    }
                    trb.appendChild(td);
                }
                tbody.appendChild(trb);
            }
            table.appendChild(tbody);
            document.getElementById('recSpace').appendChild(table);
            document.getElementById('recStatus').innerText = `全${nor}件中${n * (p - 1) + 1}～${n * (p - 1) + data.length}件`;
        } else if (data.status == 'no record') {
            console.log('データがありません');
            document.getElementById('recStatus').innerText = "データがありません。";
        }

    })
}

function recordData() {
    let er = document.getElementById("error");
    if (er) er.remove();
    let i;
    let j;
    let k;
    let date;
    let time;
    let date2 = document.getElementById("addRec_date").value;
    let delay = document.getElementById("addRec_del").value;
    let line;
    let line2 = document.getElementById("addRec_line").value;
    let station;
    let station2 = document.getElementById("addRec_sta").value;
    let track = document.getElementById("addRec_trk").value;
    let chorus = document.getElementById("addRec_cho").value;
    let train = document.getElementById("addRec_trn").value;
    let tfor = document.getElementById("addRec_for").value;
    let comment = document.getElementById("addRec_com").value;
    let error = "エラー:";
    if (date2.length == 0) {
        error += "日付が選択されていません。";
    } else {
        let date3 = new Date(date2);
        date = `${date3.getFullYear()}/${date3.getMonth() + 1}/${date3.getDate()}`;
        time = `${date3.getHours()}:${date3.getMinutes().toString().padStart(2, "0")}`;
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
        line = setR.sta[i][1][j][0];
        if (line == "その他") {
            let line3 = document.getElementById("line").value;
            if (line3.length == 0) {
                error += "路線が入力されていません。";
            } else {
                line = line3;
            }
        }
    }
    if (station2 == "-1") {
        error += "駅名が選択されていません。";
    } else {
        k = Number(station2);
        station = setR.sta[i][1][j][1][k];
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
        err.style = "color: red;";
        document.getElementById("addRec").appendChild(err);
    } else {
        document.getElementById("addRec_btn").disabled = true;
        let data = {
            'date': date,
            'station': station,
            'line': line,
            'track': track,
            'chorus': chorus,
            'time': time,
            'delay': delay,
            'train': train,
            'for': tfor,
            'comment': comment
        };
        setRecord(data);
    }

}








