import { prayerService } from "../prayer.js?v=2.1.1";
import { session } from "../session.js?v=2.1.1";
import { ramadanService as service } from "../ramadan.js?v=2.1.1";
import { t } from "../i18n.js?v=2.1.1";
import { esc, $, download, toast } from "../utils.js?v=2.1.1";
import { modal, render } from "./core.js?v=2.1.1";
import { today } from "../dates.js?v=2.1.1";
import { storage } from "../storage.js?v=2.1.1";
const notifiedPreparation = new Set();
const fields = [
  ["fasted", "Fasted"],
  ["notFasting", "Not fasting today"],
  ["paused", "Pause tracking"],
  ["charity", "Charity"], ["adhkar", "Adhkar"], ["family", "Family"],
  ["makeUpNeeded", "I want to track a make-up fast"],
  ["suhoor", "Suhoor"],
  ["taraweeh", "Taraweeh"],
  ["dua", "Dua before iftar"],
  ["feed", "Feed a fasting person"],
];
const number = (field, label, value, step = "1") =>
  `<label>${t(label)}<input type="number" min="0" max="1000000" step="${step}" data-ramadan="${field}" value="${value || 0}"></label>`;
const control = (field, label, value) =>
  `<label class="inline-check"><input type="checkbox" data-ramadan="${field}" ${value ? "checked" : ""}>${t(label)}</label>`;
