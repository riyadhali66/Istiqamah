import { t } from "./i18n.js?v=1.2.0";
import { session } from "./session.js?v=1.2.0";

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const icon = (n) =>
  `<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
function uid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "id" + Date.now() + Math.random().toString(36).slice(2);
}
function toast(message) {
  $("#toast").textContent = t(message);
  $("#toast").classList.remove("hide");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.add("hide"), 4200);
}
function money(n) {
  return new Intl.NumberFormat(session.lang, {
    maximumFractionDigits: 2,
  }).format(Number(n) || 0);
}
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5e3);
}

export { $, $$, esc, icon, uid, toast, money, download };
