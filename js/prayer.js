import { session } from "./session.js?v=2.1.0";
import { dateObj, offsetDay, today } from "./dates.js?v=2.1.0";
import { timezone } from "./config.js?v=2.1.0";
import { $, toast } from "./utils.js?v=2.1.0";
import { t } from "./i18n.js?v=2.1.0";
import { playAdhan } from "./reminders.js?v=2.1.0";

const prayerService = {
  calculate(key) {
    const p = session.state.profile;
    if (p.lat === "" || p.lon === "" || !window.adhan) return [];
    try {
      const params = (
        adhan.CalculationMethod[p.method] ||
        adhan.CalculationMethod.MuslimWorldLeague
      )();
      params.madhab =
        p.madhab === "Hanafi" ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
      const times = new adhan.PrayerTimes(
        new adhan.Coordinates(+p.lat, +p.lon),
        dateObj(key),
        params,
      );
      return ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        .map((n) => ({ name: n, date: times[n.toLowerCase()] }))
        .filter((a) => Number.isFinite(a.date.getTime()));
    } catch {
      return [];
    }
  },
  format(date) {
    return new Intl.DateTimeFormat(session.lang, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: session.state.profile.tz || timezone(),
    }).format(date);
  },
  next() {
    let now = Date.now();
    return [
      ...this.calculate(today()),
      ...this.calculate(offsetDay(today(), 1)),
    ].find((p) => p.date.getTime() > now);
  },
  tick() {
    const p = this.next();
    const el = $("#prayer-countdown");
    if (el) {
      if (p) {
        let s = Math.max(0, Math.floor((p.date - Date.now()) / 1e3));
        el.textContent =
          t(p.name) +
          " \xB7 " +
          [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60]
            .map((n) => String(n).padStart(2, "0"))
            .join(":");
      } else el.textContent = t("Set your location");
    }
    if (p && session.state.settings.reminders) {
      const previous = this.calculate(today()).find(
        (a) => Math.abs(a.date - Date.now()) < 15e3,
      );
      if (previous && this.last !== previous.date.toISOString()) {
        this.last = previous.date.toISOString();
        toast(t(previous.name));
        if ("Notification" in window && Notification.permission === "granted")
          new Notification("Istiqamah", {
            body: t(previous.name),
            icon: "icon-192.png",
          });
        playAdhan();
      }
    }
  },
};

export { prayerService };
