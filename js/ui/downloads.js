import { t } from "../i18n.js";
import { esc, toast } from "../utils.js";
import {
  OPTIONAL_SOURCES,
  downloadOptional,
  loadOptionalAdhkar,
  removeOptional,
} from "../optional-content.js";
import { render } from "./core.js";
export function optionalControls() {
  return `<section class="card"><h2>${t("Optional downloads")}</h2><p>${t("These sources have no explicit license. They are not bundled. Download only if their terms permit your use. GitHub receives your network address.")}</p>
  <div class="stack section-gap">${Object.entries(OPTIONAL_SOURCES)
    .map(
      ([id, source]) =>
        `<div><p dir="ltr"><a href="${source.url}" rel="noopener noreferrer" target="_blank">${esc(source.credit)}</a></p><button class="btn secondary" data-action="download-optional" data-id="${id}">${t("Download")} · ${id === "azkar" ? "Azkar DB" : id === "makkah" ? "Makkah" : "Mishary Alafasi"}</button></div>`,
    )
    .join("")}
  <button class="btn secondary" data-action="remove-optional">${t("Remove optional downloads")}</button><small>${t("Saved counters remain. Downloads are kept on this device for offline use.")}</small></div></section>`;
}
export async function installOptional(id, button) {
  button.disabled = true;
  try {
    await downloadOptional(id);
    if (id === "azkar") await loadOptionalAdhkar();
    render();
    toast("Download saved for offline use.");
  } catch {
    toast("Download unavailable. Please try again.");
  } finally {
    button.disabled = false;
  }
}
export async function deleteOptional() {
  try {
    await removeOptional();
    render();
    toast("Saved");
  } catch {
    toast("Download unavailable. Please try again.");
  }
}
