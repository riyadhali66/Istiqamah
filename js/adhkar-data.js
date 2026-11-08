import library from "../data/adhkar-library.js?v=2.1.0";
export { library };
export const entries = library.entries;
export const byId = new Map(entries.map((entry) => [entry.id, entry]));
export const aliases = new Map(entries.flatMap((entry) => entry.legacyKeys.map((key) => [key, entry.id])));
