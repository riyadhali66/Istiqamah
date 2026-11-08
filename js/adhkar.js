import { session } from "./session.js?v=2.1.0";
import { adhkarLibrary } from "./adhkar-library.js?v=2.1.0";
export const adhkarService = { list(period) {
  return adhkarLibrary.list(period);
}, increment(period, index, key = session.selectedDate) {
  const entry = this.list(period)[index];
  if (entry) adhkarLibrary.increment(entry, key);
} };
export function tasbihSelection() {
  const entry = adhkarLibrary.selected();
  return entry ? { entry, key: entry.id, period: entry.category, index: adhkarLibrary.list(entry.category).findIndex((e) => e.id === entry.id) } : null;
}
