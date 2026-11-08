import { dayDiff, dateKey, validDate } from "./phase2-state.js?v=2.1.0";
import { renderRamadanBanner, renderRamadanDashboard, renderRamadanSettings } from "./ui/ramadan.js?v=2.1.0";
export let ramadanService;
export function initRamadan(ctx) {
  const { getState, getDay, today, offsetDay, dateObj, prayerService, hijriService, t, esc, icon, save, render, toast } = ctx;
  const state = () => getState();
  const config = () => state().phase2.ramadan;
  const dhikrConfig = () => state().phase2.adhkar;
  const label = (entry) => t(entry.categoryLabel);
  const ramadan = {
    season(key) {
      const cfg = config(), h = hijriService.get(key);
      if (!h) return null;
      const original = dateKey(ArabicCore.hijriToGregorian({ year: h.year, month: 9, day: 1 }));
      const next = dateKey(ArabicCore.hijriToGregorian({ year: h.year, month: 10, day: 1 }));
      const start = cfg.startDate || original, length = cfg.startDate ? cfg.length : dayDiff(original, next), day = dayDiff(start, key) + 1;
      return { startDate: start, originalStart: original, length, day, inRamadan: day >= 1 && day <= length, manual: !!cfg.startDate, adjustment: dayDiff(original, start) };
    },
    target(key) {
      const p = config().quran;
      if (!p.enabled) return config().dailyPages;
      if (!p.deadline || !p.setOn || key < p.setOn || key > p.deadline) return 0;
      const read = Object.entries(state().days).filter(([k]) => k >= p.setOn && k < key).reduce((sum, [, d]) => sum + (Number(d.values?.["ramadan-quran"]) || 0), 0);
      return Math.max(0, Math.ceil(Math.max(0, p.pages - read) / (dayDiff(key, p.deadline) + 1)));
    },
    snapshot(key) {
      const cfg = config(), target = this.target(key), h = (id, label2, category = "Faith", extra = {}) => ({ id: "ramadan-" + id, label: label2, category, target: 1, unit: "", weight: 1, ramadan: true, ...extra });
      return [h("fasting", "Daily fasting", "Faith", { fasting: true }), ...target > 0 ? [h("quran", "Ramadan Quran", "Faith", { target, unit: "pages" })] : [], ...Object.entries(cfg.goals).filter(([, v]) => v).map(([id]) => h(id, { taraweeh: "Taraweeh", charity: "Charity", adhkar: "Adhkar", family: "Family time" }[id], id === "family" ? "Family" : "Faith"))];
    },
    ensure(key, refresh = false) {
      const info = this.season(key);
      if (!config().enabled || !info?.inRamadan) return;
      const d = getDay(key);
      if (!d.ramadan) {
        d.ramadan = { active: true, startDate: info.startDate, originalStart: info.originalStart, calendarSource: info.manual ? "local" : "ummalqura", length: info.length, day: info.day, fasting: "untracked", reason: "", snapshot: this.snapshot(key) };
        save();
      } else if (key === today() && (refresh || !d.ramadan.active)) {
        d.ramadan.active = true;
        if (refresh) {
          Object.assign(d.ramadan, { startDate: info.startDate, originalStart: info.originalStart, calendarSource: info.manual ? "local" : "ummalqura", length: info.length, day: info.day, snapshot: this.snapshot(key) });
        }
        save();
      }
    },
    enabled(key) {
      const d = state().days[key];
      return !!d?.ramadan?.active && (key !== today() || config().enabled);
    },
    merge(key, base) {
      if (!this.enabled(key)) return base;
      const r = state().days[key].ramadan, ids = new Set(r.snapshot.map((h) => h.id));
      return base.filter((h) => h.id !== "fast-plan" && !(ids.has("ramadan-quran") && h.id === "quran") && !(ids.has("ramadan-adhkar") && ["adhkar-am", "adhkar-pm"].includes(h.id)) && !(ids.has("ramadan-family") && h.id === "family")).concat(r.snapshot);
    },
    paused(h, d) {
      const r = d?.ramadan;
      if (!r) return false;
      return r.fasting === "paused" && h.ramadan || h.fasting && ["not-fasting", "paused"].includes(r.fasting);
    },
    setEnabled(value) {
      config().enabled = value;
      const d = state().days[today()];
      if (value) this.ensure(today());
      else if (d?.ramadan) d.ramadan.active = false;
      save();
    },
    setFasting(key, status) {
      this.ensure(key);
      const d = getDay(key);
      if (!d.ramadan) return;
      d.ramadan.fasting = status;
      d.fasted = status === "fasted";
      d.values["ramadan-fasting"] = status === "fasted" ? 1 : 0;
      save();
    },
    schedule(key) {
      if (!this.enabled(key) && !(config().enabled && this.season(key)?.inRamadan)) return [];
      const p = prayerService.calculate(key), cfg = config();
      return [["Fajr", "Suhoor preparation", cfg.suhoorMinutes], ["Maghrib", "Iftar preparation", cfg.iftarMinutes]].flatMap(([name, label2, minutes]) => {
        const prayer = p.find((p2) => p2.name === name);
        if (!prayer) return [];
        const date = new Date(+prayer.date - minutes * 6e4);
        return [{ id: "ramadan-" + name.toLowerCase() + "-prep", label: label2, note: "Personal preparation reminder", time: ctx.clock(date), instant: date.toISOString(), ramadanPrep: true }];
      });
    },
    next(key = today(), now = /* @__PURE__ */ new Date()) {
      if (!this.season(key)?.inRamadan) return null;
      const prayers = prayerService.calculate(key).filter((p) => ["Fajr", "Maghrib"].includes(p.name));
      const next = prayers.find((p) => +p.date > +now);
      if (next) return next;
      const tomorrow = offsetDay(key, 1);
      if (!this.season(tomorrow)?.inRamadan) return null;
      return prayerService.calculate(tomorrow).find((p) => p.name === "Fajr") || null;
    },
    tick() {
      const el = document.querySelector("#ramadan-countdown");
      if (!el) return;
      const next = this.next();
      if (!next) {
        el.textContent = t("No upcoming Ramadan countdown");
        return;
      }
      const seconds = Math.max(0, Math.floor((+next.date - Date.now()) / 1e3));
      el.textContent = t("Until") + " " + t(next.name) + " \xB7 " + [Math.floor(seconds / 3600), Math.floor(seconds % 3600 / 60), seconds % 60].map((n) => String(n).padStart(2, "0")).join(":");
    },
    apply(form) {
      const data = new FormData(form), cfg = config(), quranEnabled = data.has("quranEnabled"), pages = Number(data.get("pages")), deadline = data.get("deadline");
      if (quranEnabled && (!validDate(deadline) || deadline < today() || !Number.isFinite(pages) || pages <= 0)) {
        toast("Enter remaining pages and a deadline today or later.");
        return false;
      }
      const previous = { ...cfg.quran };
      Object.assign(cfg, { startDate: data.get("startDate"), length: Number(data.get("length")), suhoorMinutes: Number(data.get("suhoorMinutes")), iftarMinutes: Number(data.get("iftarMinutes")), dailyPages: Number(data.get("dailyPages")), nightGoals: data.get("nightGoals"), goals: Object.fromEntries(["taraweeh", "charity", "adhkar", "family"].map((key) => [key, data.has("goal-" + key)])) });
      cfg.quran = { enabled: quranEnabled, pages, deadline, setOn: previous.pages === pages && previous.deadline === deadline && previous.enabled === quranEnabled ? previous.setOn : today() };
      this.setEnabled(data.has("enabled"));
      this.ensure(today(), true);
      save();
      return true;
    },
    banner(key) {
      return renderRamadanBanner(this, ctx, key);
    },
    dashboard(key) {
      return renderRamadanDashboard(this, ctx, key);
    },
    settings() {
      return renderRamadanSettings(this, ctx);
    }
  };
  ramadanService = ramadan;
  return ramadan;
}
