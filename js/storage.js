import { session } from "./session.js";
import { fresh, defaults, CATEGORIES, STRUGGLES, METHODS } from "./config.js";
import { toast, download } from "./utils.js";
import { today } from "./dates.js";
import { snapshots } from "./snapshots.js";

export const SCHEMA_VERSION = 1;
export function hasUnsafeKeys(value) {
  if (!value || typeof value !== "object") return false;
  return Object.keys(value).some(
    (key) =>
      ["__proto__", "constructor", "prototype"].includes(key) ||
      hasUnsafeKeys(value[key]),
  );
}
export function migrate(value) {
  if (!validate(value)) throw new Error("Invalid saved format");
  const upgraded = {
    ...fresh(),
    ...structuredClone(value),
    schemaVersion: SCHEMA_VERSION,
  };
  upgraded.profile = { ...defaults(), ...upgraded.profile };
  upgraded.settings = { ...fresh().settings, ...upgraded.settings };
  return upgraded;
}
let lastSaved = null,
  snapshotQueue = Promise.resolve();
export const storage = {
  key: "istiqamah.v1",
  migrationKey: "istiqamah.migration.v1",
  async load() {
    try {
      const raw = localStorage.getItem(this.key);
      lastSaved = raw;
      if (!raw) return fresh();
      const old = JSON.parse(raw),
        upgraded = migrate(old);
      if (old.schemaVersion == null) {
        // The exact bytes must be recoverable before committing a migration.
        if (localStorage.getItem(this.migrationKey) == null)
          localStorage.setItem(this.migrationKey, raw);
        if (localStorage.getItem(this.migrationKey) !== raw)
          await snapshots.checkpoint(raw, "migration");
        const serialized = JSON.stringify(upgraded);
        localStorage.setItem(this.key, serialized);
        lastSaved = serialized;
      }
      return upgraded;
    } catch {
      session.storageError = true;
      return fresh();
    }
  },
  save() {
    try {
      if (session.storageError) throw new Error("Recovery required");
      // Compare bytes before every synchronous write, even if a storage event was delayed.
      if (localStorage.getItem(this.key) !== lastSaved) {
        toast(
          "Another tab changed your data. Reload to see the latest records.",
        );
        return false;
      }
      if (!validate(session.state)) throw new Error("Invalid state");
      const serialized = JSON.stringify(session.state);
      localStorage.setItem(this.key, serialized);
      lastSaved = serialized;
      this.snapshot().catch(() => {
        if (!session.backupWarning)
          toast("Safety copies are unavailable. Export a file backup.");
        session.backupWarning = true;
      });
      return true;
    } catch {
      toast("Your browser could not save. Export a backup before closing.");
      return false;
    }
  },
  snapshot() {
    if (session.storageError || !session.state?.onboarded)
      return Promise.resolve();
    const data = JSON.stringify(session.state),
      date = today();
    snapshotQueue = snapshotQueue
      .catch(() => {})
      .then(() => snapshots.put(date, data));
    return snapshotQueue;
  },
  async replace(incoming) {
    const next = migrate(incoming);
    const raw = localStorage.getItem(this.key);
    // A failed undo backup prevents a destructive replacement.
    if (raw) await snapshots.checkpoint(raw, "before-restore");
    const serialized = JSON.stringify(next);
    if (localStorage.getItem(this.key) !== raw)
      throw new Error("Another tab changed the data");
    localStorage.setItem(this.key, serialized);
    lastSaved = serialized;
    session.storageError = false;
    session.state = next;
    await this.snapshot().catch(() => {
      if (!session.backupWarning)
        toast("Safety copies are unavailable. Export a file backup.");
      session.backupWarning = true;
    });
    return next;
  },
  export() {
    download(
      "istiqamah-backup-" + today() + ".json",
      JSON.stringify(session.state, null, 2),
      "application/json",
    );
  },
  exportOriginal() {
    const raw = localStorage.getItem(this.key);
    if (raw) download("istiqamah-original.json", raw, "application/json");
  },
  snapshots,
};

