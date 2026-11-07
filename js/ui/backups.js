import { session } from "../session.js";
import { storage, migrate, validate } from "../storage.js";
import { snapshots } from "../snapshots.js";
import { encryptBackup, decryptBackup, isEncrypted } from "../backup-crypto.js";
import { $, esc, download, toast } from "../utils.js";
import { modal, render } from "./core.js";
import { t, loadTranslations } from "../i18n.js";
import { today } from "../dates.js";
let pending,
  encryptedFile,
  choices = [];
export function backupControls() {
  return `<button class="btn secondary" data-action="encrypted-backup">${t("Export encrypted backup")}</button>
    <button class="btn secondary" data-action="restore-days">${t("Restore a previous day")}</button>
    <button class="btn secondary" data-action="export-original">${t("Export original saved data")}</button>
    <small>${t("Local safety copies are unencrypted. Keep private exports safe. The last 7 active days are kept.")}</small>`;
}
export function showEncryptedExport() {
  modal(
    "Export encrypted backup",
    `<form id="encrypted-export-form"><p>${t("Use at least 12 characters. Keep your passphrase safe; it cannot be recovered.")}</p>
    <label for="export-passphrase">${t("Passphrase")}</label><input id="export-passphrase" type="password" autocomplete="new-password" minlength="12" required>
    <label for="export-passphrase-confirm">${t("Repeat passphrase")}</label><input id="export-passphrase-confirm" type="password" autocomplete="new-password" minlength="12" required>
    <button class="btn section-gap">${t("Export encrypted backup")}</button></form>`,
  );
}
export function confirmImport(incoming) {
  if (!validate(incoming)) throw new Error("Invalid backup");
  pending = incoming;
  modal(
    "Import backup",
    `<p>${t("This replaces current records. A local undo copy will be saved first.")}</p><div class="row wrap section-gap"><button class="btn secondary" data-action="backup">${t("Export backup")}</button><button class="btn" id="confirm-import">${t("Import backup")}</button></div>`,
  );
}
export async function handleBackupFile(file) {
  if (!file) return;
  if (file.size > 15 * 1024 * 1024)
    return toast("Backup is too large (maximum 15 MB).");
  try {
    const incoming = JSON.parse(await file.text());
    if (isEncrypted(incoming)) {
      encryptedFile = incoming;
      modal(
        "Import backup",
        `<form id="decrypt-backup-form"><label for="import-passphrase">${t("Passphrase")}</label><input id="import-passphrase" type="password" autocomplete="current-password" required><button class="btn section-gap">${t("Unlock backup")}</button></form>`,
      );
    } else confirmImport(incoming);
  } catch {
    toast("This file is not a valid Istiqamah backup.");
  }
}
export async function showRestoreDays() {
  try {
    await storage.snapshot();
    const daily = await snapshots.list(),
      checkpoints = await snapshots.checkpoints();
    choices = [
      ...daily.map((row) => ({ ...row, label: row.date })),
      ...checkpoints.map((row) => ({
        ...row,
        label: t("Before replacement") + " · " + row.savedAt,
      })),
    ];
    const original = localStorage.getItem(storage.migrationKey);
    if (original)
      choices.push({ label: t("Before migration"), data: original });
    modal(
      "Restore a previous day",
      `<p>${t("Choose a copy, then confirm before replacing your records.")}</p><div class="stack section-gap">${choices.map((row, index) => `<button class="btn secondary" data-action="choose-snapshot" data-id="${index}">${esc(row.label)}</button>`).join("") || `<p>${t("No safety copies yet. Copies are saved on days you use the app.")}</p>`}</div>`,
    );
  } catch {
    toast("Safety copies are unavailable. Export a file backup.");
  }
}
export function chooseSnapshot(index) {
  try {
    confirmImport(JSON.parse(choices[index].data));
  } catch {
    toast("This file is not a valid Istiqamah backup.");
  }
}
async function restorePending(button) {
  if (!pending) return;
  button.disabled = true;
  try {
    await storage.replace(pending);
    pending = null;
    session.lang = session.state.profile.language;
    await loadTranslations(session.lang);
    session.selectedDate = today();
    session.month = today().slice(0, 7);
    $("#modal").close();
    render();
    toast("Saved");
  } catch {
    toast("Restore could not be saved. Current records were kept.");
  } finally {
    button.disabled = false;
  }
}
// Passphrases stay in the form and function scope, and are cleared immediately after use.
document.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!["encrypted-export-form", "decrypt-backup-form"].includes(form.id))
    return;
  event.preventDefault();
  const button = form.querySelector("button");
  button.disabled = true;
  try {
    if (form.id === "encrypted-export-form") {
      const passphrase = $("#export-passphrase").value;
      if (passphrase !== $("#export-passphrase-confirm").value)
        return toast("Passphrases do not match.");
      const envelope = await encryptBackup(session.state, passphrase);
      form.reset();
      download(
        "istiqamah-encrypted-" + today() + ".json",
        JSON.stringify(envelope),
        "application/json",
      );
      $("#modal").close();
    } else {
      const value = await decryptBackup(
        encryptedFile,
        $("#import-passphrase").value,
      );
      form.reset();
      encryptedFile = null;
      confirmImport(value);
    }
  } catch {
    toast(
      form.id === "decrypt-backup-form"
        ? "Could not unlock backup. Check the passphrase and file."
        : "Encryption unavailable. Use HTTPS or localhost.",
    );
  } finally {
    button.disabled = false;
  }
});
document.addEventListener("click", (event) => {
  if (event.target.id === "confirm-import") restorePending(event.target);
  if (event.target.closest('[data-action="close-modal"]')) {
    pending = null;
    encryptedFile = null;
  }
});

function clearPendingBackup() {
  pending = null;
  encryptedFile = null;
  document
    .querySelectorAll('#modal input[type="password"]')
    .forEach((input) => {
      input.value = "";
    });
}
document.querySelector("#modal").addEventListener("close", clearPendingBackup);
