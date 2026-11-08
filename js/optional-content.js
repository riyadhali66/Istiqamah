import { entries } from "./adhkar-data.js?v=2.1.0";
import { transact } from "./snapshots.js?v=2.1.0";
export const OPTIONAL_SOURCES = {
  uthmani: {
    url: "https://raw.githubusercontent.com/quran/quran.com-frontend-next/aff1a035b09b66f28047b3216edcae4c5c949a49/public/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2",
    sha256: "8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c",
    credit: "King Fahd Quran Complex \xB7 Quran.com frontend aff1a035 \xB7 original font terms; no separate redistribution license"
  },
  azkar: {
    url: "https://raw.githubusercontent.com/osamayy/azkar-db/fbdfa017782c907fd0ca4ee2726060cbc527072f/azkar.json",
    sha256: "071893211f6c711d7fb389826a7bcc79ac1ad2f0c13bdb4cc3bd38e871480a6c",
    credit: "osamayy/azkar-db \xB7 fbdfa017782c907fd0ca4ee2726060cbc527072f \xB7 README expressly permits reuse"
  },
  makkah: {
    url: "https://raw.githubusercontent.com/abodehq/Athan-MP3/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds/Athan%20Makkah.mp3",
    sha256: "4ab22d15fcea1a70f636b50f21e3f82597fa583ec2a21065373b3bde87482647",
    credit: "abodehq/Athan-MP3 \xB7 cf1a9dd4f1e5e10009439099c5af74479ad332c0 \xB7 no explicit license"
  },
  mishary: {
    url: "https://raw.githubusercontent.com/abodehq/Athan-MP3/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds/Athan%20Mishary%20Alafasi.mp3",
    sha256: "06a9ef43abf7a8907df477a878704d0679d941886273b1a1834e15c2934a1629",
    credit: "abodehq/Athan-MP3 \xB7 cf1a9dd4f1e5e10009439099c5af74479ad332c0 \xB7 no explicit license"
  }
};
const audioURLs = {};
export async function readOptional(id) {
  return transact("optional", "readonly", (store, done) => {
    store.get(id).onsuccess = (event) => done(event.target.result?.blob);
  });
}
export async function downloadOptional(id) {
  const source = OPTIONAL_SOURCES[id];
  if (!source) throw new Error("Unknown content");
  const response = await fetch(source.url, {
    credentials: "omit",
    referrerPolicy: "no-referrer"
  });
  if (!response.ok) throw new Error("Download unavailable");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > 5 * 1024 * 1024)
    throw new Error("Download too large");
  const digest = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)),
    (value) => value.toString(16).padStart(2, "0")
  ).join("");
  if (digest !== source.sha256) throw new Error("Source checksum mismatch");
  const blob = new Blob([buffer], {
    type: id === "azkar" ? "application/json" : id === "uthmani" ? "font/woff2" : "audio/mpeg"
  });
  await transact("optional", "readwrite", (store) => store.put({ id, blob }));
  return blob;
}
export function parseAdhkar(text) {
  const source = JSON.parse(text);
  if (!Array.isArray(source.rows)) throw new Error("Invalid source");
  const entries2 = source.rows.filter((row) => ["\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062D", "\u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0645\u0633\u0627\u0621"].includes(row[0])).map((row) => ({
    category: row[0],
    text: row[1],
    description: row[2],
    count: row[3],
    reference: row[4]
  }));
  if (entries2.length !== 61 || entries2.some(
    (entry) => typeof entry.text !== "string" || !Number.isInteger(entry.count) || entry.count < 1 || entry.count > 1e3
  ))
    throw new Error("Invalid source");
  return entries2;
}
export async function loadOptionalAdhkar() {
  const blob = await readOptional("azkar");
  window.SOURCE_DATA.adhkar = entries.filter((e) => ["morning", "evening"].includes(e.category));
}
export async function optionalAudio(id) {
  if (audioURLs[id]) return audioURLs[id];
  const blob = await readOptional(id);
  return blob ? audioURLs[id] = URL.createObjectURL(blob) : null;
}
export async function removeOptional() {
  await transact("optional", "readwrite", (store) => store.clear());
  if (optionalFont) {
    document.fonts.delete(optionalFont);
    optionalFont = null;
  }
  for (const [id, url] of Object.entries(audioURLs)) {
    URL.revokeObjectURL(url);
    delete audioURLs[id];
  }
  window.SOURCE_DATA.adhkar = entries.filter((e) => ["morning", "evening"].includes(e.category));
}
let optionalFont;
export async function loadOptionalFont() {
  const blob = await readOptional("uthmani");
  if (!blob) return;
  if (optionalFont) document.fonts.delete(optionalFont);
  optionalFont = await new FontFace("Uthmani", await blob.arrayBuffer()).load();
  document.fonts.add(optionalFont);
}
