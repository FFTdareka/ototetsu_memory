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
            body: payload,
        }).catch((e) => {});
    } catch (e) {}
}

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

fetch('data/staData.json')
    .then(res => res.json())
    .then(s => {
        if (s.status && location.href == "https://fftdareka.github.io/ototetsu_memory/maint.html" && localStorage.getItem('debug') != 'true') location.href = "https://fftdareka.github.io/ototetsu_memory/";
        else if (!s.status && location.href != "https://fftdareka.github.io/ototetsu_memory/maint.html" && localStorage.getItem('debug') != 'true') location.href = "https://fftdareka.github.io/ototetsu_memory/maint.html";
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

function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const year = jst.getUTCFullYear();
  const month = pad(jst.getUTCMonth() + 1);
  const day = pad(jst.getUTCDate());
  const hours = pad(jst.getUTCHours());
  const minutes = pad(jst.getUTCMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
