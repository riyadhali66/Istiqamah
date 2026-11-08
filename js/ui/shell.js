import { session } from "../session.js?v=2.1.0";
import { $, esc, icon } from "../utils.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";

function view_shell() {
  const p = session.state.profile;
  $("#sidebar").innerHTML =
    `<div class="brand"><span class="brandmark">${icon("mosque")}</span><div>Istiqamah<small>${t("Your daily companion")}</small></div></div><nav aria-label="${t("Your daily companion")}">${[
      ["today", "home", "Today"],
      ["progress", "chart", "Progress"],
      ["tools", "grid", "My toolkit"],
      ["reflections", "book", "Reflections"],
      ["settings", "settings", "Settings"],
    ]
      .map(
        ([id, i, label]) =>
          `<button class="navbtn ${session.page === id ? "active" : ""}" data-action="nav" data-id="${id}" ${session.page === id ? 'aria-current="page"' : ""} title="${t(label)}">${icon(i)}<span>${t(label)}</span></button>`,
      )
      .join(
        "",
      )}</nav><div class="side-note">${icon("leaf")}<p>${t("Small deeds. Every day. Limitless results.")}</p></div><div class="profile"><div class="avatar">${esc((p.name || "I").slice(0, 1).toUpperCase())}</div><div><h3>${esc(p.name || t("Your journey, at your pace."))}</h3><small>${t("At your own pace")}</small></div></div>`;
}
export { view_shell };
