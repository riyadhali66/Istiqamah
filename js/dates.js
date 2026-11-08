import { session } from "./session.js?v=2.1.1";
import { timezone } from "./config.js?v=2.1.1";

function keyInTZ(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: session.state.profile.tz || timezone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const v = (k) => parts.find((p) => p.type === k).value;
  return `${v("year")}-${v("month")}-${v("day")}`;
}
function today() {
  try {
    return keyInTZ(/* @__PURE__ */ new Date());
  } catch {
    return /* @__PURE__ */ new Date().toISOString().slice(0, 10);
  }
}
function dateObj(key) {
  let [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}
function offsetDay(key, n) {
  let d = dateObj(key);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export { keyInTZ, today, dateObj, offsetDay };
