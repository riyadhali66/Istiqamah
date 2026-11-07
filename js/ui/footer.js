import { t } from "../i18n.js?v=1.2.0";
import { icon } from "../utils.js?v=1.2.0";

function view_footer() {
  return `<footer class="footer"><span>${t("Small deeds. Every day. Limitless results.")}</span><span>${icon("lock").replace('class="icon"', 'class="icon" style="width:10px;height:10px;vertical-align:middle"')} ${t("Saved on this device")} \xB7 <button data-action="nav" data-id="settings">${t("Privacy")}</button></span></footer>`;
}
export { view_footer };
