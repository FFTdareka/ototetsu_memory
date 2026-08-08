const LOG_ENDPOINT = "https://us-central1-ototetsu-memory.cloudfunctions.net/logClientError";

function sendClientLog(data) {
    try {
        const payload = JSON.stringify({
            ...data,
            ua: navigator.userAgent,
            url: location.href,
            time: new Date().toISOString(),
        });
        fetch(LOG_ENDPOINT, {
            method: "POST",
            keepalive: true,
            body: payload, // ★ Content-Typeを指定しない(text/plain扱いになりpreflightを回避)
        }).catch((e) => {
            // 送信自体に失敗しても何もしない(ログ機能なので握りつぶす)
        });
    } catch (e) {
        // 何もしない
    }
}

// ページの読み込み開始を記録(実行がどこまで進んだかの基準点)
sendClientLog({type: "pageload"});

window.addEventListener("error", (e) => {
    sendClientLog({
        type: "error",
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
    });
});

window.addEventListener("unhandledrejection", (e) => {
    sendClientLog({
        type: "unhandledrejection",
        message: String(e.reason && e.reason.message || e.reason),
    });
});

// ページが表示された/復帰したタイミングも記録
window.addEventListener("pageshow", (event) => {
    sendClientLog({type: "pageshow", persisted: event.persisted});
    if (event.persisted) {
        location.reload();
    }
});

fetch('data/staData.json')
    .then(res => res.json())
    .then(s => {
        if (localStorage.getItem("debug") != "true") if (s.status && location.href == "https://fftdareka.github.io/ototetsu_memory/maint.html") location.href = "https://fftdareka.github.io/ototetsu_memory/"; else if (!s.status && location.href != "https://fftdareka.github.io/ototetsu_memory/maint.html") location.href = "https://fftdareka.github.io/ototetsu_memory/maint.html";
    });

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    location.reload();
  }
});

function showNotice(text, parentId, sd = true, noticeId = "") {
    let notice = document.createElement(sd ? "span": "div");
    notice.id = `notice${noticeId}`;
    notice.classList.add("notice");
    notice.innerText = text;
    document.getElementById(parentId).appendChild(notice);
    setTimeout(() => document.getElementById(`notice${noticeId}`).remove(), 5000);
}
