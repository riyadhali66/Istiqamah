import { transact } from "./snapshots.js?v=1.2.0";
// Intentionally absent from the install cache. Requests occur only after an explicit download tap.
export const OPTIONAL_SOURCES = {
  makkah: {
    url: "https://raw.githubusercontent.com/abodehq/Athan-MP3/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds/Athan%20Makkah.mp3",
    sha256: "4ab22d15fcea1a70f636b50f21e3f82597fa583ec2a21065373b3bde87482647",
    credit:
      "abodehq/Athan-MP3 · cf1a9dd4f1e5e10009439099c5af74479ad332c0 · no explicit license",
  },
  mishary: {
    url: "https://raw.githubusercontent.com/abodehq/Athan-MP3/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds/Athan%20Mishary%20Alafasi.mp3",
    sha256: "06a9ef43abf7a8907df477a878704d0679d941886273b1a1834e15c2934a1629",
    credit:
      "abodehq/Athan-MP3 · cf1a9dd4f1e5e10009439099c5af74479ad332c0 · no explicit license",
  },
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
    referrerPolicy: "no-referrer",
  });
  if (!response.ok) throw new Error("Download unavailable");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > 5 * 1024 * 1024)
    throw new Error("Download too large");
  const digest = Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", buffer)),
    (value) => value.toString(16).padStart(2, "0"),
  ).join("");
  if (digest !== source.sha256) throw new Error("Source checksum mismatch");
  const blob = new Blob([buffer], {
    type: id === "azkar" ? "application/json" : "audio/mpeg",
  });
  await transact("optional", "readwrite", (store) => store.put({ id, blob }));
  return blob;
}
export async function optionalAudio(id) {
  if (audioURLs[id]) return audioURLs[id];
  const blob = await readOptional(id);
  return blob ? (audioURLs[id] = URL.createObjectURL(blob)) : null;
}
export async function removeOptional() {
  await transact("optional", "readwrite", (store) => store.clear());
  for (const [id, url] of Object.entries(audioURLs)) {
    URL.revokeObjectURL(url);
    delete audioURLs[id];
  }
}
