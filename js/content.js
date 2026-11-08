import { dateObj } from "./dates.js?v=2.1.0";
import { session } from "./session.js?v=2.1.0";

const contentService = {
  index(key, len) {
    let d = dateObj(key);
    return (
      Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5) %
      len
    );
  },
  daily(kind, key = session.selectedDate) {
    const arr = window.SOURCE_DATA?.[kind] || [];
    return arr[this.index(key, arr.length)];
  },
  async cacheFetch(url) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw Error("content unavailable");
      return await r.json();
    } catch {
      return null;
    }
  },
};

export { contentService };

// A small initial reading set; the larger hadith collection loads after first paint.
async function loadPart(kind) {
  const response = await fetch(
    new URL(`../data/${kind}.json?v=2.1.0`, import.meta.url),
  );
  if (!response.ok) throw new Error("Bundled readings unavailable");
  window.SOURCE_DATA[kind] = await response.json();
}
export async function loadInitialContent() {
  window.SOURCE_DATA = { quran: [], hadith: [], names: [], adhkar: [] };
  await Promise.all(["quran", "names", "adhkar", "ramadan-dua"].map(loadPart));
}
export function loadHadith() {
  return loadPart("hadith");
}
