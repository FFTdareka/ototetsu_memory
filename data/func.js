function showNotice(text, parentId, sd = true, noticeId = "") {
    let notice = document.createElement(sd ? "span": "div");
    notice.id = `notice${noticeId}`;
    notice.classList.add("notice");
    notice.innerText = text;
    document.getElementById(parentId).appendChild(notice);
    setTimeout(() => document.getElementById(`notice${noticeId}`).remove(), 5000);
}
