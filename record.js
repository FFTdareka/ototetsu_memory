const gasurl = 'https://script.google.com/macros/s/AKfycbypDjfMods0t3A1tcPOUq91AI4GZpCtuiEXeAvKJgvmacFrMCYoNhjwXUZZpbL3iwTH/exec';
let d;
let sc;
let setR;
let nowN = 0;
let nowP = 0;
let nowO = {
    filter: {}
}

fetch('staData.json')
.then(res => res.json())
.then(data => {
    setR = data;
    d = setR.d;
    sc = setR.line;
    getRecord(10, 1, {filter: {}});
    nowN = 10;
    nowP = 1;
    nowO = {filter: {}};
})

function getRecord(n, p, o) {
    document.getElementById('recStatus').innerText = "読み込み中...";
    document.getElementById('recSpace').innerHTML = "";
    document.getElementById('back').disabled = true;
    document.getElementById('next').disabled = true;
    let opt = JSON.stringify(o);
    fetch(`${gasurl}?nor=${n}&page=${p}&opt=${opt}`)
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
                if (del == 0) del = ""; else del = `+${del}`;
                trn = data[i].train;
                bfor = data[i].for;
                com = data[i].comment;
                let dt = [date, sta, line[0], trk, cho, time, trn, bfor, com];
                for (var j = 0; j < d.length; j++) {
                    var td = document.createElement('td');
                    td.innerText = dt[j];
                    if (j == 2) for (var k = 0; k < sc.length; k++) if (line[1] == sc[k][0]) td.classList.add(sc[k][1]);
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
            if (p > 1) document.getElementById('back').disabled = false;
            if (nor > n * p) document.getElementById('next').disabled = false;
            nowN = n;
            nowP = p;
            nowO = o;
        } else if (data.status == 'no record') {
            document.getElementById('recStatus').innerText = "データがありません。";
        }

    })
}

function setFilter() {
    let opt = {
        filter: {}
    };
    let minrec = document.getElementById("minrec").value;
    let maxrec = document.getElementById("maxrec").value;
    let ssta = document.getElementById("selectsta").value;
    let startdate = document.getElementById("startdate").value;
    let enddate = document.getElementById("enddate").value;
    let sdate, stime, edate, etime;
    if (maxrec != "") opt.filter.maxrec = Number(maxrec);
    if (minrec != "") opt.filter.minrec = Number(minrec);
    if (ssta != "") opt.filter.sta = ssta;
    if (startdate != "") {
        startdate = new Date(startdate);
        sdate = `${startdate.getFullYear()}/${startdate.getMonth() + 1}/${startdate.getDate()}`;
        stime = `${startdate.getHours()}:${startdate.getMinutes().toString().padStart(2, "0")}`;
        opt.filter.sdate = sdate;
        opt.filter.stime = stime;
    }
    if (enddate != "") {
        enddate = new Date(enddate);
        edate = `${enddate.getFullYear()}/${enddate.getMonth() + 1}/${enddate.getDate()}`;
        etime = `${enddate.getHours()}:${enddate.getMinutes().toString().padStart(2, "0")}`;
        opt.filter.edate = edate;
        opt.filter.etime = etime;
    }
    getRecord(nowN, 1, opt);
    nowP = 1;
    nowO = opt;
}