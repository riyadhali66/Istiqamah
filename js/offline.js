import { t } from "./i18n.js?v=1.2.0";
import { $, toast } from "./utils.js?v=1.2.0";
import { session } from "./session.js?v=1.2.0";

function updateOfflineStatus() {
  const el = $("#offline-status");
  if (el)
    el.textContent = t(
      location.protocol === "file:"
        ? "Offline installation requires HTTPS or localhost."
        : session.offlineReady
          ? "Offline app cached."
          : "Offline cache is preparing; keep this page open briefly.",
    );
}
async function registerWorker() {
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    try {
      const registration = await navigator.serviceWorker.register(
        "./sw.js?v=1.2.0",
        {
          updateViaCache: "none",
        },
      );
      registration.update().catch(() => {});
      await navigator.serviceWorker.ready;
      session.offlineReady = true;
      updateOfflineStatus();
    } catch {
      toast(
        "Offline cache could not be installed. The app can still save entries.",
      );
    }
  }
}

export { updateOfflineStatus, registerWorker };
