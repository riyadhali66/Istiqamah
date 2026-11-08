import { entries, byId, aliases } from "./adhkar-data.js?v=2.1.0";
import { renderChooser, renderTasbih } from "./ui/adhkar-library.js?v=2.1.0";
export let adhkarLibrary;
export function initAdhkarLibrary(ctx) {
  const { getState, getDay, today, offsetDay, dateObj, prayerService, hijriService, t, esc, icon, save, render, toast } = ctx;
  const state = () => getState();
  const config = () => state().phase2.ramadan;
  const dhikrConfig = () => state().phase2.adhkar;
  const label = (entry) => t(entry.categoryLabel);
  const adhkar = {
    entries,
    byId,
    aliases,
    resolve(id) {
      return byId.get(aliases.get(id) || id) || null;
    },
    list(category) {
      return entries.filter((e) => e.category === category);
    },
    count(entry, key = today()) {
      const d = getDay(key);
      return d.adhkar[entry.id] ?? 0;
    },
    target(entry) {
      return entry.count || dhikrConfig().personalTargets[entry.id] || null;
    },
    set(entry, value, key = today()) {
      const d = getDay(key), count = Math.min(1e4, Math.max(0, Number(value) || 0));
      d.adhkar[entry.id] = count;
      for (const oldKey of entry.legacyKeys) d.adhkar[oldKey] = count;
      if (["morning", "evening"].includes(entry.category)) {
        const all = this.list(entry.category);
        const complete = all.every((a) => a.count != null && this.count(a, key) >= a.count);
        d.values[entry.category === "morning" ? "adhkar-am" : "adhkar-pm"] = complete ? 1 : 0;
      }
      save();
    },
    increment(entry, key = today()) {
      const count = this.count(entry, key), target = this.target(entry);
      if (target && count >= target) return;
      this.set(entry, count + 1, key);
    },
    selected() {
      return this.resolve(state().tasbih.selected);
    },
    filtered() {
      const { category, search, favorites } = dhikrConfig();
      const normalize = (s) => String(s).normalize("NFKD").replace(/[\u064B-\u065F\u0670\u0640]/g, "").toLocaleLowerCase();
      const query = normalize(search.trim());
      return entries.filter((e) => (category === "all" || category === "favorites" && favorites.includes(e.id) || e.category === category) && (!query || normalize(e.text + " " + e.reference + " " + label(e) + " " + e.sourceCategory).includes(query)));
    },
    toggleFavorite(id) {
      const f = dhikrConfig().favorites, index = f.indexOf(id);
      if (index < 0) f.push(id);
      else f.splice(index, 1);
      save();
    },
    move(direction) {
      const list = this.filtered();
      if (!list.length) return;
      const index = list.findIndex((e) => e.id === state().tasbih.selected);
      state().tasbih.selected = list[(Math.max(0, index) + direction + list.length) % list.length].id;
      save();
    },
    chooser() {
      return renderChooser(this, ctx);
    },
    tasbih() {
      return renderTasbih(this, ctx);
    }
  };
  adhkarLibrary = adhkar;
  return adhkar;
}
