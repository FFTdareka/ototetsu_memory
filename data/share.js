import {
    getUid,
    getRec1,
    loadUserdata,
    editRecord,
    deleteRecord,
    getUserStatus
} from "./firebase.js";
import {
    setR,
    d,
    sc,
    ready
} from "./staData.js";

await ready;

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const check = document.getElementById("addRec_chk");
const editButton = document.getElementById('editRecBtn');
check.addEventListener("change", () => {
    editButton.disabled = !check.checked;
});

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

getRec();

async function getRec() {
    document.getElementById("editRecBtn").innerText = "読込中...";
    document.getElementById("editRecBtn").disabled = true;
    document.getElementById("editRecBtn").removeEventListener("click", editRec);
    document.getElementById("delRecBtn").innerText = "読込中...";
    document.getElementById("delRecBtn").disabled = true;
    document.getElementById("delRecBtn").removeEventListener("click", delRec);
    document.getElementById("addRec").style.display = "none";

    if (id == null) {
        document.getElementById("recStatus").innerText = "表示する鳴動記録が指定されていません。";
        return;
    }

    document.getElementById('recStatus').innerText = "読み込み中...";

    const data = await getRec1(id);

    if (!data) {
        document.getElementById("recStatus").innerText = "指定した鳴動記録のデータがありません。";
        return;
    }
    await renderRec(data);
}

async function renderRec(data) {
    const date = data.date;
    const sta = data.station;
    const line = data.line.split("_");
    const trk = data.track;
    const cho = data.chorus;
    const time = data.time;
    let del = data.delay;
    del = (del == 0) ? "" : `+${del}`;
    const trn = data.train;
    const bfor = data.for;
    const com = data.comment;
    const rid = data.ID;
    const ruid = data.uid;
    const log = data.log.split("\\n");
    const uid = data.uid;

    let s = document.createElement("div");
    for (var i = 0; i < log.length; i++) {
        if (i > 0) s.appendChild(document.createElement("br"));
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
            for (var k = 0; k < sc.length; k++)
                if (line[1] == sc[k][0]) rData.classList.add(sc[k][1]);
        rData.innerText = dt[j];
        if (j == 5 && del != 0) {
            let delE = document.createElement("span");
            delE.innerText = del;
            delE.classList.add("delay");
            delE.classList.add("data");
            rData.innerText = dt[j];
            rData.appendChild(delE);
        }
        if (j == 9) {
            let uData2 = await loadUserdata(dt[j] || "guest");
            rData.innerText = uData2.name;
        };
        rd.appendChild(rData);
        rDatas.appendChild(rd);
        rDatas.appendChild(document.createElement("br"));
    }
    rDatas.appendChild(document.createElement("br"));
    let rd2 = document.createElement('span');
    rd2.innerText = "運営による編集履歴";
    rd2.appendChild(document.createElement("br"));
    let rData2 = document.createElement('span');
    rData2.appendChild(s);
    rd2.appendChild(rData2);
    rDatas.appendChild(rd2);
    document.getElementById("recSpace").appendChild(rDatas);
    document.getElementById("recStatus").innerText = "";
    let isM = getUserStatus();
    if (uid == getUid() || isM) {
        document.getElementById("editRecBtn").innerText = uid == getUid() ? "編集" : "メンバー権限で編集";
        document.getElementById("editRecBtn").addEventListener("click", editRec);
        document.getElementById("delRecBtn").innerText = uid == getUid() ? "削除" : "メンバー権限で削除";
        document.getElementById("delRecBtn").disabled = false;
        document.getElementById("delRecBtn").addEventListener("click", delRec);
        document.getElementById("addRec").style.display = "block";
        let unix = data.datetime;
        let delayN = Number(data.delay);
        document.getElementById("addRec_date").value = formatDateTime(new Date((unix - delayN * 60) * 1000));
        document.getElementById("addRec_del").value = delayN == 0 ? null : delayN;
        setLineAndSta(data.line, sta);
        document.getElementById("addRec_cho").value = cho.replace(/c/g, "");
        document.getElementById("addRec_trk").value = trk;
        document.getElementById("addRec_trn").value = trn;
        document.getElementById("addRec_for").value = bfor;
        document.getElementById("addRec_com").value = com;
    } else {
        document.getElementById("editRecBtn").innerText = "編集権限なし";
        document.getElementById("delRecBtn").innerText = "削除権限なし";
    }
}

