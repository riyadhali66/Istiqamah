import { session } from "./session.js?v=1.2.0";
import { today, offsetDay } from "./dates.js?v=1.2.0";
import { hijriService } from "./hijri.js?v=1.2.0";
import { prayerService } from "./prayer.js?v=1.2.0";
import { storage } from "./storage.js?v=1.2.0";
import { getDay } from "./records.js?v=1.2.0";
const span = (a, b) =>
  Math.round(
    (Date.parse(a + "T12:00:00Z") - Date.parse(b + "T12:00:00Z")) / 86400000,
  );
function gregorian(year, month, day = 1) {
  const d = ArabicCore.hijriToGregorian({ year, month, day });
  return `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
}
export const ramadanService = {
  config() {
    return session.ramadanPreview
      ? (session.ramadanPreviewConfig ??= structuredClone(
          session.state.ramadan,
        ))
      : session.state.ramadan;
  },
  context(key = session.selectedDate || today(), preview = true) {
    const c = this.config(),
      virtual = preview && session.ramadanPreview;
    const effective = virtual ? virtual : key,
      shifted = offsetDay(effective, c.adjustment),
      h = hijriService.get(shifted);
    if (!h)
      return {
        active: false,
        day: 0,
        coming: false,
        season: 0,
        keys: [],
        preview: !!virtual,
      };
    const season = h.month < 9 ? h.year - 1 : h.year;
    let start = offsetDay(gregorian(h.year, 9), -c.adjustment),
      end = offsetDay(gregorian(h.year, 10), -c.adjustment);
    if (h.month < 9 && span(start, effective) > 3) {
      start = offsetDay(gregorian(season, 9), -c.adjustment);
      end = offsetDay(gregorian(season, 10), -c.adjustment);
    }
    let year = h.month === 8 && span(start, effective) <= 3 ? h.year : season;
    if (virtual) {
      year = session.ramadanPreviewYear;
      start = offsetDay(gregorian(year, 9), -c.adjustment);
      end = offsetDay(start, 30);
    }
    if (!virtual && c.mode === "on" && c.manualStart) {
      start = c.manualStart;
      end = offsetDay(start, 30);
      year = hijriService.get(start)?.year || h.year;
    }
    if (!virtual && c.mode === "off" && c.manualEnd) end = c.manualEnd;
    const day = span(effective, start) + 1,
      length = Math.min(30, Math.max(1, span(end, start)));
    const active =
      day >= 1 &&
      effective < end &&
      day <= 30 &&
      (!!virtual || c.mode !== "off");
    const coming =
      c.mode !== "off" &&
      span(start, effective) >= 1 &&
      span(start, effective) <= 3;
    return {
      active,
      coming,
      day: active ? day : 0,
      season: year,
      start,
      end,
      length,
      effective,
      hijri: h,
      preview: !!virtual,
      eid: effective >= end && span(effective, end) < 7,
      shawwal: h.month === 10 && h.day >= 2,
      keys: Array.from({ length: 30 }, (_, i) => offsetDay(start, i)),
    };
  },
  record(context = this.context()) {
    if (context.preview)
      return ((session.ramadanPreviewDays ??= {})[context.effective] ??= {
        season: context.season,
        day: context.day,
      });
    const day = getDay(context.effective);
    return (day.ramadan ??= { season: context.season, day: context.day });
  },
  days(context = this.context()) {
    const source = context.preview
      ? session.ramadanPreviewDays || {}
      : session.state.days;
    return Object.entries(source)
      .map(([key, d]) => ({ key, ...(context.preview ? d : d.ramadan) }))
      .filter((d) => d.season === context.season)
      .sort((a, b) => a.key.localeCompare(b.key));
  },
  update(field, value) {
    const ctx = this.context();
    if (!ctx.active) return false;
    const d = this.record(ctx);
    d[field] = value;
    if (field === "fasted" && value) d.notFasting = false;
    if (field === "notFasting" && value) d.fasted = false;
    return ctx.preview || storage.save();
  },
  summary(ctx = this.context()) {
    const ds = this.days(ctx);
    let best = 0,
      run = 0,
      previous = "";
    for (const d of ds) {
      if (previous && span(d.key, previous) > 1) run = 0;
      if (d.fasted) run++;
      else if (!d.notFasting) run = 0;
      best = Math.max(best, run);
      previous = d.key;
    }
    const pages = ds.reduce((s, d) => s + (d.pages || 0), 0);
    return {
      fasted: ds.filter((d) => d.fasted).length,
      pages,
      best,
      percent: Math.min(
        100,
        Math.round((pages / (604 * this.config().goal)) * 100),
      ),
      taraweeh: ds.filter((d) => d.taraweeh).length,
    };
  },
  planner(ctx = this.context()) {
    const target = 604 * this.config().goal,
      read = this.summary(ctx).pages;
    const remaining = Math.max(0, target - read),
      days = Math.max(1, ctx.length - (ctx.day || 1) + 1),
      perDay = Math.ceil(remaining / days);
    return {
      target,
      read,
      remaining,
      days,
      perDay,
      perPrayer: Math.max(remaining ? 1 : 0, Math.round(perDay / 5)),
      behind: read < (target / ctx.length) * Math.max(0, (ctx.day || 1) - 1),
    };
  },
  qada() {
    const missed = Object.values(session.state.days).filter(
      (d) => d.ramadan?.notFasting,
    ).length;
    return {
      missed,
      paid: this.config().qadaPaid,
      remaining: Math.max(0, missed - this.config().qadaPaid),
    };
  },
  makeUp(delta = 1) {
    const c = this.config();
    c.qadaPaid = Math.min(this.qada().missed, Math.max(0, c.qadaPaid + delta));
    storage.save();
  },
  mode(value) {
    const c = this.config();
    c.mode = value;
    c.manualStart =
      value === "on"
        ? this.context(today(), false).hijri?.month === 9
          ? this.context(today(), false).start
          : today()
        : "";
    c.manualEnd = value === "off" ? today() : "";
    storage.save();
  },
  countdowns(ctx = this.context()) {
    // Preview uses the virtual local date and a fixed local noon, never writes real days.
    const prayers = prayerService.calculate(ctx.effective || today());
    const now = ctx.preview
      ? prayers.find((p) => p.name === "Dhuhr")?.date.getTime() || Date.now()
      : Date.now();
    return ["Fajr", "Maghrib"].map((name) => {
      let event = prayers.find((p) => p.name === name);
      if (
        event &&
        event.date.getTime() <= now &&
        (ctx.preview || ctx.effective === today())
      )
        event = prayerService
          .calculate(offsetDay(ctx.effective || today(), 1))
          .find((p) => p.name === name);
      return {
        name,
        date: event?.date,
        seconds: event
          ? Math.max(0, Math.floor((event.date - now) / 1000))
          : null,
      };
    });
  },
  night(ctx = this.context()) {
    const maghrib = prayerService
      .calculate(ctx.effective || today())
      .find((p) => p.name === "Maghrib");
    const after = !ctx.preview && maghrib && Date.now() >= +maghrib.date;
    const night = ctx.day + (after ? 1 : 0);
    return {
      number: night,
      lastTen: night >= 21 && night <= 30,
      odd: [21, 23, 25, 27, 29].includes(night),
    };
  },
  preview(day) {
    if (day === "off") {
      session.ramadanPreview = null;
      session.ramadanPreviewDays = {};
      session.ramadanPreviewConfig = null;
      return;
    }
    const h = hijriService.get(today()),
      year = h.month > 9 ? h.year + 1 : h.year;
    session.ramadanPreviewYear = year;
    session.ramadanPreview = offsetDay(gregorian(year, 9), Number(day) - 1);
  },
  span,
  gregorian,
};
