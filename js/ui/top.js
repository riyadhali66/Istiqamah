import { t } from "../i18n.js?v=2.1.0";
import { session } from "../session.js?v=2.1.0";
import { icon } from "../utils.js?v=2.1.0";

function view_top() {
  return `<header class="topbar"><div class="breadcrumb"><span class="muted">${t("Your daily companion")}</span><span>\uFF0F</span><span>${t({ today: "Today", progress: "Progress", tools: "My toolkit", reflections: "Reflections", settings: "Settings" }[session.page])}</span></div><div class="brand mobile-brand"><span class="brandmark">${icon("mosque")}</span>Istiqamah</div><div class="top-actions"><span class="today-label eyebrow">${t("One small step, a little closer.")}</span><button class="iconbtn" data-action="theme" aria-label="${t("Theme")}">${icon(session.state.settings.theme === "dark" ? "sun" : "moon")}</button><button class="iconbtn" data-action="notifications" aria-label="${t("Enable reminders")}">${icon("bell")}</button></div></header>`;
}
export { view_top };