function clock(value) {
  if (value == null) return t("Set your location");
  return [Math.floor(value / 3600), Math.floor((value % 3600) / 60), value % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
export function ramadanHome() {
  const ctx = service.context(),
    c = service.config();
  const preview = ctx.preview
    ? `<div class="notice">${t("Ramadan preview — practice records stay separate.")} <button class="linkbtn" data-action="ramadan-preview-off">${t("Exit preview")}</button></div>`
    : "";
  if (ctx.coming)
    return `<section class="card ramadan-card"><h2>${t("Ramadan is coming — prepare your plan")}</h2><button class="btn gold" data-action="ramadan-setup">${t("Prepare my Ramadan")}</button></section>`;
  if (ctx.eid) {
    const s = service.summary(ctx);
    return (
      preview +
      `<section class="card ramadan-card" id="eid-summary"><h2>${t("Eid Mubarak")}</h2><p>${s.fasted} ${t("Days fasted")} · ${s.pages} ${t("Quran pages")} · ${s.percent}% ${t("Khatm progress")} · ${s.best} ${t("Best streak")}</p><button class="btn gold" data-action="eid-share">${t("Save Eid image")}</button><p>${t("The image includes only a greeting and the app link.")}</p>${ctx.shawwal ? `<p>${t("Consider the six days of Shawwal at your own pace.")} <button class="linkbtn" data-action="ramadan-shawwal">${t("Fasting")}</button></p>` : ""}</section>`
    );
  }
  if (!ctx.active)
    return (
      preview +
      (ctx.shawwal
        ? `<section class="card"><h2>${t("Shawwal")}</h2><p>${t("Consider the six days of Shawwal at your own pace.")}</p><button class="linkbtn" data-action="ramadan-shawwal">${t("Fasting")}</button></section>`
        : "")
    );
  const d = service.record(ctx),
    night = service.night(ctx);
  return (
    preview +
    `<section class="card ramadan-card" id="ramadan-home"><div class="row between wrap"><div><span class="eyebrow">${t("Ramadan")}</span><h2>${t("Day")} ${ctx.day} / ${ctx.length}</h2></div><button class="linkbtn" data-action="ramadan-setup">${t("Ramadan plan")}</button></div><p>${t("Dates follow Umm al-Qura; local moon sighting may differ.")} ${esc(c.manualStart || "")} · ${c.adjustment}</p><button class="linkbtn" data-action="ramadan-toggle">${t("Turn off Ramadan Mode")}</button><div class="ramadan-countdowns">${service
      .countdowns(ctx)
      .map(
        (item) =>
          `<div><strong>${t(item.name === "Fajr" ? "Time remaining until Fajr" : "Time remaining until Maghrib")}</strong><small>${item.date ? prayerService.format(item.date) : ""}</small><output data-ramadan-countdown="${item.name}">${ctx.effective !== today() && !ctx.preview && item.date ? prayerService.format(item.date) : clock(item.seconds)}</output></div>`,
      )
      .join("")}</div>
 <div class="ramadan-preparation"><h3>${t("Preparation reminders")}</h3><p>${t("Personal reminders, not religious deadlines. Fajr and Maghrib remain the prayer times.")}</p><p>${t("Suhoor preparation")}: ${c.suhoorMinutes} ${t("minutes before Fajr")} · ${t("Iftar preparation")}: ${c.iftarMinutes} ${t("minutes before Maghrib")}</p></div>
 <div class="ramadan-checks">${fields.filter(([key])=>!["taraweeh","charity","adhkar","family"].includes(key)||c.goals[key]!==false).map(([key, label]) => control(key, label, d[key])).join("")}${number("pages", "Quran pages", d.pages)}<label>${t("Private reason (optional)")}<input data-ramadan="reason" maxlength="1000" value="${esc(d.reason || "")}"></label>${number("sadaqah", "Sadaqah", d.sadaqah, "0.01")}${night.lastTen ? control("nightPrayer", "Night prayer", d.nightPrayer) + control("itikaf", "I’tikaf", d.itikaf) : ""}</div><p>${t("Not fasting today is private and protects your fasting streak.")}</p>
 ${planner(ctx)}<p>${t("Daily sadaqah goal")}: ${c.dailySadaqah} · ${t("Taraweeh")}: ${t({ home: "At home", mosque: "At the mosque", skip: "Not this year" }[c.taraweeh])}</p>${night.lastTen ? nightCard(ctx) + fitr(ctx) : ""}<button class="btn gold section-gap" data-action="ramadan-details">${t("Ramadan tracker")}</button></section>`
  );
}
function planner(ctx) {
  const p = service.planner(ctx);
  return `<section class="ramadan-planner" id="khatm-planner"><h3>${t("Khatm planner")}</h3><p>${p.read} / ${p.target} ${t("pages")} · ${p.days} ${t("days remaining")}</p><strong>${p.perDay} ${t("pages per day")} · ${t("About")} ${p.perPrayer} ${t("pages after each prayer")}</strong>${p.behind ? `<p>${t("A fresh small step is enough. Your plan has gently adjusted to the days ahead.")}</p>` : `<p>${t("Keep your reading at a pace that feels sustainable.")}</p>`}</section>`;
}
function nightCard(ctx) {
  const n = service.night(ctx),
    dua = window.SOURCE_DATA?.["ramadan-dua"];
  return `<section class="ramadan-night ${n.odd ? "odd-night" : ""}"><h3>${t("Night")} ${n.number} · ${t(n.odd ? "An odd night — make room for dua." : "The last ten nights")}</h3><p>${t("Seek Laylat al-Qadr with a small, sincere act.")}</p><p>${esc(service.config().nightGoals || "")}</p>${dua ? `<p class="quote" lang="ar" dir="rtl">${esc(dua.ar)}</p>${session.lang === "en" ? `<p>${esc(dua.en)}</p>` : `<small>${t("Arabic source text")}</small>`}<p class="source"><a href="${dua.url}" target="_blank" rel="noopener noreferrer">${esc(dua.reference)}</a> · ${t("Grade")}: Sahih (Al-Albani); Hasan Sahih (Bashar Awad Maarouf). ${t("Source grading differs; see the full reference.")}</p>` : ""}</section>`;
}
function fitr(ctx) {
  if (!ctx.active || ctx.day < 21) return "";
  const c = service.config();
  return `<section class="card"><h2>${t("Zakat al-Fitr")}</h2><p>${t("Check the official amount with your local authority. Give before Eid prayer.")}</p><div class="formgrid">${number("fitrAmount", "Amount per person", c.fitrAmount, "0.01")}${number("fitrPeople", "Family size", c.fitrPeople)}</div><strong>${t("Total")}: ${Math.round(c.fitrAmount * c.fitrPeople * 100) / 100}</strong></section>`;
}
export function view_ramadan() {
  return ramadanDetails();
}
export function ramadanDetails() {
  const ctx = service.context(),
    ds = service.days(ctx),
    s = service.summary(ctx),
    q = service.qada();
  return `<div class="stack">${ramadanHome()}<section class="card"><h2>${t("Ramadan 30-day tracker")}</h2><div class="ramadan-heatmap" role="list">${ctx.keys
    .map((key, i) => {
      const d = ds.find((d) => d.key === key);
      return `<div role="listitem" class="${d?.notFasting ? "paused" : d?.fasted ? "complete" : ""}" aria-label="${t("Day")} ${i + 1}: ${t(d?.notFasting ? "Not fasting today" : d?.fasted ? "Fasted" : "No check-ins yet. Your first step can be today.")}" title="${key}"><b>${i + 1}</b><span>${d?.notFasting ? "—" : d?.fasted ? "✓" : "·"}</span><small>${d?.pages || 0} ${t("pages")}</small></div>`;
    })
    .join(
      "",
    )}</div><p>${s.fasted} ${t("Days fasted")} · ${s.pages} ${t("Quran pages")} · ${s.taraweeh} ${t("Taraweeh")}</p><button class="btn secondary section-gap" data-action="ramadan-print">${t("Print Ramadan tracker")}</button><div class="chartbox section-gap"><canvas id="ramadan-chart" role="img" aria-label="${t("Quran pages, fasting and taraweeh by day")}"></canvas></div></section><section class="card" id="qada-private"><h2>${t("Missed fasts — private")}</h2><p>${q.remaining} ${t("Make-up fasts remaining")} · ${q.paid} ${t("Make-ups logged")}</p><p>${t("Only fasts you choose to track are included. Ask a qualified scholar about your circumstances.")}</p>${!ctx.active && !ctx.preview ? `<div class="row wrap"><button class="btn secondary" data-action="qada-done" ${q.remaining ? "" : "disabled"}>${t("Log a make-up fast")}</button><button class="linkbtn" data-action="qada-undo" ${q.paid ? "" : "disabled"}>${t("Undo make-up")}</button></div>` : ""}</section></div>`;
}
export function ramadanSettings() {
  const c = service.config();
  return `<section class="card"><h2>${t("Ramadan")}</h2><label>${t("Ramadan started / ended")}<select id="ramadan-mode"><option value="auto" ${c.mode === "auto" ? "selected" : ""}>${t("Automatic")}</option><option value="on" ${c.mode === "on" ? "selected" : ""}>${t("Ramadan started")}</option><option value="off" ${c.mode === "off" ? "selected" : ""}>${t("Ramadan ended")}</option></select></label><label>${t("Moon-sighting adjustment")}<select id="ramadan-adjustment">${[-1, 0, 1].map((v) => `<option value="${v}" ${v === c.adjustment ? "selected" : ""}>${v > 0 ? "+" : ""}${v}</option>`).join("")}</select></label><p>${t("Dates follow Umm al-Qura; local moon sighting may differ.")}</p><label>${t("Local Ramadan start date")}<input id="ramadan-start-date" type="date" value="${esc(c.manualStart)}"></label><label>${t("Locally announced month length")}<select data-ramadan-config="manualLength">${[29,30].map(n=>`<option value="${n}" ${c.manualLength===n?"selected":""}>${n}</option>`).join("")}</select></label><p>${t("Month length applies only to a local start date.")}</p><label>${t("Suhoor preparation")}<input data-ramadan-config="suhoorMinutes" type="number" min="0" max="180" value="${c.suhoorMinutes}"></label><label>${t("Iftar preparation")}<input data-ramadan-config="iftarMinutes" type="number" min="0" max="180" value="${c.iftarMinutes}"></label><label class="inline-check"><input type="checkbox" data-ramadan-config="dailyTargetEnabled" ${c.dailyTargetEnabled?'checked':''}>${t("Daily Quran pages")}</label><label>${t("Daily Quran pages")}<input type="number" data-ramadan-config="dailyPages" min="0" max="1000000" value="${c.dailyPages}"></label>${['taraweeh','charity','adhkar','family'].map(k=>`<label class="inline-check"><input type="checkbox" data-ramadan-goal="${k}" ${c.goals[k]!==false?'checked':''}>${t({taraweeh:'Taraweeh',charity:'Charity',adhkar:'Adhkar',family:'Family'}[k])}</label>`).join('')}<h3>${t("Quran completion plan")}</h3><label><input data-completion="enabled" type="checkbox" ${c.completion.enabled?'checked':''}>${t("Enable completion plan")}</label><label>${t("Remaining pages as of today")}<input data-completion="pages" type="number" min="0" max="1000000" value="${c.completion.pages}"></label><label>${t("Intended completion date")}<input data-completion="deadline" type="date" value="${esc(c.completion.deadline)}"></label><label>${t("Optional worship goals")}<textarea data-ramadan-config="nightGoals" maxlength="1000">${esc(c.nightGoals)}</textarea></label><button class="btn secondary" data-action="ramadan-setup">${t("Ramadan plan")}</button></section>`;
}
export function ramadanPreviewControl() {
  return `<details class="section-gap"><summary>${t("Developer preview")}</summary><label>${t("Preview Ramadan")}<select id="ramadan-preview"><option value="off">${t("Off")}</option>${[1, 21, 30, 31, 32].map((day) => `<option value="${day}">${day <= 30 ? t("Day") + " " + day : day === 31 ? t("Eid Mubarak") : t("Shawwal")}</option>`).join("")}</select></label><p>${t("Ramadan preview — practice records stay separate.")}</p></details>`;
}
let setupDraft,
  setupStep = 0;
export function showRamadanSetup(step = 0) {
  if (!step) {
    setupDraft = {
      ...service.config(),
      notFasting: !!(service.context().active && service.record().notFasting),
    };
    setupStep = 0;
  } else setupStep = 1;
  const body =
    setupStep === 0
      ? `<label>${t("Quran completion goal")}<select id="ramadan-goal">${[0.5, 1, 2, 3].map((n) => `<option value="${n}" ${n === setupDraft.goal ? "selected" : ""}>${n}</option>`).join("")}</select></label><label>${t("Taraweeh")}<select id="ramadan-taraweeh">${[
          ["home", "At home"],
          ["mosque", "At the mosque"],
          ["skip", "Not this year"],
        ]
          .map(
            ([v, l]) =>
              `<option value="${v}" ${v === setupDraft.taraweeh ? "selected" : ""}>${t(l)}</option>`,
          )
          .join("")}</select></label>`
      : `<label>${t("Daily sadaqah goal")}<input id="ramadan-sadaqah" type="number" min="0" max="1000000" step="0.01" value="${setupDraft.dailySadaqah}"></label>${control("setupNotFasting", "Not fasting today", setupDraft.notFasting)}<p>${t("No reason is requested or stored.")}</p>`;
  modal(
    "Ramadan plan",
    `<p>${setupStep + 1} / 2</p>${body}<div class="row wrap section-gap"><button class="btn" data-action="ramadan-setup-next">${t(setupStep ? "Save" : "Continue")}</button><button class="linkbtn" data-action="ramadan-setup-skip">${t("Skip for now")}</button></div>`,
  );
}
export function advanceSetup() {
  if (!setupStep) {
    setupDraft.goal = Number($("#ramadan-goal").value);
    setupDraft.dailyTargetEnabled=false;
    setupDraft.taraweeh = $("#ramadan-taraweeh").value;
    showRamadanSetup(1);
    return;
  }
  const amount = Number($("#ramadan-sadaqah").value);
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e6) return;
  Object.assign(service.config(), {
    goal: setupDraft.goal,
    taraweeh: setupDraft.taraweeh,
    dailySadaqah: amount,
    setupYear: service.context().season,
  });
  const notFasting = !!document.querySelector(
    '[data-ramadan="setupNotFasting"]',
  ).checked;
  if (service.context().active) service.update("notFasting", notFasting);
  if (!service.context().preview) storage.save();
  $("#modal").close();
  render();
}
export function ramadanTick() {
  const ctx = service.context();
  if (!ctx.active) return;
  if(!ctx.preview && session.state.settings.reminders){
    for(const block of service.preparation(today())){
      const delta=Date.now()-Date.parse(block.instant);
      if(delta>=0 && delta<60000 && !notifiedPreparation.has(block.instant)){
        notifiedPreparation.add(block.instant);toast(t(block.label));
        if('Notification' in window && Notification.permission==='granted')new Notification(t(block.label),{body:t('Personal preparation reminder')});
      }
    }
  }
  for (const item of service.countdowns(ctx)) {
    const el = document.querySelector(
      `[data-ramadan-countdown="${item.name}"]`,
    );
    if (el)
      el.textContent =
        ctx.effective !== today() && !ctx.preview && item.date
          ? prayerService.format(item.date)
          : clock(item.seconds);
  }
}
export function drawRamadanChart() {
  const el = $("#ramadan-chart");
  if (!el || !window.Chart || session.charts.length) return;
  const ctx = service.context(),
    ds = service.days(ctx);
  session.charts.push(
    new Chart(el, {
      type: "bar",
      data: {
        labels: ctx.keys.map((_, i) => i + 1),
        datasets: [
          ["Quran pages", "pages", "#b68d43"],
          ["Fasted", "fasted", "#48886a"],
          ["Taraweeh", "taraweeh", "#7d8fb0"],
        ].map(([label, key, color]) => ({
          label: t(label),
          data: ctx.keys.map((k) =>
            Number(ds.find((d) => d.key === k)?.[key] || 0),
          ),
          backgroundColor: color,
          yAxisID: key === "pages" ? "pages" : "checks",
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          pages: { beginAtZero: true, position: "left" },
          checks: { min: 0, max: 1, position: "right", ticks: { stepSize: 1 } },
        },
      },
    }),
  );
}
export function printRamadan() {
  const ctx = service.context(),
    ds = service.days(ctx),
    rows = [
      ...fields,
      ["pages", "Quran pages"],
      ["sadaqah", "Sadaqah"],
      ["nightPrayer", "Night prayer"],
      ["itikaf", "I’tikaf"],
    ];
  $("#print-area").innerHTML =
    `<article class="print-page ramadan-print"><h1>Istiqamah · ${t("Ramadan 30-day tracker")} · ${ctx.season}</h1><p>${t("Dates follow Umm al-Qura; local moon sighting may differ.")}</p><table><thead><tr><th>${t("Day")}</th>${ctx.keys.map((_, i) => `<th>${i + 1}</th>`).join("")}</tr></thead><tbody>${rows
      .map(
        ([key, label]) =>
          `<tr><th>${t(label)}</th>${ctx.keys
            .map((k) => {
              const v = ds.find((d) => d.key === k)?.[key];
              return `<td>${typeof v === "boolean" ? (v ? "✓" : "") : v || ""}</td>`;
            })
            .join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table><p dir="ltr">https://riyadhali66.github.io/Istiqamah/</p></article>`;
  window.print();
}
export async function shareEid() {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#164e42";
  ctx.fillRect(0, 0, 1080, 1080);
  ctx.strokeStyle = "#d9ba75";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, 980, 980);
  ctx.fillStyle = "#efdaad";
  ctx.textAlign = "center";
  ctx.font = "64px Georgia";
  ctx.fillText("Istiqamah", 540, 280);
  await document.fonts.ready;
  ctx.font = "bold 70px Amiri, sans-serif";
  ctx.fillText(t("Eid Mubarak"), 540, 520);
  ctx.font = "28px sans-serif";
  ctx.fillText("https://riyadhali66.github.io/Istiqamah/", 540, 790);
  canvas.toBlob((blob) => {
    if (blob) download("istiqamah-eid.png", blob, "image/png");
    else toast("Image could not be saved.");
  }, "image/png");
}

export function maybeRamadanSetup() {
  const ctx = service.context();
  if (
    session.state.onboarded &&
    ctx.active &&
    !ctx.preview &&
    service.config().setupYear !== ctx.season &&
    session.ramadanPrompted !== ctx.season &&
    !$("#wizard").open &&
    !$("#modal").open
  ) {
    session.ramadanPrompted = ctx.season;
    showRamadanSetup();
  }
}
export function skipRamadanSetup() {
  service.config().setupYear = service.context().season;
  if (!service.context().preview) storage.save();
  $("#modal").close();
}
