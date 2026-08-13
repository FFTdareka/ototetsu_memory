import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";
import {
    getAuth,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    deleteUser,
    reauthenticateWithPopup,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    initializeFirestore,
    memoryLocalCache,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import {
    setR,
    ready
} from "./staData.js";
import {
    checkMember
} from "./mhome.js";

await ready;

let uid, isMember;

let resolveStatusReady;
const statusReady = new Promise((resolve) => {
    resolveStatusReady = resolve;
});

const app = initializeApp(setR.firebase);
getAnalytics(app);
const auth = getAuth(app);
const db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true
});

let algoliaClient = null;

function getAlgoliaClient() {
    if (algoliaClient) return algoliaClient;
    if (!window["algoliasearch/lite"]) {
        throw new Error(
            "Algoliaのクライアントが読み込まれていません。" +
            "このページでrecord検索機能を使う場合は、" +
            "algoliasearch@5.56.0のUMD版scriptタグを追加してください。",
        );
    }
    const { liteClient } = window["algoliasearch/lite"];
    algoliaClient = liteClient(setR.algolia.appId, setR.algolia.searchKey);
    return algoliaClient;
}

async function searchWithTimeout(params, timeoutMs = 6000, retries = 2) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const result = await getAlgoliaClient().search(params, {
                signal: controller.signal,
            });
            clearTimeout(timer);
            return result;
        } catch (e) {
            clearTimeout(timer);
        }
    }
    throw lastError;
}

const SORT_INDEX_MAP = {
    "dates_a": "records_date_asc",
    "dates_d": "records_date_desc",
    "records_a": "records_chorusMax_asc",
    "records_d": "records_chorusMax_desc",
    "ids_a": "records_ID_asc",
    "ids_d": "records_ID_desc",
};

const BASE_URL = "https://us-central1-ototetsu-memory.cloudfunctions.net";

