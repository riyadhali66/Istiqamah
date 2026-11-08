import { earlierProgress } from "./tasbih.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";
import { session } from "../session.js?v=2.1.0";
import { adhkarService } from "../adhkar.js?v=2.1.0";
import { getDay } from "../records.js?v=2.1.0";
import { esc, icon } from "../utils.js?v=2.1.0";

function view_reflections() {
  const earlier = earlierProgress(session.selectedDate);
  return (
    this.heading(t("Reflections"), "Your quiet reflection") +
    `<div class="tabs"><button class="tab ${session.adhkarTab === "morning" ? "active" : ""}" data-action="adhkar-tab" data-id="morning">${t("Morning adhkar")}</button><button class="tab ${session.adhkarTab === "evening" ? "active" : ""}" data-action="adhkar-tab" data-id="evening">${t("Evening adhkar")}</button></div><div class="notice">${t("Arabic source text")} \xB7 Seen Arabic · MIT. ${t("Arabic source text")}</div><section class="card">${!adhkarService.list(session.adhkarTab).length ? `<p>${t("Download optional adhkar in Settings. Your saved counts are kept.")}</p><button class="btn secondary" data-action="nav" data-id="settings">${t("Settings")}</button>` : ""}${adhkarService
      .list(session.adhkarTab)
      .map((a, i) => {
        let val = adhkarService.count(session.adhkarTab, i);
        return `<article class="adhkar-item"><p lang="ar" dir="rtl" class="quote">${esc(a.text)}</p><span class="source" lang="ar">${esc(a.reference)}</span>${session.lang === "en" && a.en ? `<p>${esc(a.en)}</p>` : `<small>${t("Arabic source text")}</small>`}<details><summary>${t("Learn more")}</summary><p lang="ar" dir="rtl" style="font-family:Amiri;font-size:20px">${esc(a.description)}</p></details><div class="row between"><button class="btn ${val >= a.count ? "secondary" : ""}" data-action="dhikr" data-index="${i}" ${val >= a.count ? "disabled" : ""}>${val >= a.count ? icon("check") : icon("plus")} ${val} / ${a.count}</button><button class="linkbtn" data-action="dhikr-reset" data-index="${i}">${t("Reset counter")}</button></div></article>`;
      })
      .join("")}</section>${earlier}`
  );
}
export { view_reflections };
