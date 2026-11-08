import { session } from "./session.js?v=2.1.0";
const translations = {},
  loaded = new Map();
export function loadTranslations(language = session.lang || "en") {
  if (language === "en") return Promise.resolve();
  if (!["ar", "ur", "ml", "hi"].includes(language))
    return Promise.reject(new Error("Unknown language"));
  if (!loaded.has(language))
    loaded.set(
      language,
      (async () => {
        try {
          const response = await fetch(
            new URL(`./i18n/${language}.json?v=2.1.0`, import.meta.url),
          );
          if (!response.ok) throw new Error("Interface catalog unavailable");
          const catalog = await response.json();
          for (const [key, value] of Object.entries(catalog))
            (translations[key] ??= {})[language] = value;
        } catch (error) {
          loaded.delete(language);
          throw error;
        }
      })(),
    );
  return loaded.get(language);
}
const t = (key) => translations[key]?.[session.lang] || key;
export { t, translations };