async function editRec() {
    let er = document.getElementById("error");
    if (er) er.remove();
    let i, j, k, k2, date, time;
    let date2 = document.getElementById("addRec_date").value;
    let delay = document.getElementById("addRec_del").value;
    let line, line4;
    let line2 = document.getElementById("addRec_line").value;
    let station;
    let station2 = document.getElementById("addRec_sta").value;
    let track = document.getElementById("addRec_trk").value;
    let chorus = document.getElementById("addRec_cho").value;
    let train = document.getElementById("addRec_trn").value;
    let tfor = document.getElementById("addRec_for").value;
    let comment = document.getElementById("addRec_com").value;
    let error = "エラー:";

    if (!check.checked) error += "確認欄がチェックされていません。";

    if (date2.length === 0) {
        error += "日付が選択されていません。";
    } else {
        let date3 = new Date(date2);
        date = `${date3.getFullYear()}/${date3.getMonth() + 1}/${date3.getDate()}`;
        time = `${date3.getHours()}:${date3.getMinutes().toString().padStart(2, "0")}`;
    }
    if (delay.length === 0) delay = "0";

    if (line2 === "-1_-1") {
        error += "路線が選択されていません。";
    } else {
        let lineData = line2.split("_");
        i = Number(lineData[0]);
        j = Number(lineData[1]);
        line = setR.sta[i][1][j][3] || setR.sta[i][1][j][0];
        line4 = setR.sta[i][1][j][2];
        if (line === "その他") {
            let line3 = document.getElementById("line").value;
            if (line3.length === 0) {
                error += "路線が入力されていません。";
            } else {
                line = line3;
                line4 = "その他";
            }
        }
    }

    if (station2 === "-1_-1") {
        error += "駅名が選択されていません。";
    } else {
        let staD = station2.split("_");
        k = Number(staD[0]);
        k2 = Number(staD[1]);
        station = setR.sta[i][1][j][1][k][1][k2];
        if (station === "その他") {
            let station3 = document.getElementById("station").value;
            if (station3.length === 0) {
                error += "駅名が入力されていません。";
            } else {
                station = station3;
            }
        }
    }

    if (track.length === 0) error += "番線が入力されていません。";

    if (chorus.length === 0) {
        error += "記録が入力されていません。";
    } else {
        while (chorus.includes("c")) chorus = chorus.replace("c", "");
        while (chorus.includes("C")) chorus = chorus.replace("C", "");
        while (chorus.includes("ｃ")) chorus = chorus.replace("ｃ", "");
        while (chorus.includes("Ｃ")) chorus = chorus.replace("Ｃ", "");
        let ch = chorus.split("+");
        for (let n = 0; n < ch.length; n++) ch[n] += "c";
        chorus = ch.join("+");
    }

    if (train.length === 0) error += "種別が入力されていません。";
    if (tfor.length === 0) error += "行先が入力されていません。";

    if (error !== "エラー:") {
        let err = document.createElement("div");
        err.id = "error";
        err.innerText = error;
        document.getElementById("addRec").appendChild(err);
        return;
    }

    document.getElementById("editRecBtn").disabled = true;
    document.getElementById("editRecBtn").innerText = "編集中...";
    document.getElementById("delRecBtn").disabled = true;
    const data = {
        date,
        station,
        line: `${line}_${line4}`,
        track,
        chorus,
        time,
        delay,
        train,
        for: tfor,
        comment,
        uid: getUid(),
        id,
    };

    const result = await editRecord(data);
    showNotice(result.message, "statusR", true);

    document.getElementById('addRec_cho').value = "";
    document.getElementById('addRec_trk').value = "";
    document.getElementById('addRec_com').value = "";
    check.checked = false;
    editButton.disabled = true;
    document.getElementById('addRec_date').value = "";
    document.getElementById('addRec_del').value = "";
    document.getElementById('addRec_line').value = "-1_-1";
    document.getElementById('addRec_sta').value = "-1_-1";
    document.getElementById('addRec_trn').value = "";
    document.getElementById('addRec_for').value = "";
    setSta({
        value: "-1_-1"
    });
    document.getElementById("recSpace").innerHTML = "";
    getRec();
}

