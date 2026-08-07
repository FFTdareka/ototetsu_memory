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
