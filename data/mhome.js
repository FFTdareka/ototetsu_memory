import {
    getUserStatus
} from "./firebase.js";

async function checkMember() {
    if (await getUserStatus()) {

    } else {
        try {
            const referrer = document.referrer;
            if (referrer && referrer.includes("https://fftdareka.github.io/ototetsu_memory/") && window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = "https://fftdareka.github.io/ototetsu_memory/";
            }
        } catch (e) {
            console.error("戻る処理でエラー:", e);
            window.location.href = "https://fftdareka.github.io/ototetsu_memory/";
        }
    }
}