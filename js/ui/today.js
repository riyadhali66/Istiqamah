import { ramadanHome } from "./ramadan.js?v=2.1.0";
import {
  dayHabits,
  getDay,
  habitStreak,
  isPaused,
  score,
  streak,
} from "../records.js?v=2.1.0";
import { session } from "../session.js?v=2.1.0";
import { prayerService } from "../prayer.js?v=2.1.0";
import { quranService } from "../quran.js?v=2.1.0";
import { hadithService } from "../hadith.js?v=2.1.0";
import { contentService } from "../content.js?v=2.1.0";
import { engine } from "../engine.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";
import { esc, icon } from "../utils.js?v=2.1.0";
import { today } from "../dates.js?v=2.1.0";
import { hijriService } from "../hijri.js?v=2.1.0";
import { CATEGORIES } from "../config.js?v=2.1.0";
import { currentSchedule } from "../schedule.js?v=2.1.0";
import { pomodoro, timerText } from "../reminders.js?v=2.1.0";

function view_today() {
  const d = getDay(),
    s = score(session.selectedDate),
    p = session.state.profile,
    prayers = prayerService.calculate(session.selectedDate),
    next = prayerService.next(),
    hs = dayHabits(session.selectedDate),
    completed = hs.filter(
      (h) => (d.values[h.id] || 0) >= h.target && !isPaused(h, d),
    ).length,
    verse = quranService.daily(),
    hadith = hadithService.get(),
    name = contentService.daily("names");
  const encouragement =
    s === 0
      ? "Nothing to catch up on. Just begin where you are."
      : s < 40
        ? "A lovely start. Keep your next step small."
        : s < 80
          ? "You made room for what matters today."
          : "A day of intention and care.";
  const nextHabit = streak() >= 7 ? engine.next() : null;
  return (
    this.heading(
      `${t("Assalamu alaikum")}${p.name ? ", " + esc(p.name) : ""}.`,
      "Your plan for today.",
      `<div class="date-chip"><input aria-label="${t("Today")}" type="date" id="day-picker" value="${session.selectedDate}" max="${today()}" style="font-size:11px;padding:5px;min-height:30px"><div class="muted" style="margin-top:4px">${hijriService.format(session.selectedDate)}</div></div>`,
    ) +
    ramadanHome() +
    `<section class="hero"><div class="hero-content"><div class="eyebrow">${t("A little progress, every day.")}</div><h2>${t("Begin with intention. Grow with consistency.")}</h2><p>${t("Your next small step is enough.")}</p></div><div class="hero-medallion">${icon("mosque")}<span>ISTIQAMAH</span></div></section><div class="grid daily-grid"><div class="stack"><section class="card prayer-card"><div class="cardhead"><h2>${t("Prayer times")}</h2><span class="countdown" id="prayer-countdown"></span></div>${prayers.length ? `<div class="prayer-strip">${prayers.map((a) => `<div class="prayer-slot ${next?.name === a.name && session.selectedDate === today() ? "next" : ""}">${icon(a.name === "Fajr" ? "sun" : a.name === "Isha" ? "moon" : "mosque")}<div>${t(a.name)}</div><strong>${prayerService.format(a.date)}</strong></div>`).join("")}</div><small>${esc(p.city || p.country)} \xB7 ${esc(p.method)} \xB7 ${esc(p.madhab)} \xB7 ${esc(p.tz)}</small>` : `<p class="muted" style="font-size:12px">${t("Location is used only for local prayer calculations.")}</p><button class="linkbtn" data-action="location">${t("Set your location")} \u2192</button>`}</section><section class="card habits-card"><div class="cardhead"><h2>${t("Daily intentions")}</h2><span class="badge">${completed} / ${hs.filter((h) => !isPaused(h, d)).length} ${t("completed")}</span></div>${p.gender === "Female" ? `<label class="inline-check"><input type="checkbox" id="pause-faith" ${d.pauseFaith ? "checked" : ""}>${t("Pause prayer & fasting today")}</label>` : ""}${CATEGORIES.map(
      (cat) => {
        const habits = hs.filter((h) => h.category === cat);
        if (!habits.length) return "";
        return `<div class="category-title"><i></i>${t(cat)}</div>${habits
          .map((h) => {
            const val = d.values[h.id] || 0,
              done = val >= h.target,
              paused = isPaused(h, d);
            return `<div class="habit ${done ? "done" : ""}"><button class="check ${done ? "done" : ""}" data-action="check" data-id="${esc(h.id)}" aria-label="${esc(t(h.label))}" aria-pressed="${done}" ${paused ? "disabled" : ""}>${icon("check")}</button><div class="habit-name"><span>${esc(t(h.label))}</span>${paused ? `<small>${t("Paused \u2014 streak protected")}</small>` : h.id === "water" && h.target <= 12 ? `<div class="water">${Array.from({ length: h.target }, (_, i) => `<button class="${i < val ? "filled" : ""}" data-action="water" data-id="${esc(h.id)}" data-value="${i + 1}" aria-label="${i + 1} ${t("glasses")}" aria-pressed="${i < val}">${icon("water")}</button>`).join("")}</div>` : h.target > 1 ? `<small>${t("Target")}: ${h.target} ${t(h.unit)}</small>` : ""}</div>${h.target > 1 && (h.id !== "water" || h.target > 12) ? `<input type="number" min="0" max="1000000" step="${h.unit === "hours" ? ".5" : "1"}" value="${val}" data-habit="${esc(h.id)}" aria-label="${esc(t(h.label))}">` : habitStreak(h) > 0 ? `<span class="badge">\u{1F525} ${habitStreak(h)}</span>` : ""}</div>`;
          })
          .join("")}`;
      },
    ).join(
      "",
    )}${!hs.length ? `<div class="empty">${t("Add habit")}</div>` : ""}<div class="row between section-gap"><small>${t("No need to be perfect. Begin again.")}</small><button class="linkbtn" data-action="nav" data-id="settings">${t("Edit plan")}</button></div>${nextHabit ? `<div class="next-habit"><h3>\u2727 ${t("A little progress, every day.")}</h3><p class="muted">${esc(t(nextHabit.label))}</p><button class="linkbtn" data-action="unlock">${t("Add habit")} \u2192</button></div>` : ""}</section><section class="card"><div class="cardhead"><h2>${t("How are you feeling?")}</h2>${icon("heart")}</div><div class="mood-buttons">${["\u{1F614}", "\u{1F615}", "\u{1F610}", "\u{1F642}", "\u{1F60A}"].map((m, i) => `<button data-action="mood" data-value="${i + 1}" class="${d.mood === i + 1 ? "selected" : ""}" aria-label="${t("How are you feeling?")} ${i + 1}/5" aria-pressed="${d.mood === i + 1}">${m}</button>`).join("")}</div><label for="stress">${t("Stress level")} <span id="stress-value">${d.stress || "\u2014"}</span> / 5</label><input type="range" min="1" max="5" id="stress" value="${d.stress || 3}"></section><section class="card"><div class="cardhead"><h2>${t("Your quiet reflection")}</h2>${icon("book")}</div><div class="journal-grid">${[
      ["well", "What went well?"],
      ["improve", "What to fix tomorrow?"],
      ["grateful", "3 things I am grateful for"],
    ]
      .map(
        ([k, l]) =>
          `<div><label for="journal-${k}">${t(l)}</label><textarea id="journal-${k}" data-journal="${k}" placeholder="${t(l)}">${esc(d.journal[k] || "")}</textarea></div>`,
      )
      .join(
        "",
      )}</div><small>${t("Saved on this device")}</small></section></div><aside class="stack right-column"><section class="card score-card"><div class="cardhead"><h2>${t("Your daily score")}</h2>${icon("leaf")}</div><div class="score-body"><div class="score-ring" style="--pct:${s}%"><div><b>${s}<span style="font-size:13px">%</span></b><small>${t("Daily score")}</small></div></div><div><p>${t(encouragement)}</p><div class="goldtext">\u{1F525} ${streak()} ${t("days")} \xB7 ${t("Consistency streak")}</div></div></div></section><section class="card rhythm-card"><div class="cardhead"><h2>${t("Your daily rhythm")}</h2>${icon("clock")}</div><div class="timeline">${currentSchedule(
      session.selectedDate,
    )
      .map(
        (b) =>
          `<div class="time-block"><time>${esc(b.time)}</time><i class="time-dot" style="${b.prayer ? "background:var(--gold)" : ""}"></i><div><h3>${esc(t(b.label))}</h3><small>${esc(t(b.note || ""))}</small></div></div>`,
      )
      .join(
        "",
      )}</div><div class="row between"><button class="linkbtn" data-action="export-day">${t("Export calendar")}</button><button class="linkbtn" data-action="schedule">${t("Edit plan")}</button></div></section><section class="card inspiration"><div class="cardhead"><span class="eyebrow">${t("Verse of the day")}</span>${icon("book")}</div>${verse ? `<div class="quran" lang="ar">${esc(verse.ar)}</div>${verse[session.lang] && session.lang !== "ar" ? `<p style="font-size:12px;margin-top:15px">${esc(verse[session.lang] || verse.ar)}</p>` : ""}<span class="source">${verse.chapter}:${verse.verse} \xB7 Quran API \xB7 ${session.lang === "ur" ? "Fateh Muhammad Jalandhry" : session.lang === "en" ? "Abdel Haleem" : "Uthmani Hafs · " + t("Arabic source text")}</span><div class="row between wrap" style="margin-top:8px"><a class="linkbtn" href="https://quran.com/${verse.chapter}:${verse.verse}/tafsirs/en-tafisr-ibn-kathir" target="_blank" rel="noopener noreferrer">${t("Read explanation")} \u2197</a><button class="linkbtn" data-action="verse-audio">${t("Play verse")}</button></div>` : `<p>${t("No check-ins yet. Your first step can be today.")}</p>`}</section>${hadith ? `<section class="card"><div class="cardhead"><span class="eyebrow">${t("Hadith of the day")}</span>${icon("book")}</div><p lang="${hadith[session.lang] ? session.lang : "ar"}" dir="${!hadith[session.lang] || ["ar", "ur"].includes(session.lang) ? "rtl" : "ltr"}" class="hadith-text ${session.lang === "ar" || !hadith[session.lang] ? "quote" : ""}" style="font-size:${session.lang === "ar" || !hadith[session.lang] ? 22 : session.lang === "ur" ? 18 : 14}px;line-height:1.9;white-space:pre-line;overflow-wrap:anywhere">${esc(hadith[session.lang] || hadith.ar)}</p>${!hadith[session.lang] ? `<small>${t("Arabic source text")}</small>` : ""}<span class="source">Sunan Abi Dawud ${hadith.number} \xB7 ${t("Grade")}: ${esc(hadith.grades[0].grade)}<br>${t("Graded by")}: ${esc(hadith.grades[0].name)}</span><a class="linkbtn" href="${hadith.url}" target="_blank" rel="noopener noreferrer">${t("Learn more")} \u2197</a></section>` : ""}${name ? `<section class="card center"><span class="eyebrow">${t("Name of Allah")}</span><p class="quote goldtext" lang="ar" dir="rtl" style="font-size:32px;margin:12px 0">${esc(name.name)}</p><p dir="rtl" lang="ar" style="font-family:Amiri;font-size:18px">${esc(name.meaning)}</p><small>${t("Arabic source text")} \xB7 Names of Allah JSON</small></section>` : ""}<section class="card"><div class="cardhead"><h2>${t("Focus timer")}</h2>${icon("clock")}</div><div class="row between"><span id="pomodoro-time" class="timer">${timerText()}</span><div class="row"><button class="btn secondary" data-action="timer">${t(pomodoro.running ? "Pause" : "Start")}</button><button class="iconbtn" data-action="timer-reset" aria-label="${t("Reset")}">\u21BA</button></div></div><small>25 min \xB7 ${t("Deep work")}</small></section></aside></div>`
  );
}
export { view_today };
