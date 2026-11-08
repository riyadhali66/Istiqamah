import { ramadanService } from "./ramadan.js?v=2.1.0";
import { storage } from "./storage.js?v=2.1.0";
import { session } from "./session.js?v=2.1.0";
import { hijriService } from "./hijri.js?v=2.1.0";
import { offsetDay, today } from "./dates.js?v=2.1.0";
import { render } from "./ui/core.js?v=2.1.0";
function save() {
  storage.save();
}
function getDay(key = session.selectedDate) {
  if (!session.state.days[key])
    session.state.days[key] = {
      values: {},
      mood: 0,
      stress: 0,
      journal: {},
      adhkar: {},
      fasted: false,
      pauseFaith: false,
      snapshot: session.state.habits.map((h) => ({ ...h })),
      kids: {}
    };
  const d = session.state.days[key];
  d.key = key;
  d.values ??= {};
  d.journal ??= {};
  d.adhkar ??= {};
  d.kids ??= {};
  d.snapshot ??= session.state.habits.map((h) => ({ ...h }));
  return d;
}
const dayHabits = (key) => ramadanService.merge(key, session.state.days[key]?.snapshot || session.state.habits);
const isPaused = (h, d) => d?.pauseFaith && (h.prayer || h.fasting) || (h.ramadan ? ramadanService.paused(h, d) : h.fasting && d?.key && !hijriService.fasts(d.key).length);
function score(key) {
  let d = session.state.days[key];
  if (!d) return 0;
  let habits = dayHabits(key).filter((h) => !isPaused(h, d));
  let denom = habits.reduce((s, h) => s + h.weight, 0);
  return denom ? Math.round(
    habits.reduce(
      (s, h) => s + Math.min(1, Math.max(0, Number(d.values?.[h.id]) || 0) / h.target) * h.weight,
      0
    ) / denom * 100
  ) : 0;
}
function categoryScore(key, cat) {
  let d = session.state.days[key];
  if (!d) return 0;
  let hs = dayHabits(key).filter((h) => h.category === cat && !isPaused(h, d));
  return hs.length ? Math.round(
    hs.reduce(
      (a, h) => a + Math.min(1, Math.max(0, Number(d.values?.[h.id]) || 0) / h.target),
      0
    ) / hs.length * 100
  ) : 0;
}
function habitStreak(h) {
  let count = 0, key = today();
  if ((session.state.days[key]?.values?.[h.id] || 0) < h.target && !isPaused(h, session.state.days[key]))
    key = offsetDay(key, -1);
  for (let i = 0; i < 1500; i++, key = offsetDay(key, -1)) {
    let d = session.state.days[key];
    if (!d) break;
    if (isPaused(h, d)) continue;
    if ((d.values?.[h.id] || 0) >= (dayHabits(key).find((x) => x.id === h.id)?.target || h.target)) count++;
    else break;
  }
  return count;
}
function streak() {
  let key = today(), count = 0;
  const active = (k) => Object.values(session.state.days[k]?.values || {}).some((v) => v > 0);
  if (!active(key)) key = offsetDay(key, -1);
  for (let i = 0; i < 1500; i++, key = offsetDay(key, -1)) {
    if (session.state.days[key]?.ramadan?.fasting === "paused") continue;
    if (!active(key)) break;
    count++;
  }
  return count;
}
function maxStreak() {
  const keys = Object.keys(session.state.days).filter(
    (k) => Object.values(session.state.days[k]?.values || {}).some((v) => v > 0)
  ).sort();
  let best = 0, n = 0, prev = "";
  for (let k of keys) {
    let bridge = prev ? offsetDay(prev, 1) : "";
    while (bridge && bridge < k && session.state.days[bridge]?.ramadan?.fasting === "paused") bridge = offsetDay(bridge, 1);
    n = prev && bridge === k ? n + 1 : 1;
    best = Math.max(best, n);
    prev = k;
  }
  return best;
}
function monthDays() {
  let [y, m] = session.month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}
function monthKeys() {
  return Array.from(
    { length: monthDays() },
    (_, i) => session.month + "-" + String(i + 1).padStart(2, "0")
  );
}
function logHabit(id, value) {
  const h = dayHabits(session.selectedDate).find((a) => a.id === id);
  if (!h || isPaused(h, getDay())) return;
  getDay().values[id] = Math.min(1e6, Math.max(0, +value || 0));
  save();
  render();
}
function monthlyHabits() {
  const hs = /* @__PURE__ */ new Map();
  for (let k of monthKeys())
    for (let h of [...session.state.days[k]?.snapshot || [], ...session.state.days[k]?.ramadan?.snapshot || []]) hs.set(h.id, h);
  for (let h of session.state.habits) if (!hs.has(h.id)) hs.set(h.id, h);
  return [...hs.values()];
}
function syncTodayHabits() {
  if (session.state.days[today()])
    session.state.days[today()].snapshot = session.state.habits.map((h) => ({
      ...h
    }));
  save();
}
export {
  save,
  getDay,
  dayHabits,
  isPaused,
  score,
  categoryScore,
  habitStreak,
  streak,
  maxStreak,
  monthDays,
  monthKeys,
  logHabit,
  monthlyHabits,
  syncTodayHabits
};
