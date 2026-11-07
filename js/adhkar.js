import { session } from "./session.js?v=1.2.0";
import { getDay, save } from "./records.js?v=1.2.0";

const adhkarService = {
  list(period) {
    return (window.SOURCE_DATA?.adhkar || []).filter(
      (a) =>
        a.category ===
        (period === "morning"
          ? "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D"
          : "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0633\u0627\u0621"),
    );
  },
  key(period, i) {
    const a = this.list(period)[i];
    return a?.legacyKey || a?.id || period + "-" + i;
  },
  count(period, i, dayKey = session.selectedDate) {
    return session.state.days[dayKey]?.adhkar?.[this.key(period, i)] || 0;
  },
  increment(period, i, dayKey = session.selectedDate) {
    let d = getDay(dayKey);
    let a = this.list(period)[i],
      key = this.key(period, i);
    if (!a) return;
    d.adhkar[key] = Math.min(a.count, (d.adhkar[key] || 0) + 1);
    const all = this.list(period),
      total = all.reduce(
        (s, a2, i2) =>
          s + Math.min(a2.count, d.adhkar[this.key(period, i2)] || 0),
        0,
      );
    if (total === all.reduce((s, a2) => s + a2.count, 0))
      d.values[period === "morning" ? "adhkar-am" : "adhkar-pm"] = 1;
    save();
  },
};
function tasbihSelection() {
  const key = session.state.tasbih.selected || "";
  for (const period of ["morning", "evening"]) {
    const index = adhkarService
      .list(period)
      .findIndex((a, i) => adhkarService.key(period, i) === key);
    if (index >= 0)
      return { period, index, entry: adhkarService.list(period)[index], key };
  }
  return null;
}

export { adhkarService, tasbihSelection };
