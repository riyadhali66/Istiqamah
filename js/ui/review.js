import { session } from "../session.js";
import { monthKeys, monthlyHabits } from "../records.js";
import { today } from "../dates.js";
import { t } from "../i18n.js";
import { esc, icon } from "../utils.js";
import { CATEGORIES } from "../config.js";

function view_review() {
  let r = session.state.reviews[session.month] || {},
    keys = monthKeys().filter((k) => k <= today() && session.state.days[k]),
    hs = monthlyHabits();
  let worst = keys.length
    ? hs
        .map((h) => ({
          h,
          value:
            keys.reduce(
              (s, k) =>
                s +
                Math.min(
                  1,
                  (session.state.days[k]?.values?.[h.id] || 0) / h.target,
                ),
              0,
            ) / keys.length,
        }))
        .sort((a, b) => a.value - b.value)[0]
    : null;
  return `<section class="card section-gap"><div class="cardhead"><h2>${t("Monthly review")}</h2>${icon("leaf")}</div><div class="notice">${t("Weakest habit")}: ${worst ? esc(t(worst.h.label)) : t("No check-ins yet. Your first step can be today.")}<br>${t("Keep it small. Choose one habit to make easier.")}</div><label>${t("Wins this month")}</label><textarea data-review="wins">${esc(r.wins || "")}</textarea><h3 class="section-gap">${t("Next month\u2019s goals")}</h3><div class="formgrid">${CATEGORIES.map((c) => `<div><label>${t(c)}</label><input data-review="${esc(c)}" value="${esc(r[c] || "")}"></div>`).join("")}</div></section>`;
}
export { view_review };
