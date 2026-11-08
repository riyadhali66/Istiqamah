import { ramadanService } from "./ramadan.js?v=2.1.0";
import { prayerService } from "./prayer.js?v=2.1.0";
import { session } from "./session.js?v=2.1.0";
import { CATEGORIES, timezone } from "./config.js?v=2.1.0";
import { modal } from "./ui/core.js?v=2.1.0";
import { t } from "./i18n.js?v=2.1.0";
import { $, download, esc, icon, money } from "./utils.js?v=2.1.0";
import { offsetDay } from "./dates.js?v=2.1.0";
import { isPaused, monthKeys, monthlyHabits, score } from "./records.js?v=2.1.0";
function currentSchedule(key) {
  const prayers = prayerService.calculate(key), p = session.state.profile;
  const tm = (date) => new Intl.DateTimeFormat("en-GB", {
    timeZone: p.tz || timezone(),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
  const timeAfter = (name, mins, fallback) => {
    let d = prayers.find((a) => a.name === name)?.date;
    return d ? tm(new Date(+d + mins * 6e4)) : fallback;
  };
  let blocks = [
    {
      id: "wake",
      time: p.wake,
      label: "Today\u2019s focus",
      note: "Begin with intention. Grow with consistency."
    },
    {
      id: "quran",
      time: timeAfter("Fajr", 20, "06:20"),
      label: "Read Quran",
      note: "Morning adhkar"
    },
    {
      id: "exercise",
      time: timeAfter("Fajr", 45, "06:45"),
      label: p.exercise === "Walk" ? "Morning walk" : "Workout",
      note: "One small step, a little closer."
    },
    {
      id: "deep",
      time: p.focus === "Morning" ? p.workStart : timeAfter("Isha", 30, "20:30"),
      label: p.work === "Student" ? "Study focus blocks" : "Deep work",
      note: "Top 3 tasks before noon"
    },
    {
      id: "skill",
      time: timeAfter("Dhuhr", 30, "13:00"),
      label: p.goals.includes("Language Learning") ? "Listen in your target language" : "Skill practice",
      note: "20 minutes"
    },
    {
      id: "admin",
      time: timeAfter("Asr", 25, "16:00"),
      label: "Admin & outreach",
      note: p.work === "Job seeker" ? "Apply to 2 jobs" : "Log expenses"
    },
    {
      id: "family",
      time: p.workEnd,
      label: "Family time",
      note: p.kids ? "Quran with kids" : "Connect with someone"
    },
    {
      id: "evening",
      time: timeAfter("Maghrib", 20, "18:30"),
      label: "Evening adhkar",
      note: "Your quiet reflection"
    },
    {
      id: "plan",
      time: timeAfter("Isha", 20, "20:00"),
      label: "Plan tomorrow",
      note: "Phone off before bed"
    },
    {
      id: "sleep",
      time: p.sleep,
      label: "Sleep",
      note: "Go gently. You are building something lasting."
    }
  ];
  for (let override of session.state.schedule) {
    let idx = blocks.findIndex((b) => b.id === override.id);
    if (override.hidden) {
      if (idx >= 0) blocks.splice(idx, 1);
    } else if (idx >= 0) blocks[idx] = { ...blocks[idx], ...override };
    else blocks.push(override);
  }
  blocks.push(...ramadanService.schedule(key));
  blocks.push(
    ...prayers.map((a) => ({
      id: "p-" + a.name,
      time: tm(a.date),
      label: a.name,
      prayer: true,
      note: "Prayer"
    }))
  );
  return blocks.sort((a, b) => a.time.localeCompare(b.time));
}
function showSchedule() {
  const blocks = currentSchedule(session.selectedDate).filter((b) => !b.prayer && !b.ramadanPrep);
  modal(
    "Your daily rhythm",
    `<form id="schedule-form"><small>${t("Prayer times")} \xB7 ${esc(session.state.profile.method)} \xB7 ${t("Saved on this device")}</small>${blocks.map((b) => `<div class="edit-row"><input type="time" data-block-time="${b.id}" value="${esc(b.time)}" required aria-label="${t("Your daily rhythm")}" style="width:110px"><input data-block-label="${b.id}" value="${esc(t(b.label))}" required maxlength="120" aria-label="${t("Name")}"><button type="button" data-action="remove-block" data-id="${b.id}" aria-label="${t("Remove")}">\xD7</button></div>`).join("")}<button class="btn section-gap">${t("Save")}</button></form><form id="block-form" class="section-gap"><h3>${t("Add habit")} \xB7 ${t("Your daily rhythm")}</h3><label>${t("Name")}</label><input name="label" required maxlength="120"><label>${t("Your daily rhythm")}</label><input name="time" type="time" required value="12:00"><button class="btn secondary section-gap">${icon("plus")}${t("Save")}</button></form>`
  );
}
function icsEscape(v) {
  return String(v).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}
function zonedDate(key, time) {
  const [y, m, d] = key.split("-").map(Number), [hour, minute] = time.split(":").map(Number), target = Date.UTC(y, m - 1, d, hour, minute);
  let instant = target;
  for (let i = 0; i < 3; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: session.state.profile.tz || timezone(),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date(instant));
    const v = (k) => +parts.find((p) => p.type === k).value;
    const actual = Date.UTC(
      v("year"),
      v("month") - 1,
      v("day"),
      v("hour"),
      v("minute"),
      v("second")
    );
    const diff = target - actual;
    instant += diff;
    if (!diff) break;
  }
  return new Date(instant);
}
function exportCalendar(days) {
  let lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Istiqamah//Daily Plan//EN",
    "CALSCALE:GREGORIAN"
  ];
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  for (let i = 0; i < days; i++) {
    let key = offsetDay(session.selectedDate, i);
    for (let b of currentSchedule(key)) {
      let start = b.prayer ? prayerService.calculate(key).find((p) => p.name === b.label)?.date : b.instant ? new Date(b.instant) : zonedDate(key, b.time);
      if (!start || !Number.isFinite(+start)) continue;
      lines.push(
        "BEGIN:VEVENT",
        "UID:" + icsEscape(key + "-" + b.id + "@istiqamah.local"),
        "DTSTAMP:" + fmt(/* @__PURE__ */ new Date()),
        "DTSTART:" + fmt(start),
        "DTEND:" + fmt(new Date(+start + 20 * 6e4)),
        "SUMMARY:" + icsEscape(t(b.label)),
        "DESCRIPTION:" + icsEscape("Istiqamah \xB7 " + t(b.note || "")),
        "BEGIN:VALARM",
        "TRIGGER:-PT5M",
        "ACTION:DISPLAY",
        "DESCRIPTION:" + icsEscape(t(b.label)),
        "END:VALARM",
        "END:VEVENT"
      );
    }
  }
  lines.push("END:VCALENDAR");
  const fold = (line) => {
    let result = "", bytes = 0;
    for (let ch of line) {
      const len = new TextEncoder().encode(ch).length;
      if (bytes + len > 73) {
        result += "\r\n ";
        bytes = 1;
      }
      result += ch;
      bytes += len;
    }
    return result;
  };
  download(
    `istiqamah-${session.selectedDate}-${days}day.ics`,
    lines.map(fold).join("\r\n") + "\r\n",
    "text/calendar;charset=utf-8"
  );
}
function printTracker() {
  const keys = monthKeys(), hs = monthlyHabits(), r = session.state.reviews[session.month] || {}, tracked = keys.filter(
    (k) => session.state.days[k] && Object.values(session.state.days[k].values || {}).some((v) => v > 0)
  );
  $("#print-area").innerHTML = `<article class="print-page"><h1>Istiqamah \xB7 ${esc(session.state.profile.name)}</h1><p>${t("Small deeds. Every day. Limitless results.")} \xB7 ${session.month}</p><table class="print-table"><thead><tr><th>${t("Daily intentions")}</th>${keys.map((k, i) => `<th>${i + 1}</th>`).join("")}</tr></thead><tbody>${hs.map(
    (h) => `<tr><td>${esc(t(h.label))} (${h.target} ${esc(t(h.unit))})</td>${keys.map((k) => {
      let d = session.state.days[k], v = d?.values?.[h.id] || 0, orig = d?.snapshot?.find((a) => a.id === h.id);
      return `<td>${isPaused(h, d) ? "\u2013" : v ? h.target === 1 ? "\u2713" : money(v) : ""}</td>`;
    }).join("")}</tr>`
  ).join(
    ""
  )}<tr><td>${t("Daily score")}</td>${keys.map((k) => `<td>${session.state.days[k] ? score(k) + "%" : ""}</td>`).join("")}</tr></tbody></table><p style="margin-top:12px">\u2713 ${t("completed")} \xB7 \u2013 ${t("Paused \u2014 streak protected")}</p></article><article class="print-page"><h1>${t("Monthly review")} \xB7 ${session.month}</h1><p>${esc(session.state.profile.name)} \xB7 ${t("Days with check-ins")}: ${tracked.length} \xB7 ${t("Monthly average")}: ${tracked.length ? Math.round(tracked.reduce((s, k) => s + score(k), 0) / tracked.length) : 0}%</p><div class="print-summary"><section><h2>${t("Wins this month")}</h2><p>${esc(r.wins || "")}</p><h2>${t("Next month\u2019s goals")}</h2>${CATEGORIES.map((c) => `<p><b>${t(c)}:</b> ${esc(r[c] || "")}</p>`).join("")}</section><section><h2>${t("Your quiet reflection")}</h2>${keys.filter(
    (k) => Object.values(session.state.days[k]?.journal || {}).some(Boolean)
  ).slice(-7).map(
    (k) => `<p><b>${k}</b>
${esc(session.state.days[k].journal.well || "")}
${esc(session.state.days[k].journal.grateful || "")}</p><br>`
  ).join("")}</section></div></article>`;
  window.print();
}
export {
  currentSchedule,
  showSchedule,
  icsEscape,
  zonedDate,
  exportCalendar,
  printTracker
};
