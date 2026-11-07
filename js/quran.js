import { contentService } from "./content.js?v=1.2.0";
import { session } from "./session.js?v=1.2.0";

const quranService = {
  daily: () => contentService.daily("quran"),
  async refresh() {
    const v = this.daily();
    if (!v) return;
    const edition = {
      en: "eng-abdelhaleem",
      ar: "ara-quranuthmanihaf",
      ur: "urd-fatehmuhammadja",
      hi: "hin-muhammadfarooq",
      ml: "mal-abdulhameedhaid",
    }[session.lang];
    const p = await contentService.cacheFetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/${edition}/${v.chapter}/${v.verse}.json`,
    );
    if (p?.text) v[session.lang] = p.text;
    return p;
  },
  audio(v) {
    return `https://everyayah.com/data/Alafasy_128kbps/${String(v.chapter).padStart(3, "0")}${String(v.verse).padStart(3, "0")}.mp3`;
  },
};

export { quranService };
