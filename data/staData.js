const res = await fetch('data/staData.json');
const setR = await res.json();
const d = setR.d;
const sc = setR.line;

export { setR, d, sc };