function validate(s) {
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x),
    text = (x, n = 1e3) => typeof x === "string" && x.length <= n,
    num = (x, min = 0, max = 1e12) =>
      Number.isFinite(x) && x >= min && x <= max,
    id = (x) => text(x, 80) && /^[A-Za-z0-9_-]+$/.test(x),
    date = (x) =>
      typeof x === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(x) &&
      Number.isFinite(Date.parse(x + "T12:00:00Z")) &&
      new Date(x + "T12:00:00Z").toISOString().slice(0, 10) === x,
    time = (x) => typeof x === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(x),
    list = (x, max, fn) => Array.isArray(x) && x.length <= max && x.every(fn),
    record = (x, max, fn) =>
      obj(x) &&
      Object.keys(x).length <= max &&
      Object.entries(x).every(
        ([k, v]) =>
          !["__proto__", "constructor", "prototype"].includes(k) && fn(v, k),
      );
  const habit = (h) =>
    obj(h) &&
    id(h.id) &&
    text(h.label, 120) &&
    CATEGORIES.includes(h.category) &&
    num(h.target, 0.01, 1e6) &&
    num(h.weight, 0.01, 100) &&
    text(h.unit, 30);
  if (hasUnsafeKeys(s)) return false;
  if (
    !obj(s) ||
    s.version !== 1 ||
    (s.schemaVersion != null && s.schemaVersion !== 1) ||
    typeof s.onboarded !== "boolean" ||
    !obj(s.profile) ||
    !list(s.habits, 100, habit) ||
    !list(
      s.debts,
      1e3,
      (d) =>
        obj(d) &&
        id(d.id) &&
        text(d.name, 80) &&
        num(d.total, 0.01) &&
        num(d.paid, 0, d.total) &&
        list(
          d.payments || [],
          1e4,
          (p2) => obj(p2) && date(p2.date) && num(p2.amount, 0.01),
        ),
    ) ||
    !list(
      s.words,
      2e4,
      (w) =>
        obj(w) &&
        id(w.id) &&
        text(w.word, 120) &&
        text(w.meaning, 500) &&
        text(w.example, 1e3),
    ) ||
    !list(
      s.children,
      15,
      (c) =>
        obj(c) &&
        id(c.id) &&
        text(c.name, 80) &&
        text(c.age, 80) &&
        text(c.reward, 200),
    ) ||
    !list(
      s.schedule,
      100,
      (b) => obj(b) && id(b.id) && text(b.label, 120) && time(b.time),
    )
  )
    return false;
  const p = s.profile;
  if (
    !["en", "ar", "ur", "ml", "hi"].includes(p.language) ||
    !text(p.name, 80) ||
    !text(p.age, 80) ||
    !["", "Female", "Male"].includes(p.gender) ||
    !text(p.country, 80) ||
    !text(p.city, 80) ||
    !(p.lat === "" || num(p.lat, -90, 90)) ||
    !(p.lon === "" || num(p.lon, -180, 180)) ||
    !text(p.tz, 80) ||
    !list(p.goals, 8, (x) => CATEGORIES.includes(x)) ||
    !record(p.goalText, 8, (v) => text(v, 250)) ||
    !list(p.struggles, 10, (x) => STRUGGLES.includes(x)) ||
    !list(p.start, 3, (x) =>
      ["Tahajjud", "Quran memorization", "Sunnah fasting"].includes(x),
    ) ||
    !num(p.kids, 0, 15) ||
    !text(p.childNames, 500) ||
    !time(p.wake) ||
    !time(p.sleep) ||
    !time(p.workStart) ||
    !time(p.workEnd) ||
    !METHODS.includes(p.method) ||
    !["Shafi", "Hanafi"].includes(p.madhab) ||
    !["Gentle start", "Balanced", "Full power"].includes(p.commitment)
  )
    return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: p.tz }).format();
  } catch {
    return false;
  }
  if (
    !record(
      s.days,
      5e4,
      (d, k) =>
        date(k) &&
        obj(d) &&
        record(d.values || {}, 150, (v) => num(v, 0, 1e6)) &&
        (!d.snapshot || list(d.snapshot, 100, habit)) &&
        num(d.mood || 0, 0, 5) &&
        num(d.stress || 0, 0, 5) &&
        record(d.journal || {}, 3, (v) => text(v, 1e5)) &&
        record(d.adhkar || {}, 200, (v) => num(v, 0, 1e4)) &&
        record(d.kids || {}, 15, (v) =>
          record(v, 5, (x) => typeof x === "boolean"),
        ),
    )
  )
    return false;
  if (
    !obj(s.settings) ||
    !["light", "dark"].includes(s.settings.theme) ||
    !["silent", "makkah", "mishary"].includes(s.settings.sound) ||
    !obj(s.tasbih) ||
    !num(s.tasbih.count, 0, 1e12) ||
    (s.tasbih.selected != null &&
      !(
        text(s.tasbih.selected, 20) &&
        /^(?:(?:morning|evening)-\d{1,2})?$/.test(s.tasbih.selected)
      )) ||
    ![33, 100].includes(s.tasbih.goal) ||
    !record(s.reviews, 1e3, (r) => record(r, 10, (v) => text(v, 1e5))) ||
    !record(s.savings, 1e3, (v) => num(v)) ||
    !record(s.zakat, 8, (v) => num(v))
  )
    return false;
  return true;
}

export { validate };
