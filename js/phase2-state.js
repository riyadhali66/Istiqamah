import { entries, byId, aliases } from "./adhkar-data.js?v=2.1.0";
export const APP_VERSION = "2.1.0";
export const validDate = (value) => {
  try {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && (/* @__PURE__ */ new Date(value + "T12:00:00Z")).toISOString().slice(0, 10) === value;
  } catch {
    return false;
  }
};
export const dayDiff = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
export const dateKey = (d) => `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
export const phase2Defaults = () => ({ schemaVersion: 2, ramadan: { enabled: false, startDate: "", length: 30, suhoorMinutes: 45, iftarMinutes: 30, dailyPages: 2, quran: { enabled: false, pages: 0, deadline: "", setOn: "" }, goals: { taraweeh: true, charity: true, adhkar: true, family: true }, nightGoals: "" }, adhkar: { favorites: [], category: "all", search: "", personalTargets: {} } });
export const migratePhase2 = function migrate(s) {
  const base = phase2Defaults();
  s.phase2 = { ...base, ...s.phase2, ramadan: { ...base.ramadan, ...s.phase2?.ramadan, quran: { ...base.ramadan.quran, ...s.phase2?.ramadan?.quran }, goals: { ...base.ramadan.goals, ...s.phase2?.ramadan?.goals } }, adhkar: { ...base.adhkar, ...s.phase2?.adhkar } };
  for (const d of Object.values(s.days || {})) {
    d.adhkar ||= {};
    for (const [oldKey, id] of aliases) if (d.adhkar[oldKey] != null && d.adhkar[id] == null) d.adhkar[id] = d.adhkar[oldKey];
  }
  if (aliases.has(s.tasbih.selected)) s.tasbih.selected = aliases.get(s.tasbih.selected);
  return s;
};
export const validatePhase2 = function validate(s) {
  if (s.phase2 == null) return true;
  const p = s.phase2, r = p.ramadan, a = p.adhkar;
  const object = (x) => x && typeof x === "object" && !Array.isArray(x);
  const number = (n, min, max) => Number.isFinite(n) && n >= min && n <= max;
  if (!object(p) || p.schemaVersion !== 2 || !object(r) || !object(a)) return false;
  if (typeof r.enabled !== "boolean" || !(r.startDate === "" || validDate(r.startDate)) || ![29, 30].includes(r.length) || !number(r.suhoorMinutes, 0, 180) || !number(r.iftarMinutes, 0, 180) || !number(r.dailyPages, 1, 1e4) || typeof r.nightGoals !== "string" || r.nightGoals.length > 2e3) return false;
  if (!object(r.quran) || typeof r.quran.enabled !== "boolean" || !number(r.quran.pages, 0, 1e6) || !(r.quran.deadline === "" || validDate(r.quran.deadline)) || !(r.quran.setOn === "" || validDate(r.quran.setOn)) || !object(r.goals) || !["taraweeh", "charity", "adhkar", "family"].every((key) => typeof r.goals[key] === "boolean")) return false;
  if (!Array.isArray(a.favorites) || a.favorites.length > entries.length || !a.favorites.every((id) => byId.has(id)) || typeof a.category !== "string" || typeof a.search !== "string" || a.search.length > 200 || !object(a.personalTargets) || Object.keys(a.personalTargets).length > entries.length || !Object.entries(a.personalTargets).every(([id, n]) => byId.has(id) && number(n, 1, 1e4))) return false;
  return Object.values(s.days || {}).every((d) => !d.ramadan || object(d.ramadan) && typeof d.ramadan.active === "boolean" && validDate(d.ramadan.startDate) && [29, 30].includes(d.ramadan.length) && number(d.ramadan.day, 1, 30) && ["untracked", "fasted", "not-fasting", "paused"].includes(d.ramadan.fasting) && typeof d.ramadan.reason === "string" && d.ramadan.reason.length <= 1e3 && (d.ramadan.nightGoals == null || typeof d.ramadan.nightGoals === "string" && d.ramadan.nightGoals.length <= 2e3) && (d.ramadan.originalStart == null || validDate(d.ramadan.originalStart)) && (d.ramadan.calendarSource == null || ["local", "ummalqura"].includes(d.ramadan.calendarSource)) && Array.isArray(d.ramadan.snapshot) && d.ramadan.snapshot.length <= 8 && d.ramadan.snapshot.every((h) => object(h) && /^ramadan-[a-z]+$/.test(h.id) && typeof h.label === "string" && h.label.length <= 120 && ["Faith", "Family"].includes(h.category) && number(h.target, 1, 1e6) && number(h.weight, 1, 10) && typeof h.unit === "string" && h.unit.length <= 30));
};
export function needsPhase2Migration(s) {
  return s.phase2?.schemaVersion !== 2 || aliases.has(s.tasbih?.selected) || Object.values(s.days || {}).some((d) => Array.from(aliases).some(([legacy, id]) => d.adhkar?.[legacy] != null && d.adhkar?.[id] == null));
}
