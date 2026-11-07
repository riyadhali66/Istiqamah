import { ramadanService } from "../ramadan.js?v=1.2.0";
import { drawRamadanChart } from "./ramadan.js?v=1.2.0";
import { $, esc, toast } from "../utils.js?v=1.2.0";
import { t } from "../i18n.js?v=1.2.0";
import { CITY } from "../config.js?v=1.2.0";
import { session } from "../session.js?v=1.2.0";
import { ui, ensureView } from "./views.js?v=1.2.0";
import { drawCharts, ensureCharts } from "./charts.js?v=1.2.0";
import { updateOfflineStatus } from "../offline.js?v=1.2.0";
import { prayerService } from "../prayer.js?v=1.2.0";

function options(values, selected, labels = values) {
  return values
    .map(
      (v, i) =>
        `<option value="${esc(v)}" ${v === selected ? "selected" : ""}>${esc(t(labels[i]))}</option>`,
    )
    .join("");
}
function locationFields(p, prefix) {
  return `<div class="formgrid"><div><label>${t("Country")}</label><input data-${prefix}="country" value="${esc(p.country)}" maxlength="80"></div><div><label>${t("City")}</label><input data-${prefix}="city" list="cities" value="${esc(p.city)}" maxlength="80"><datalist id="cities">${Object.keys(
    CITY,
  )
    .map((c) => `<option>${c}</option>`)
    .join(
      "",
    )}</datalist></div><div><label>${t("Latitude")}</label><input type="number" min="-90" max="90" step="any" data-${prefix}="lat" value="${esc(p.lat)}"></div><div><label>${t("Longitude")}</label><input type="number" min="-180" max="180" step="any" data-${prefix}="lon" value="${esc(p.lon)}"></div><div class="full"><label>${t("Time zone")}</label><input data-${prefix}="tz" value="${esc(p.tz)}" maxlength="80"></div></div>`;
}
function linkLabels(root = document) {
  root.querySelectorAll("input,select,textarea").forEach((el, i) => {
    let label = el.previousElementSibling;
    if (label?.tagName === "LABEL" && !label.htmlFor && !el.closest("label")) {
      if (!el.id) el.id = "field-" + (root.id || "app") + "-" + i;
      label.htmlFor = el.id;
    }
  });
}
function render() {
  if (!ui[session.page]) {
    ensureView(session.page)
      .then(render)
      .catch(() =>
        toast("Readings could not be loaded. Your records are safe."),
      );
    return;
  }
  for (let c of session.charts) c.destroy();
  session.charts = [];
  document.documentElement.lang = session.lang;
  document.documentElement.dir = ["ar", "ur"].includes(session.lang)
    ? "rtl"
    : "ltr";
  document.documentElement.dataset.theme = session.state.settings.theme;
  document.documentElement.dataset.ramadan = String(
    ramadanService.context().active,
  );
  ui.shell();
  $("#main").innerHTML =
    ui.top() +
    (session.storageError
      ? `<div class="notice">${t("Saved records need recovery. They have not been overwritten.")} <button class="linkbtn" data-action="export-original">${t("Export original saved data")}</button><button class="linkbtn" data-action="nav" data-id="settings">${t("Settings")}</button></div>`
      : "") +
    ui[session.page]() +
    ui.footer();
  linkLabels($("#main"));
  if (session.page === "progress")
    ensureCharts()
      .then(() => {
        if (session.page === "progress" && !session.charts.length) drawCharts();
      })
      .catch(() => toast("Charts could not be loaded. Your records are safe."));
  if (session.page === "tools" && session.tool === "ramadan")
    ensureCharts()
      .then(() => {
        if (session.page === "tools" && session.tool === "ramadan")
          drawRamadanChart();
      })
      .catch(() => toast("Charts could not be loaded. Your records are safe."));
  if (session.page === "settings") updateOfflineStatus();
  prayerService.tick();
}
function modal(title, body) {
  $("#modal").innerHTML =
    `<div class="dialog-inner"><div class="cardhead"><h2 id="modal-title">${t(title)}</h2><button class="iconbtn" data-action="close-modal" aria-label="${t("Close")}">\xD7</button></div>${body}</div>`;
  linkLabels($("#modal"));
  $("#modal").showModal();
}

export { options, locationFields, linkLabels, render, modal };
