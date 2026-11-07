import { t } from "../i18n.js?v=1.2.0";
import { session } from "../session.js?v=1.2.0";
import { getDay } from "../records.js?v=1.2.0";
import { esc } from "../utils.js?v=1.2.0";

function view_kids() {
  return `<div class="notice">${t("Your journey, at your pace.")} \u2727 ${t("Good deeds")}</div><div class="stack">${session.state.children
    .map((child) => {
      let record = getDay().kids[child.id] || {},
        stars = Object.values(session.state.days).reduce(
          (s, d) =>
            s + Object.values(d.kids?.[child.id] || {}).filter(Boolean).length,
          0,
        );
      return `<section class="card"><div class="cardhead"><h2>${esc(child.name)} ${child.age ? "\xB7 " + esc(child.age) : ""}</h2><span class="badge">\u2605 ${stars} ${t("stars")}</span></div><div class="statgrid">${["Prayer", "Morning adhkar", "Evening adhkar", "Quran minutes", "Good deeds"].map((k) => `<div class="word-card" style="padding:12px;margin:0"><h3>${t(k)}</h3><button class="star-button" data-action="kid-star" data-id="${child.id}" data-key="${k}" aria-label="${esc(child.name)}: ${t(k)}" aria-pressed="${!!record[k]}">${record[k] ? "\u2605" : "\u2606"}</button>${k === "Quran minutes" ? `<input type="number" min="0" max="600" data-kid-minutes="${child.id}" value="${getDay().kidMinutes?.[child.id] || 0}" aria-label="${t("Quran minutes")}">` : ""}</div>`).join("")}</div><label>${t("Parent\u2019s reward")}</label><input data-reward="${child.id}" value="${esc(child.reward || "")}" maxlength="200"></section>`;
    })
    .join("")}</div>`;
}
export { view_kids };
