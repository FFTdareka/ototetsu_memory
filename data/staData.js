let setR;
let d;
let sc;

const ready = (async () => {
    const res = await fetch('https://fftdareka.github.io/ototetsu_memory/data/staData.json');
    setR = await res.json();
    d = setR.d;
    sc = setR.line;
})();

export { setR, d, sc, ready };