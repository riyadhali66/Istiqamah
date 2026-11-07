import { backupControls } from "./backups.js";
import { optionalControls } from "./downloads.js";
import { session } from "../session.js";
import { t } from "../i18n.js";
import { esc, icon } from "../utils.js";
import { locationFields, options } from "./core.js";
import { CATEGORIES, METHODS } from "../config.js";

function view_settings() {
  const p = session.state.profile;
  return (
    this.heading(t("Settings"), "Your journey, at your pace.") +
    `<div class="grid"><div class="stack"><section class="card"><div class="cardhead"><h2>${t("Your personal information")}</h2><button class="linkbtn" data-action="onboarding">${t("Redo onboarding")}</button></div><div class="formgrid"><div><label>${t("Name")}</label><input data-profile="name" maxlength="80" value="${esc(p.name)}"></div><div><label>${t("Language")}</label><select data-profile="language">${options(["en", "ar", "ur", "ml", "hi"], p.language, ["English", "\u0627\u0644\u0639\u0631\u0628\u064A\u0629", "\u0627\u0631\u062F\u0648", "മലയാളം", "हिन्दी"])}</select></div><div><label>${t("Theme")}</label><select id="theme-select">${options(["light", "dark"], session.state.settings.theme, ["Light", "Dark"])}</select></div><div><label>${t("Gender")}</label><select data-profile="gender">${options(["", "Female", "Male"], p.gender, ["Prefer not to say", "Female", "Male"])}</select></div></div><h3 class="section-gap">${t("Your goals")}</h3>${p.goals.map((c, i) => `<div class="goals-rank"><strong>${i + 1}</strong><span>${t(c)}${p.goalText[c] ? '<small style="display:block">' + esc(p.goalText[c]) + "</small>" : ""}</span></div>`).join("")}</section><section class="card"><div class="cardhead"><h2>${t("Prayer times")}</h2><button class="linkbtn" data-action="settings-geolocate">${t("Use my location")}</button></div>${locationFields(p, "profile")}<div class="formgrid"><div><label>${t("Calculation method")}</label><select data-profile="method">${options(METHODS, p.method)}</select></div><div><label>${t("Asr madhab")}</label><select data-profile="madhab">${options(["Shafi", "Hanafi"], p.madhab)}</select></div></div><div class="notice">${t("Location is used only for local prayer calculations.")}</div></section><section class="card"><div class="cardhead"><h2>${t("Manage habits")}</h2><span class="badge">${session.state.habits.length}</span></div><small>${session.lang === "ar" ? "\u062A\u064F\u062D\u0641\u0638 \u0627\u0644\u0623\u064A\u0627\u0645 \u0627\u0644\u0633\u0627\u0628\u0642\u0629 \u0643\u0645\u0627 \u0647\u064A. \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A \u062A\u0637\u0628\u0642 \u0639\u0644\u0649 \u0627\u0644\u064A\u0648\u0645 \u0648\u0627\u0644\u0623\u064A\u0627\u0645 \u0627\u0644\u0642\u0627\u062F\u0645\u0629." : session.lang === "ur" ? "\u067E\u0686\u06BE\u0644\u06D2 \u062F\u0646\u0648\u06BA \u06A9\u0627 \u0631\u06CC\u06A9\u0627\u0631\u0688 \u0645\u062D\u0641\u0648\u0638 \u0631\u06C1\u062A\u0627 \u06C1\u06D2\u06D4 \u062A\u0628\u062F\u06CC\u0644\u06CC\u0627\u06BA \u0622\u062C \u0627\u0648\u0631 \u0622\u0626\u0646\u062F\u06C1 \u06A9\u06D2 \u0644\u06CC\u06D2 \u06C1\u06CC\u06BA\u06D4" : "Past records keep their original habits. Changes apply to today and future days."}</small>${session.state.habits.map((h, i) => `<div class="edit-row"><div class="reorder"><button data-action="move-habit" data-id="${esc(h.id)}" data-value="-1" aria-label="${t("Move up")}" ${i === 0 ? "disabled" : ""}>\u2191</button><button data-action="move-habit" data-id="${esc(h.id)}" data-value="1" aria-label="${t("Move down")}" ${i === session.state.habits.length - 1 ? "disabled" : ""}>\u2193</button></div><input data-edit-habit="${esc(h.id)}" data-key="label" aria-label="${t("Habit name")}" value="${esc(t(h.label))}" maxlength="120"><input type="number" min="1" max="1000000" data-edit-habit="${esc(h.id)}" data-key="target" aria-label="${t("Target")}" value="${h.target}"><button class="smallbtn" data-action="remove-habit" data-id="${esc(h.id)}" aria-label="${t("Remove")}">\xD7</button></div>`).join("")}<form id="habit-form"><h3 class="section-gap">${t("Add habit")}</h3><label>${t("Habit name")}</label><input name="label" required maxlength="120"><div class="formgrid"><div><label>${t("Category")}</label><select name="category">${options(CATEGORIES, "Skills")}</select></div><div><label>${t("Target")}</label><input type="number" name="target" min="1" max="1000000" value="1" required></div><div><label>${t("Unit")}</label><input name="unit" maxlength="30"></div></div><button class="btn section-gap">${icon("plus")}${t("Add habit")}</button></form></section></div><div class="stack">${optionalControls()}<section class="card"><h2>${t("Adhan sound")}</h2><label>${t("Adhan sound")}</label><select id="sound-select">${options(["silent", "makkah", "mishary"], session.state.settings.sound, ["Silent", "Makkah \xB7 Athan-MP3", "Mishary Alafasi \xB7 Athan-MP3"])}</select><div class="row wrap section-gap"><button class="btn secondary" data-action="test-sound">${t("Test sound")}</button><button class="linkbtn" data-action="notifications">${t("Enable reminders")}</button></div><p class="subtle section-gap">${session.lang === "ar" ? "\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u062A\u0639\u0645\u0644 \u0623\u062B\u0646\u0627\u0621 \u0641\u062A\u062D \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0641\u0642\u0637. \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u062A\u0642\u0648\u064A\u0645 \u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645." : session.lang === "ur" ? "\u06CC\u0627\u062F \u062F\u06C1\u0627\u0646\u06CC\u0627\u06BA \u0635\u0631\u0641 \u0627\u06CC\u067E \u06A9\u06BE\u0644\u06CC \u06C1\u0648\u0646\u06D2 \u067E\u0631 \u06A9\u0627\u0645 \u06A9\u0631\u062A\u06CC \u06C1\u06CC\u06BA\u06D4 \u0646\u0638\u0627\u0645 \u06A9\u06CC \u06CC\u0627\u062F \u062F\u06C1\u0627\u0646\u06CC\u0648\u06BA \u06A9\u06D2 \u0644\u06CC\u06D2 \u06A9\u06CC\u0644\u0646\u0688\u0631 \u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u06A9\u0631\u06CC\u06BA\u06D4" : "Reminders work while the app is open. Use calendar export for system reminders. Audio may require an initial tap; silent is the default."}</p></section><section class="card"><h2>${t("Export calendar")}</h2><div class="stack section-gap"><button class="btn secondary" data-action="export-day">${t("Today")}</button><button class="btn secondary" data-action="export-week">${t("Export this week")}</button><button class="btn secondary" data-action="schedule">${t("Edit plan")}</button></div></section><section class="card"><h2>${t("Data & privacy")}</h2><div class="privacy-box">${icon("lock")}<h3>${t("Your data never leaves your phone.")}</h3><p class="subtle section-gap">${t("No ads. No trackers. No account.")}</p><p class="subtle">${t("Personal entries stay local. Optional audio and content requests reveal your network address to the provider. Local records and plain exports are unencrypted; anyone with access to this browser profile can view its records. Clearing browser data removes local records.")}</p></div><div class="stack section-gap"><button class="btn secondary" data-action="backup">${icon("download")}${t("Export backup")}</button>${backupControls()}<label class="btn secondary" style="margin:0">${t("Import backup")}<input type="file" accept="application/json,.json" id="import-file" class="sr-only"></label><button class="btn secondary" data-action="print">${icon("print")}${t("Print / Save as PDF")}</button><button class="btn danger" data-action="reset-plan">${t("Reset plan")}</button></div></section><section class="card"><h2>${t("Install app")}</h2><p class="subtle section-gap">${session.lang === "ar" ? "\u0627\u0641\u062A\u062D \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0639\u0628\u0631 HTTPS. \u0641\u064A \u0623\u0646\u062F\u0631\u0648\u064A\u062F: \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062A\u0637\u0628\u064A\u0642. \u0641\u064A \u0633\u0641\u0627\u0631\u064A: \u0645\u0634\u0627\u0631\u0643\u0629 \u2190 \u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0634\u0627\u0634\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629." : session.lang === "ur" ? "HTTPS \u067E\u0631 \u06A9\u06BE\u0648\u0644\u06CC\u06BA\u06D4 \u0627\u06CC\u0646\u0688\u0631\u0627\u0626\u06CC\u0688: \u0627\u06CC\u067E \u0627\u0646\u0633\u0679\u0627\u0644 \u06A9\u0631\u06CC\u06BA\u06D4 \u0633\u0641\u0627\u0631\u06CC: \u0634\u06CC\u0626\u0631 \u2190 \u06C1\u0648\u0645 \u0627\u0633\u06A9\u0631\u06CC\u0646 \u0645\u06CC\u06BA \u0634\u0627\u0645\u0644 \u06A9\u0631\u06CC\u06BA\u06D4" : session.lang === "ml" ? "HTTPS വഴി തുറക്കുക. ആൻഡ്രോയിഡ്: ബ്രൗസർ മെനുവിൽ നിന്ന് ആപ്പ് ഇൻസ്റ്റാൾ ചെയ്യുക. ഐഫോൺ: സഫാരി → ഷെയർ → ഹോം സ്ക്രീനിലേക്ക് ചേർക്കുക. ഓഫ്‌ലൈൻ ആപ്പ് സംരക്ഷിക്കാൻ ഒരിക്കൽ ഓൺലൈനായി തുറക്കുക." : session.lang === "hi" ? "HTTPS पर खोलें। एंड्रॉइड: ब्राउज़र मेनू से ऐप इंस्टॉल करें। आईफ़ोन: सफ़ारी → शेयर → होम स्क्रीन पर जोड़ें। ऑफ़लाइन ऐप सहेजने के लिए एक बार ऑनलाइन खोलें।" : "Open over HTTPS. Android: Install app from the browser menu. iPhone: Safari \u2192 Share \u2192 Add to Home Screen. Open once online to save the offline app."}</p><button class="linkbtn" data-action="install">${t("Install app")} \u2192</button><p class="installed-label" id="offline-status"></p><button class="linkbtn" data-action="check-updates">${t("Check for updates")}</button></section><section class="card credits-list"><h2>${t("About & Credits")}</h2><p>Istiqamah 1.1.0-phase1 \xB7 ${t("Small deeds. Every day. Limitless results.")}</p>${[
      ["Adhan JS 4.4.3", "https://github.com/batoulapps/adhan-js", "MIT"],
      [
        "arabic-core 0.1.1",
        "https://github.com/getkirnu/arabic-core",
        "MIT \xB7 ICU calendar: Unicode-3.0",
      ],
      ["Chart.js 4.4.8", "https://www.chartjs.org", "MIT"],
      [
        "Azkar DB",
        "https://github.com/osamayy/azkar-db",
        "No license declared upstream; source attribution retained",
      ],
      [
        "Quran API",
        "https://github.com/fawazahmed0/quran-api",
        "The Unlicense \xB7 translations retain source attribution",
      ],
      [
        "Hadith API",
        "https://github.com/fawazahmed0/hadith-api",
        "The Unlicense \xB7 grading retained verbatim",
      ],
      [
        "Names of Allah JSON",
        "https://github.com/rn0x/Names_Of_Allah_Json",
        "MIT \xB7 original Arabic meanings",
      ],
      [
        "EveryAyah audio",
        "https://everyayah.com",
        "External streaming; provider terms",
      ],
      [
        "Athan-MP3",
        "https://github.com/abodehq/Athan-MP3",
        "No license declared upstream; source attribution retained",
      ],
      [
        "Inter / Amiri",
        "https://github.com/fontsource/fontsource",
        "SIL Open Font License 1.1",
      ],
    ]
      .map(
        ([n, u, l]) =>
          `<p><a href="${u}" target="_blank" rel="noopener noreferrer">${n}</a><br><small>${l}</small></p>`,
      )
      .join("")}</section></div></div>`
  );
}
export { view_settings };
