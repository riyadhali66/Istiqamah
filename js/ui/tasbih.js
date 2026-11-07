import { adhkarService, tasbihSelection } from "../adhkar.js";
import { getDay } from "../records.js";
import { today } from "../dates.js";
import { session } from "../session.js";
import { t } from "../i18n.js";
import { esc, icon } from "../utils.js";

function view_tasbih() {
  const selected = tasbihSelection();
  const count = selected
    ? getDay(today()).adhkar[selected.key] || 0
    : session.state.tasbih.count;
  const goal = selected ? selected.entry.count : session.state.tasbih.goal;
  const done = selected && count >= goal;
  return `<section class="card center"><span class="eyebrow">${t("Tasbih")}</span><h2 style="margin-top:12px">${t("One small step, a little closer.")}</h2>
      <div style="max-width:600px;margin:24px auto 0;text-align:start">${!adhkarService.list("morning").length ? `<p>${t("Download optional adhkar in Settings. Your saved counts are kept.")}</p>` : ""}<label for="tasbih-adhkar">${t("Choose adhkar")}</label>
      <select id="tasbih-adhkar"><option value="">${t("Free counter")}</option>${[
        "morning",
        "evening",
      ]
        .map(
          (period) =>
            `<optgroup label="${t(period === "morning" ? "Morning adhkar" : "Evening adhkar")}">${adhkarService
              .list(period)
              .map(
                (a, i) =>
                  `<option value="${period}-${i}" ${selected?.key === period + "-" + i ? "selected" : ""}>${i + 1}. ${esc(a.text.replace(/\s+/g, " ").slice(0, 85))}${a.text.length > 85 ? "…" : ""} · ${a.count}</option>`,
              )
              .join("")}</optgroup>`,
        )
        .join("")}</select></div>
      ${selected ? `<article style="max-width:700px;margin:22px auto;text-align:start"><span class="badge">${t(selected.period === "morning" ? "Morning adhkar" : "Evening adhkar")}</span><p class="quote" lang="ar" dir="rtl" style="white-space:pre-line;overflow-wrap:anywhere;margin-top:18px">${esc(selected.entry.text)}</p><span class="source" lang="ar" dir="rtl">${esc(selected.entry.reference)}</span><small>${t("Arabic source text")} · Azkar DB</small></article>` : ""}
      <button class="tasbih-button" data-action="tasbih" aria-label="${t("Tasbih")}: ${count} / ${goal}" ${done ? "disabled" : ""}>${count}</button><p class="muted">${t("Target")}: ${goal} · ${selected ? `${Math.min(count, goal)} / ${goal} ${t("completed")}` : `${count ? Math.floor(count / goal) : 0} ${t("completed")}`}</p>
      <div class="row wrap" style="justify-content:center;margin:20px 0">${selected ? `<button class="btn secondary" data-action="tasbih-next">${t("Next dhikr")} ${icon("arrow")}</button>` : `<button class="btn secondary" data-action="tasbih-goal" data-value="33">33</button><button class="btn secondary" data-action="tasbih-goal" data-value="100">100</button>`}<button class="linkbtn" data-action="tasbih-reset">${t("Reset counter")}</button></div>
      ${
        selected
          ? `<p class="subtle">${t("Shared with your daily adhkar checklist.")}</p>`
          : `<label for="tasbih-link">${t("Linked habit")} · ${t("Optional")}</label><select id="tasbih-link" style="max-width:320px"><option value="">${t("Optional")}</option>${session.state.habits
              .filter((h) => h.category === "Faith" && !h.prayer)
              .map(
                (h) =>
                  `<option value="${esc(h.id)}" ${session.state.tasbih.link === h.id ? "selected" : ""}>${esc(t(h.label))}</option>`,
              )
              .join("")}</select>`
      }
      <div class="privacy">${t("Saved on this device")} · ${today()}</div></section>`;
}
export { view_tasbih };
