import { t } from "../i18n.js?v=2.1.0";

function view_heading(title, sub, extra = "") {
  return `<div class="page-heading"><div><h1>${title}</h1><p>${t(sub)}</p></div>${extra}</div>`;
}
export { view_heading };