async function delRec() {
    if (!confirm("本当に記録を削除しますか?この操作は取り消せません。")) return;
    document.getElementById("editRecBtn").disabled = true;
    document.getElementById("delRecBtn").disabled = true;
    document.getElementById("delRecBtn").innerText = "削除中...";

    const result = await deleteRecord({
        id
    });
    const message = result.message;

    if (message === null) {
        location.href = "https://fftdareka.github.io/ototetsu_memory/";
    } else {
        showNotice(message, "addRec", false);
        document.getElementById("editRecBtn").disabled = false;
        document.getElementById("delRecBtn").disabled = false;
        document.getElementById("delRecBtn").innerText = "削除";
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
    if (i !== -1 && j !== -1) {
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
        if (setR.sta[i][1][j][0] === "その他") {
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
    if (k !== -1 && k2 !== -1) {
        let line = document.getElementById("addRec").children[4].children[0].value.split("_");
        let i = Number(line[0]);
        let j = Number(line[1]);
        if (setR.sta[i][1][j][1][k][1][k2] === "その他") {
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

function setLineAndSta(lineValue, staName) {
    const lineName = lineValue.split("_")[0];

    let lineSelect = document.getElementById("addRec").children[4].children[0];
    let i = -1, j = -1;
    let iOther = -1, jOther = -1;
    for (let gi = 0; gi < setR.sta.length; gi++) {
        const lines = setR.sta[gi][1];
        for (let li = 0; li < lines.length; li++) {
            if (lines[li][3] === lineName) {
                i = gi;
                j = li;
            }
            if (lines[li][0] === "その他") {
                iOther = gi;
                jOther = li;
            }
        }
    }

    let lineIsOther = false;
    if ((i === -1 || j === -1) && iOther !== -1 && jOther !== -1) {
        i = iOther;
        j = jOther;
        lineIsOther = true;
    }

    lineSelect.value = `${i}_${j}`;
    setSta(lineSelect);

    if (lineIsOther) {
        let lineInput = document.getElementById("line");
        if (lineInput) lineInput.value = lineName;
    }

    let staSelect = document.getElementById("addRec_sta");
    let k = -1, k2 = -1;
    let kOther = -1, k2Other = -1;
    if (i !== -1 && j !== -1) {
        const staData = setR.sta[i][1][j][1];
        for (let gk = 0; gk < staData.length; gk++) {
            const names = staData[gk][1];
            for (let sk = 0; sk < names.length; sk++) {
                if (names[sk] === staName) {
                    k = gk;
                    k2 = sk;
                }
                if (names[sk] === "その他") {
                    kOther = gk;
                    k2Other = sk;
                }
            }
        }
    }

    let staIsOther = false;
    if ((k === -1 || k2 === -1) && kOther !== -1 && k2Other !== -1) {
        k = kOther;
        k2 = k2Other;
        staIsOther = true;
    }

    staSelect.value = `${k}_${k2}`;
    setSta2(staSelect);

    if (staIsOther) {
        let staInput = document.getElementById("station");
        if (staInput) staInput.value = staName;
    }
}

window.setSta = setSta;
window.setSta2 = setSta2;