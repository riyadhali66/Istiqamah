import { dateObj, offsetDay, today } from "../dates.js";
import { hijriService } from "../hijri.js";
import { monthKeys } from "../records.js";
import { session } from "../session.js";
import { t } from "../i18n.js";

function view_fasting() {
  let tomorrow = offsetDay(today(), 1),
    tags = hijriService.fasts(tomorrow),
    keys = monthKeys(),
    shawwalFasted = Object.entries(session.state.days).filter(([k, d]) => {
      let h = hijriService.get(k),
        now = hijriService.get(session.selectedDate);
      return d.fasted && h?.month === 10 && h?.year === now?.year;
    }).length;
  return `<section class="card"><div class="cardhead"><h2>${t("Fasting calendar")}</h2><input type="month" id="month-picker" value="${session.month}" style="width:auto"></div>${tags.length ? `<div class="notice">\u263E ${t("Fasting tomorrow?")} \xB7 ${tags.map(t).join(" \xB7 ")}</div>` : ""}<p class="muted">${t("Mark only days you actually fasted.")}</p><small>Umm al-Qura \xB7 ${session.lang === "ar" ? "\u0642\u062F \u062A\u062E\u062A\u0644\u0641 \u0627\u0644\u0631\u0624\u064A\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0628\u064A\u0648\u0645. \u0644\u0627 \u062A\u064F\u0639\u062F \u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0627\u0644\u0635\u064A\u0627\u0645 \u0625\u0644\u0632\u0627\u0645\u064A\u0629." : session.lang === "ur" ? "\u0645\u0642\u0627\u0645\u06CC \u0686\u0627\u0646\u062F \u06A9\u06D2 \u0627\u0639\u0644\u0627\u0646 \u0645\u06CC\u06BA \u0627\u06CC\u06A9 \u062F\u0646 \u0641\u0631\u0642 \u06C1\u0648 \u0633\u06A9\u062A\u0627 \u06C1\u06D2\u06D4 \u06CC\u06C1 \u0646\u0641\u0644\u06CC \u0631\u0648\u0632\u0648\u06BA \u06A9\u06CC \u062A\u062C\u0627\u0648\u06CC\u0632 \u06C1\u06CC\u06BA\u06D4" : "Local moon-sighting announcements may differ by a day. These are optional fasting suggestions."}</small><div class="calendar-grid">${Array.from({ length: dateObj(keys[0]).getDay() }, () => "<span></span>").join("")}${keys
    .map((k, i) => {
      let tags2 = hijriService.fasts(k),
        d = session.state.days[k],
        h = hijriService.get(k);
      return `<button class="daycell ${tags2.length ? "recommended" : ""} ${d?.fasted ? "fasted" : ""}" data-action="fast" data-id="${k}" aria-pressed="${!!d?.fasted}" ${k > today() || hijriService.prohibited(k) || d?.pauseFaith ? "disabled" : ""}><span>${i + 1} ${d?.fasted ? "\u2713" : ""}</span><small>${h ? h.day + "/" + h.month : ""}</small><small>${tags2.map(t).join(" \xB7 ")}</small></button>`;
    })
    .join(
      "",
    )}</div><span class="badge">${t("Shawwal")}: ${shawwalFasted} / 6</span></section>`;
}
export { view_fasting };
