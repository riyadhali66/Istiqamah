import {
  categoryScore,
  dayHabits,
  isPaused,
  maxStreak,
  monthKeys,
  monthlyHabits,
  score,
  streak,
} from "../records.js";
import { session } from "../session.js";
import { t } from "../i18n.js";
import { today } from "../dates.js";
import { esc, money } from "../utils.js";
import { CATEGORIES } from "../config.js";

function view_progress() {
  const keys = monthKeys(),
    active = keys.filter(
      (k) =>
        session.state.days[k] &&
        Object.values(session.state.days[k].values || {}).some((v) => v > 0),
    ),
    avg = active.length
      ? Math.round(active.reduce((s, k) => s + score(k), 0) / active.length)
      : 0,
    allHabits = monthlyHabits();
  return (
    this.heading(
      t("Monthly overview"),
      "Your journey, at your pace.",
      `<div><label class="sr-only" for="month-picker">${t("Month")}</label><input id="month-picker" type="month" value="${session.month}" max="${today().slice(0, 7)}"></div>`,
    ) +
    `<div class="statgrid"><section class="card"><span class="eyebrow">${t("Monthly average")}</span><strong>${avg}<span style="font-size:15px">%</span></strong><small>${t("Daily score")}</small></section><section class="card"><span class="eyebrow">${t("Days with check-ins")}</span><strong>${active.length}<span style="font-size:15px"> / ${keys.length}</span></strong><small>${t("One small step, a little closer.")}</small></section><section class="card"><span class="eyebrow">${t("Milestones")}</span><strong>\u{1F525} ${streak()}</strong><small>${[7, 21, 40].map((n) => `${maxStreak() >= n ? "\u2726" : "\u25C7"} ${n}`).join(" \xB7 ")}</small></section></div><section class="card"><div class="cardhead"><h2>${t("Your consistency map")}</h2><small>\u25CB \u2192 \u25CF</small></div><div class="heat-wrap"><table class="heatmap"><thead><tr><th>${t("Daily intentions")}</th>${keys.map((k, i) => `<th scope="col">${i + 1}</th>`).join("")}</tr></thead><tbody>${allHabits
      .map(
        (h) =>
          `<tr><td>${esc(t(h.label))}</td>${keys
            .map((k) => {
              const snapshot = dayHabits(k).find((a) => a.id === h.id),
                paused = isPaused(h, session.state.days[k]),
                ratio = snapshot
                  ? (session.state.days[k]?.values?.[h.id] || 0) /
                    snapshot.target
                  : 0;
              return `<td class="${k > today() ? "future" : paused ? "paused" : ratio >= 1 ? "level3" : ratio >= 0.5 ? "level2" : ratio > 0 ? "level1" : ""}" title="${k} \xB7 ${esc(t(h.label))}: ${paused ? t("Paused \u2014 streak protected") : money(session.state.days[k]?.values?.[h.id] || 0)}" aria-label="${k}: ${paused ? t("Pause") : Math.min(100, Math.round(ratio * 100)) + "%"}">${paused ? "\u2013" : ""}</td>`;
            })
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table></div><div class="row between section-gap"><small>${t("Paused \u2014 streak protected")} \xB7 \u2013</small><button class="linkbtn" data-action="print">${t("Print / Save as PDF")}</button></div></section><div class="weekgrid">${Array.from(
      { length: 5 },
      (_, i) => {
        let wk = active.filter(
          (k) => Math.min(4, Math.floor((+k.slice(-2) - 1) / 7)) === i,
        );
        let val = wk.length
          ? Math.round(wk.reduce((s, k) => s + score(k), 0) / wk.length)
          : null;
        return `<section class="card"><small>${t("Week")} ${i + 1}</small><p><b style="color:var(--ink)">${val === null ? "\u2014" : val + "%"}</b></p><div class="progress-track"><div style="width:${val || 0}%"></div></div><p style="margin-top:8px">${CATEGORIES.filter(
          (c) => allHabits.some((h) => h.category === c),
        )
          .map(
            (c) =>
              `${t(c)} ${wk.length ? Math.round(wk.reduce((s, k) => s + categoryScore(k, c), 0) / wk.length) : 0}%`,
          )
          .join("<br>")}</p></section>`;
      },
    ).join(
      "",
    )}</div><div class="grid"><section class="card"><div class="cardhead"><h2>${t("Daily score")}</h2></div><div class="chartbox"><canvas id="score-chart" role="img" aria-label="${t("Daily score")}"></canvas></div></section><section class="card"><div class="cardhead"><h2>${t("Category balance")}</h2></div><div class="chartbox"><canvas id="radar-chart" role="img" aria-label="${t("Category balance")}"></canvas></div></section><section class="card full"><div class="cardhead"><h2>${t("Mood & sleep")}</h2></div><div class="chartbox"><canvas id="mood-chart" role="img" aria-label="${t("Mood & sleep")}"></canvas></div></section></div>${this.review()}`
  );
}
export { view_progress };
