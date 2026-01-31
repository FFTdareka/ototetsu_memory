let d;
let sc;
let setR;
let nowN = 0;
let nowP = 0;
let nowO = {
    filter: {},
    sort: {
        data: {},
        rank: []
    }
}

fetch('staData.json')
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
        if (location.href == "https:\/\/fftdareka.github.io\/ototetsu_memory\/" || location.href == "https:\/\/fftdareka.github.io\/ototetsu_memory\/index.html") op = { filter: {}, sort: {data: {ids: "d"}, rank: ["ids"]}}; else op = { filter: {}, sort: {data: {}, rank: []}};
        getRecord(10, 1, op);
        nowN = 10;
        nowP = 1;
        nowO = op;
    })

function wline(data) {
    let l = document.getElementById("selectline2");
    let line = data.value.split("_");
    let i = Number(line[0]);
    let j = Number(line[1]);
    if (i != -1 && j != -1) {
        if (setR.sta[i][1][j][0] == "その他") {
            let input = document.createElement("input");
            input.id = "selectline2";
            input.type = "text";
            input.placeholder = "例:横浜線";
            document.getElementById("sline").appendChild(input);
        } else {
            if (l) l.remove();
        }
    } else {
        if (l) l.remove();
    }
}

function getRecord(n, p, o = {
    filter: {},
    sort: {}
}) {
    if (!o.hasOwnProperty("filter")) o.filter = {};
    if (!o.hasOwnProperty("sort")) o.sort = {};
    document.getElementById('recStatus').innerText = "読み込み中...";
    document.getElementById('recSpace').innerHTML = "";
    if (document.getElementById('back')) document.getElementById('back').disabled =
        true;
    if (document.getElementById('next')) document.getElementById('next').disabled =
        true;
    let opt = JSON.stringify(o);
    fetch('staData.json')
        .then(res => res.json())
        .then(g => {
            fetch(`${g.gas}?type=rec&nor=${n}&page=${p}&opt=${opt}`)
                .then(res => res.json())
                .then(data => {
                    if (data.status == 'success') {
                        nor = data.nor;
                        data = data.body;
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
                            let dt = [date, sta, line[0], trk, cho,
                                time, trn, bfor, com
                            ];
                            for (var j = 0; j < d.length; j++) {
                                var td = document.createElement('td');
                                td.innerText = dt[j];
                                if (j == 2)
                                    for (var k = 0; k < sc.length; k++)
                                        if (line[1] == sc[k][0]) td.classList
                                            .add(sc[k][1]);
                                if (j == 5 && del != 0) {
                                    delE = document.createElement(
                                        "span");
                                    delE.innerText = del;
                                    delE.classList.add("delay");
                                    td.appendChild(delE);
                                }
                                trb.appendChild(td);
                            }
                            tbody.appendChild(trb);
                        }
                        table.appendChild(tbody);
                        document.getElementById('recSpace').appendChild(
                            table);
                        document.getElementById('recStatus').innerText =
                            `全${nor}件中${n * (p - 1) + 1}～${n * (p - 1) + data.length}件`;
                        if (p > 1 && document.getElementById('back'))
                            document.getElementById('back').disabled =
                            false;
                        if (nor > n * p && document.getElementById(
                                'next')) document.getElementById('next')
                            .disabled = false;
                        nowN = n;
                        nowP = p;
                        nowO = o;
                    } else if (data.status == 'no record') {
                        document.getElementById('recStatus').innerText =
                            "データがありません。";
                    }

                });
        });
}

function setFilter() {
    let opt = {
        filter: {},
        sort: {
            data: {},
            rank: []
        }
    };
    let minrec = document.getElementById("minrec").value;
    let maxrec = document.getElementById("maxrec").value;
    let ssta = document.getElementById("selectsta").value;
    let sli = document.getElementById("selectline").value;
    let startdate = document.getElementById("startdate").value;
    let enddate = document.getElementById("enddate").value;
    let re = document.getElementById("reactive").value;
    let sdate, stime, edate, etime;
    opt.filter.re = re;
    if (maxrec != "") opt.filter.maxrec = Number(maxrec);
    if (minrec != "") opt.filter.minrec = Number(minrec);
    if (sli != "-1_-1") {
        let lineData = sli.split("_");
        i = Number(lineData[0]);
        j = Number(lineData[1]);
        line = setR.sta[i][1][j][3] || setR.sta[i][1][j][0];
        if (line == "その他") {
            let line2 = document.getElementById("selectline2").value;
            if (line2) {
                line = line2;
                opt.filter.line = line;
            }
        } else {
            opt.filter.line = line;
        }
    }
    if (ssta != "") opt.filter.sta = ssta;
    if (startdate != "") {
        startdate = new Date(startdate);
        sdate =
            `${startdate.getFullYear()}/${startdate.getMonth() + 1}/${startdate.getDate()}`;
        stime =
            `${startdate.getHours()}:${startdate.getMinutes().toString().padStart(2, "0")}`;
        opt.filter.sdate = sdate;
        opt.filter.stime = stime;
    }
    if (enddate != "") {
        enddate = new Date(enddate);
        edate =
            `${enddate.getFullYear()}/${enddate.getMonth() + 1}/${enddate.getDate()}`;
        etime =
            `${enddate.getHours()}:${enddate.getMinutes().toString().padStart(2, "0")}`;
        opt.filter.edate = edate;
        opt.filter.etime = etime;
    }
    let srank = [document.getElementById("srank1").value, document.getElementById("srank2").value].filter(Boolean);
    let s1v = document.getElementById("s1v").value;
    let s2v = document.getElementById("s2v").value;
    if (srank[0] && s1v != "") opt.sort.data[srank[0]] = s1v;
    if (srank[1] && s2v != "") opt.sort.data[srank[1]] = s2v;
    for (var fi = 0; fi < srank.length; fi++) if (srank[fi] != "") opt.sort.rank[fi] = srank[fi]; else break;
    getRecord(nowN, 1, opt);
    nowP = 1;
    nowO = opt;
}

function clearFilter() {
    document.getElementById("minrec").value = "";
    document.getElementById("maxrec").value = "";
    document.getElementById("selectline").value = "-1_-1";
    document.getElementById("selectsta").value = "";
    document.getElementById("startdate").value = "";
    document.getElementById("enddate").value = "";
    document.getElementById("reactive").value = "b";
}
