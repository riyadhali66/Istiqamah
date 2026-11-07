import { session } from "../session.js?v=1.2.0";
import { t } from "../i18n.js?v=1.2.0";
import { $, $$, esc, icon, money, toast, uid } from "../utils.js?v=1.2.0";
import { linkLabels, locationFields, options, render } from "./core.js?v=1.2.0";
import {
  CATEGORIES,
  CITY,
  METHODS,
  STRUGGLES,
  timezone,
} from "../config.js?v=1.2.0";
import { today } from "../dates.js?v=1.2.0";
import { engine } from "../engine.js?v=1.2.0";
import { save } from "../records.js?v=1.2.0";

const wizardTitles = [
  "About you",
  "Life situation",
  "Your goals",
  "What gets in the way?",
  "Your faith journey",
  "Your daily rhythm",
  "Money, privately",
  "Choose your pace",
];
function field(key, label, type = "text", p = session.draft, attrs = "") {
  return `<div><label for="wf-${key}">${t(label)}</label><input id="wf-${key}" type="${type}" data-draft="${key}" value="${esc(p[key])}" ${attrs}></div>`;
}
function selectField(key, label, values, labels = values) {
  return `<div><label for="wf-${key}">${t(label)}</label><select id="wf-${key}" data-draft="${key}">${options(values, session.draft[key], labels)}</select></div>`;
}
function checkList(key, values) {
  return `<div class="chipset">${values.map((v) => `<label class="check-label"><input type="checkbox" data-multi="${key}" value="${esc(v)}" ${session.draft[key].includes(v) ? "checked" : ""}>${t(v)}</label>`).join("")}</div>`;
}
function showWizard(step = 0) {
  session.draft = structuredClone(session.state.profile);
  session.draftDebts = structuredClone(session.state.debts);
  session.draftDebt = { name: "", total: "", paid: 0 };
  session.wizardStep = step;
  renderWizard();
  linkLabels($("#wizard"));
  $("#wizard").showModal();
}
function renderWizard() {
  if (session.wizardStep === 8) {
    $("#wizard").innerHTML =
      `<div class="dialog-inner wizard-finish"><div class="brandmark">${icon("leaf")}</div><div class="eyebrow">${t("Your plan is ready")}</div><h1 id="wizard-title" style="margin-top:13px">${t("Your small beginning starts here.")}</h1><p>${t("Nothing to catch up on. Just begin where you are.")}</p><button class="btn" data-action="finish-wizard">${t("Start my day")}${icon("arrow")}</button><div class="privacy">${t("Your data never leaves your phone.")}</div></div>`;
    return;
  }
  let body = "";
  switch (session.wizardStep) {
    case 0:
      body = `<div class="formgrid">${field("name", "Name", "text", session.draft, 'maxlength="80" autocomplete="given-name"')}${selectField("age", "Age range", ["", "Under 18", "18\u201324", "25\u201334", "35\u201344", "45\u201354", "55\u201364", "65+"], ["Prefer not to say", "Under 18", "18\u201324", "25\u201334", "35\u201344", "45\u201354", "55\u201364", "65+"])}${selectField("gender", "Gender", ["", "Female", "Male"], ["Prefer not to say", "Female", "Male"])}${selectField("language", "Language", ["en", "ar", "ur", "ml", "hi"], ["English", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", "\u0627\u0631\u062F\u0648", "മലയാളം", "हिन्दी"])}</div>${locationFields(session.draft, "draft")}<button class="linkbtn" data-action="geolocate">${t("Use my location")} \u2192</button><p class="subtle">${t("Location is used only for local prayer calculations.")}</p>`;
      break;
    case 1:
      body = `<div class="formgrid">${selectField("marital", "Marital status", ["Single", "Married"])}${selectField("work", "Work type", ["Employee", "Business owner", "Freelancer", "Student", "Job seeker", "Homemaker", "Retired"])}${field("kids", "Number of children", "number", session.draft, 'min="0" max="15"')}${field("childNames", "Children\u2019s names and ages", "text", session.draft, 'maxlength="500" placeholder="Amina:7, Yusuf:10"')}${field("workStart", "Work starts", "time")}${field("workEnd", "Work ends", "time")}</div>`;
      break;
    case 2:
      body = `${checkList("goals", CATEGORIES)}<div>${session.draft.goals.map((g, i) => `<div class="goals-rank"><strong>${i + 1}</strong><span>${t(g)}</span><button data-action="rank" data-id="${g}" data-value="-1" aria-label="${t("Move up")}" ${i === 0 ? "disabled" : ""}>\u2191</button><button data-action="rank" data-id="${g}" data-value="1" aria-label="${t("Move down")}" ${i === session.draft.goals.length - 1 ? "disabled" : ""}>\u2193</button></div><label>${t("Your goal")} \xB7 ${t(g)}</label><input data-goal="${g}" value="${esc(session.draft.goalText[g] || "")}" maxlength="250">`).join("")}</div>`;
      break;
    case 3:
      body = checkList("struggles", STRUGGLES);
      break;
    case 4:
      body = `<div class="formgrid">${selectField("prayers", "Five daily prayers", ["Always", "Sometimes", "Rarely"])}${selectField("quran", "Quran reading", ["Daily", "Weekly", "Rarely"])}</div><label>${t("I would like to start")}</label>${checkList("start", ["Tahajjud", "Quran memorization", "Sunnah fasting"])}<div class="formgrid">${selectField("method", "Calculation method", METHODS)}${selectField("madhab", "Asr madhab", ["Shafi", "Hanafi"])}</div><div class="notice">${t("Your journey, at your pace.")}</div>`;
      break;
    case 5:
      body = `<div class="formgrid">${field("wake", "Wake time", "time")}${field("sleep", "Sleep time", "time")}${selectField("focus", "Best focus time", ["Morning", "Evening"])}${selectField("exercise", "Exercise preference", ["Walk", "Gym", "Home workout", "Sport"])}</div>`;
      break;
    case 6:
      body = `<label class="check-label"><input type="checkbox" data-draft="hasDebts" ${session.draft.hasDebts ? "checked" : ""}>${t("I have debts")}</label>${session.draft.hasDebts ? `${session.draftDebts.map((d) => `<p class="subtle">${esc(d.name)} \xB7 ${money(d.paid)} / ${money(d.total)}</p>`).join("")}<label>${t("Debt name")}</label><input data-draft-debt="name" value="${esc(session.draftDebt.name)}" maxlength="80"><div class="formgrid"><div><label>${t("Total")}</label><input data-draft-debt="total" type="number" min="0" step="0.01" value="${esc(session.draftDebt.total)}"></div><div><label>${t("Already paid")}</label><input data-draft-debt="paid" type="number" min="0" step="0.01" value="${esc(session.draftDebt.paid)}"></div></div><button class="linkbtn" data-action="wizard-debt">${t("Add debt")} +</button>` : ""}${field("savings", "Monthly savings goal", "number", session.draft, 'min="0" step="0.01"')}<div class="privacy-box">${icon("lock")} ${t("Your data never leaves your phone.")}</div>`;
      break;
    case 7:
      body =
        ["Gentle start", "Balanced", "Full power"]
          .map(
            (v, i) =>
              `<button class="choice ${session.draft.commitment === v ? "selected" : ""}" data-action="commitment" data-id="${v}" aria-pressed="${session.draft.commitment === v}"><h3>${["\u{1F331}", "\u{1F33F}", "\u{1F333}"][i]} ${t(v)}</h3><p>${t(["3\u20135 habits \xB7 build your foundation", "8\u201312 habits \xB7 make room to grow", "15+ habits \xB7 a fuller daily rhythm"][i])}</p></button>`,
          )
          .join("") +
        `<p class="subtle">${session.lang === "ar" ? "\u0627\u0644\u0635\u0644\u0648\u0627\u062A \u0627\u0644\u062E\u0645\u0633 \u0645\u062C\u0645\u0648\u0639\u0629 \u0639\u0627\u062F\u0629 \u0648\u0627\u062D\u062F\u0629\u060C \u0628\u062E\u0645\u0633 \u062E\u0627\u0646\u0627\u062A \u0645\u0646\u0641\u0635\u0644\u0629." : session.lang === "ur" ? "\u067E\u0627\u0646\u0686 \u0646\u0645\u0627\u0632\u06CC\u06BA \u0627\u06CC\u06A9 \u0639\u0627\u062F\u062A \u06A9\u0627 \u06AF\u0631\u0648\u067E \u06C1\u06CC\u06BA\u060C \u062C\u0646 \u06A9\u06D2 \u067E\u0627\u0646\u0686 \u0627\u0644\u06AF \u062E\u0627\u0646\u06D2 \u06C1\u06CC\u06BA\u06D4" : session.lang === "ml" ? "അഞ്ച് നമസ്കാരങ്ങൾ അഞ്ച് പ്രത്യേക ചെക്ക്-ഇന്നുകളോടെ ഒരു ശീല ഗ്രൂപ്പായി കണക്കാക്കപ്പെടുന്നു." : session.lang === "hi" ? "पांचों नमाज़ों को एक आदत समूह माना जाता है, जिसमें पांच अलग-अलग चेक-इन होते हैं।" : "The five prayers count as one habit group, with five separate check-ins."}</p>`;
      break;
  }
  $("#wizard").innerHTML =
    `<div class="dialog-inner"><div class="wizard-top"><div class="brand wizard-brand" style="font-size:21px;margin:0"><span class="brandmark">${icon("mosque")}</span>Istiqamah</div><button class="linkbtn" data-action="skip-wizard">${t("Skip for now")}</button></div><div class="wizard-step">${session.wizardStep + 1} / 8 \xB7 ${t("At your own pace")}</div><div class="wizard-progress" style="margin-top:10px">${Array.from({ length: 8 }, (_, i) => `<i class="${i <= session.wizardStep ? "filled" : ""}"></i>`).join("")}</div><h1 id="wizard-title" style="font-size:26px">${t(wizardTitles[session.wizardStep])}</h1><p class="wizard-subtitle">${t(session.wizardStep === 3 ? "Nothing to catch up on. Just begin where you are." : "Your journey, at your pace.")}</p><div id="wizard-fields">${body}</div><div class="wizard-actions"><button class="btn secondary" data-action="wizard-back" ${session.wizardStep === 0 ? "disabled" : ""}>${t("Back")}</button><button class="btn" data-action="wizard-next">${t(session.wizardStep === 7 ? "Create my plan" : "Continue")}${icon("arrow")}</button></div><div class="privacy">${t("Your data never leaves your phone.")}<br>${t("No ads. No trackers. No account.")}</div></div>`;
  linkLabels($("#wizard"));
}
function addWizardDebt() {
  let total = +session.draftDebt.total,
    paid = +session.draftDebt.paid;
  if (
    !session.draftDebt.name.trim() ||
    !Number.isFinite(total) ||
    total <= 0 ||
    paid < 0 ||
    paid > total
  ) {
    toast("Enter a debt name and a valid total and payment.");
    return false;
  }
  session.draftDebts.push({
    id: uid(),
    name: session.draftDebt.name.trim(),
    total,
    paid,
    payments: paid ? [{ date: today(), amount: paid }] : [],
  });
  session.draftDebt = { name: "", total: "", paid: 0 };
  return true;
}
function validateDraft() {
  for (let el of $$("#wizard input"))
    if (!el.checkValidity()) {
      el.reportValidity();
      return false;
    }
  try {
    new Intl.DateTimeFormat("en", { timeZone: session.draft.tz }).format();
  } catch {
    toast("Choose a valid IANA time zone, e.g. Asia/Dubai.");
    return false;
  }
  return true;
}
function finishPlan() {
  if (session.draft.hasDebts && session.draftDebt.name) {
    if (!addWizardDebt()) return;
  }
  session.state.debts = session.draftDebts;
  const existing = session.state.onboarded;
  session.state.profile = {
    ...session.draft,
    kids: Math.min(15, Math.max(0, +session.draft.kids || 0)),
    savings: Math.max(0, +session.draft.savings || 0),
  };
  session.lang = session.state.profile.language;
  session.state.habits = engine.generate(session.state.profile).habits;
  let names = session.draft.childNames
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  session.state.children = Array.from(
    { length: session.state.profile.kids },
    (_, i) => {
      let [name, age] = String(names[i] || "").split(":");
      let old = session.state.children[i];
      return {
        ...old,
        id: old?.id || uid(),
        name: name || `${t("Family")} ${i + 1}`,
        age: age || "",
        reward: old?.reward || "",
      };
    },
  );
  session.state.onboarded = true;
  if (session.state.days[today()])
    session.state.days[today()].snapshot = session.state.habits.map((h) => ({
      ...h,
    }));
  save();
  session.selectedDate = today();
  session.month = today().slice(0, 7);
  if (existing) toast("Saved");
  render();
  session.wizardStep = 8;
  renderWizard();
}
async function geolocate(target) {
  if (!navigator.geolocation)
    return toast("Location is unavailable. Enter coordinates manually.");
  toast("Requesting your location\u2026");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      let p = target === "draft" ? session.draft : session.state.profile;
      p.lat = +pos.coords.latitude.toFixed(5);
      p.lon = +pos.coords.longitude.toFixed(5);
      p.tz = timezone();
      if (target === "draft") renderWizard();
      else {
        save();
        render();
      }
      toast("Saved");
    },
    () =>
      toast("Location was not available. Select a city or enter coordinates."),
    { timeout: 12e3, maximumAge: 3e5 },
  );
}
function updateProfile(key, value, p) {
  if (["lat", "lon", "savings", "kids"].includes(key) && value !== "")
    value = +value;
  if (key === "tz") {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value }).format();
    } catch {
      return false;
    }
  }
  if (
    key === "lat" &&
    value !== "" &&
    (!Number.isFinite(value) || Math.abs(value) > 90)
  )
    return false;
  if (
    key === "lon" &&
    value !== "" &&
    (!Number.isFinite(value) || Math.abs(value) > 180)
  )
    return false;
  p[key] = value;
  if (key === "city") {
    let match = Object.keys(CITY).find(
      (k) => k.toLowerCase() === String(value).trim().toLowerCase(),
    );
    if (match) {
      let [lat, lon, tz, country, method] = CITY[match];
      Object.assign(p, { city: match, lat, lon, tz, country, method });
    }
  }
  if (key === "country") {
    let methods = {
      "Saudi Arabia": "UmmAlQura",
      "United Arab Emirates": "Dubai",
      Pakistan: "Karachi",
      Bangladesh: "Karachi",
      India: "Karachi",
      Egypt: "Egyptian",
      "United States": "NorthAmerica",
      Canada: "NorthAmerica",
      "T\xFCrkiye": "Turkey",
      Malaysia: "Singapore",
    };
    if (methods[value]) p.method = methods[value];
  }
  return true;
}

export {
  wizardTitles,
  field,
  selectField,
  checkList,
  showWizard,
  renderWizard,
  addWizardDebt,
  validateDraft,
  finishPlan,
  geolocate,
  updateProfile,
};