async function callFunction(name, data) {
    const user = auth.currentUser;
    if (!user) {
        return {
            message: "エラー:ログインが必要です。"
        };
    }
    const token = await user.getIdToken();
    const res = await fetch(`${BASE_URL}/${name}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
}

const setRecord = (data) => callFunction("setRecord", data);
const editRecord = (data) => callFunction("editRecord", data);
const deleteRecord = (data) => callFunction("deleteRecord", data);

const createNews = (data) => callFunction("createNews", data);
const editNews = (data) => callFunction("editNews", data);
const deleteNews = (data) => callFunction("deleteNews", data);

status();

function status() {
    let userStatus = document.getElementById("userStatus");
    let userName = document.getElementById("userName");
    let loginBtn = document.getElementById("login");

    onAuthStateChanged(auth, async (user) => {        
        if (location.href == "https://fftdareka.github.io/ototetsu_memory/member/" || location.href == "https://fftdareka.github.io/ototetsu_memory/member/index.html") checkMember();
        if (user) {
            uid = user.uid;
            let uData = await loadUserdata(uid, true);
            let uName = uData.name;
            isMember = uData.member;
            userStatus.innerText = " としてログイン中";
            loginBtn.innerText = "ログアウト";
            loginBtn.classList.add("redB");
            loginBtn.removeEventListener("click", userLogin);
            loginBtn.addEventListener("click", userLogout);
            userName.innerText = `${uName}${isMember ? "(メンバー)" : ""}`;

            if (location.href === "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let memberS = document.getElementById("memberS");
                let setNameS = document.getElementById("setName");
                let userInfoS = document.getElementById("userInfo");
                let updateBtnS = document.getElementById("updateBtn");
                let delS = document.getElementById("delS");
                let deleteBtnS = document.getElementById("deleteBtn");
                let userNameS = document.getElementById("userNameS");
                let loginS = document.getElementById("login2");

                document.getElementById("setStatus").innerText = "";

                memberS.style.display - "none";
                setNameS.style.display = "none";
                updateBtnS.removeEventListener("click", updateUser);
                delS.style.display = "none";
                deleteBtnS.removeEventListener("click", userDelete);
                userNameS.innerText = "";
                userInfoS.style.display = "none";
                loginS.removeEventListener("click", userLogin);
                
                setNameS.style.display = "block";
                updateBtnS.addEventListener("click", updateUser);
                delS.style.display = "block";
                deleteBtnS.addEventListener("click", userDelete);
                userNameS.innerText = uName;
                if (isMember) memberS.style.display = "block";
            }
        } else {
            userStatus.innerText = "未ログイン";
            userName.innerText = "";
            loginBtn.innerText = "Googleでログイン";
            loginBtn.classList.remove("redB");
            loginBtn.removeEventListener("click", userLogout);
            loginBtn.addEventListener("click", userLogin);

            if (location.href === "https://fftdareka.github.io/ototetsu_memory/user.html") {
                let memberS = document.getElementById("memberS");
                let setNameS = document.getElementById("setName");
                let userInfoS = document.getElementById("userInfo");
                let updateBtnS = document.getElementById("updateBtn");
                let delS = document.getElementById("delS");
                let deleteBtnS = document.getElementById("deleteBtn");
                let userNameS = document.getElementById("userNameS");
                let loginS = document.getElementById("login2");

                document.getElementById("setStatus").innerText = "";

                memberS.style.display - "none";
                setNameS.style.display = "none";
                updateBtnS.removeEventListener("click", updateUser);
                delS.style.display = "none";
                deleteBtnS.removeEventListener("click", userDelete);
                userNameS.innerText = "";
                userInfoS.style.display = "none";
                loginS.removeEventListener("click", userLogin);

                userInfoS.style.display = "block";
                loginS.addEventListener("click", userLogin);
            }
        }
        resolveStatusReady();
    });
}

function userLogin() {
    let provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
        .then((res) => console.log("ログイン成功:", res.user))
        .catch((er) => console.error("ログイン失敗:", er.code, er.message));
}

function userLogout() {
    signOut(auth)
        .then(() => showNotice("ログアウトが完了しました。", "user", true))
        .catch(() => showNotice("ログアウト中にエラーが発生しました。", "user", true));
}

function userDelete() {
    let user = auth.currentUser;
    if (!user) return;
    if (!confirm("本当に退会しますか?この操作は取り消せません。")) return;

    deleteDoc(doc(db, "user", user.uid))
        .then(() => deleteUser(user))
        .then(() => showNotice("退会が完了しました。これまでのご利用ありがとうございました。", "setStatus", true))
        .catch((error) => {
            if (error.code === "auth/requires-recent-login") {
                let provider = new GoogleAuthProvider();
                reauthenticateWithPopup(user, provider)
                    .then(() => deleteDoc(doc(db, "user", user.uid)))
                    .then(() => deleteUser(user))
                    .then(() => showNotice("退会が完了しました。これまでのご利用ありがとうございました。", "setStatus", true))
                    .catch((err) => {
                        console.error("退会失敗:", err);
                        showNotice("退会に失敗しました。", "setStatus", true);
                    });
            } else {
                console.error("退会失敗:", error);
                showNotice("退会に失敗しました。", "setStatus", true);
            }
        });
}

function loadUserdata(uid = "guest", tf = false) {
    return getDoc(doc(db, "user", uid))
        .then((snap) => {
            if (snap.exists()) {
                return {
                    name: snap.data().name || "匿名",
                    member: snap.data().member || false
                };
            } else if (tf) {
                return setDoc(doc(db, "user", uid), {
                        name: "匿名"
                    }, {
                        merge: true
                    })
                    .then(() => ({ name: "匿名", member: false }))
                    .catch((error) => {
                        console.error("作成失敗:", error);
                        throw error;
                    });
            } else {
                return ({ name: "削除されたユーザー", member: false });
            }
        })
        .catch((er) => {
            console.error("読込失敗:", er);
            throw er;
        });
}

function updateUser() {
    let newNameE = document.getElementById("newName");
    if (newNameE) {
        setDoc(doc(db, "user", uid), {
                name: newNameE.value
            }, {
                merge: true
            })
            .then(() => {
                showNotice("更新が完了しました。", "setting", false);
                document.getElementById("userNameS").innerText = newNameE.value;
                document.getElementById("userName").innerText = newNameE.value;
            })
            .catch((error) => {
                showNotice("更新に失敗しました。", "setting", false);
                console.error("更新失敗:", error);
            });
    }
}

async function getUid() {
    await statusReady;
    return uid;
}

async function getUserStatus() {
    await statusReady;
    return isMember;
}

function buildAlgoliaFilters(filter = {}) {
    const facetParts = [];
    const numericParts = [];

    if (filter.sta) facetParts.push(`station:"${filter.sta}"`);
    if (filter.strack) facetParts.push(`track:"${filter.strack}"`);
    if (filter.line) {
        facetParts.push(`line:"${filter.line}"`);
    }
    if (filter.lnum !== undefined && filter.lnum !== null && filter.lnum !== "n") {
        facetParts.push(`lnum:${filter.lnum}`);
    }

    if (filter.minrec !== undefined) numericParts.push(`chorusMax>=${Number(filter.minrec)}`);
    if (filter.maxrec !== undefined) numericParts.push(`chorusMax<=${Number(filter.maxrec)}`);

    if (filter.re) {
        if (filter.re.type === "t") numericParts.push(`chorusCount>1`);
        if (filter.re.type === "f") numericParts.push(`chorusCount=1`);
        if (filter.re.type === "s") {
            if (filter.re.min !== -1 && filter.re.min !== undefined) {
                numericParts.push(`chorusCount>=${Number(filter.re.min) + 1}`);
            }
            if (filter.re.max !== -1 && filter.re.max !== undefined) {
                numericParts.push(`chorusCount<=${Number(filter.re.max) + 1}`);
            }
        }
    }

    if (filter.sdate) {
        const s = new Date(`${filter.sdate} ${filter.stime}`);
        numericParts.push(`datetime>=${Math.floor(s.getTime() / 1000)}`);
    }
    if (filter.edate) {
        const e = new Date(`${filter.edate} ${filter.etime}`);
        numericParts.push(`datetime<=${Math.floor(e.getTime() / 1000)}`);
    }

    return {
        filters: facetParts.join(" AND "),
        numericFilters: numericParts,
    };
}

async function getRecords(n, p, opt = {
    filter: {},
    sort: {
        data: {
            dates: "d"
        },
        rank: ["dates"]
    }
}) {
    if (!opt.hasOwnProperty("filter")) opt.filter = {};
    if (!opt.hasOwnProperty("sort")) opt.sort = {
        data: {
            dates: "d"
        },
        rank: ["dates"]
    };

    const rankKey = opt.sort.rank[0] || "dates";
    const dir = opt.sort.data[rankKey] || "d";
    const indexName = SORT_INDEX_MAP[`${rankKey}_${dir}`] || "records_date_desc";

    const { filters, numericFilters } = buildAlgoliaFilters(opt.filter);

    const { results } = await searchWithTimeout({
        requests: [{
            indexName,
            filters: filters || undefined,
            numericFilters: numericFilters.length ? numericFilters : undefined,
            page: p - 1,
            hitsPerPage: n,
            userToken: `t${Date.now()}`,
        }],
    });

    const result = results[0];
    if (!result || result.hits.length === 0) return null;

    return {
        data: result.hits,
        nor: result.nbHits
    };
}

async function getRec1(id) {
    const { results } = await searchWithTimeout({
        requests: [{
            indexName: "records_ID_desc",
            numericFilters: [`ID=${Number(id)}`],
            hitsPerPage: 1,
            userToken: `t${Date.now()}`,
        }],
    });

    const result = results[0];
    if (!result || result.hits.length === 0) return null;
    return result.hits[0];
}

async function getNewsData(n = -1) {
    const newsRef = collection(db, "news");
    const constraints = [orderBy("rank", "asc")];
    if (n !== -1) constraints.push(limit(n));

    const q = query(newsRef, ...constraints);
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => d.data());

    return Promise.all(
        data.map(async (news) => {
            const uData = await loadUserdata(news.author);
            return {
                ...news,
                author: uData.name,
            };
        })
    );
}

export {
    userDelete,
    loadUserdata,
    getRecords,
    getRec1,
    setRecord,
    editRecord,
    deleteRecord,
    getUid,
    getUserStatus,
    getNewsData,
    createNews,
    editNews,
    deleteNews,
};