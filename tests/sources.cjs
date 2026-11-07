"use strict";
const { execFileSync } = require("node:child_process"),
  fs = require("node:fs"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const root =
  "https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/29d7623fede52eca835a789025dfda866e8cfe44/";
const get = (url) =>
  execFileSync(
    "curl",
    ["--fail", "--location", "--silent", "--show-error", url],
    { maxBuffer: 2 * 1024 * 1024 },
  );
const ar = get(root + "ar.json"),
  en = get(root + "en.json"),
  license = get(root + "LICENSE");
assert(license.equals(fs.readFileSync("vendor/LICENSE-adhkar-seen.txt")));
const originals = JSON.parse(ar),
  translations = JSON.parse(en),
  bundle = JSON.parse(fs.readFileSync("data/adhkar.json", "utf8"));
for (const entry of bundle) {
  const a = originals.find((row) => row.order === entry.sourceOrder),
    e = translations.find((row) => row.order === entry.sourceOrder);
  assert.equal(entry.text, a.content);
  assert.equal(entry.count, a.count);
  assert.equal(entry.reference, a.source);
  assert.equal(entry.description, a.fadl);
  assert.equal(entry.en, e.translation);
  assert([0, entry.period === "morning" ? 1 : 2].includes(a.type));
}
for (const [language, key] of [
  ["ara", "ar"],
  ["eng", "en"],
]) {
  const raw = get(
    `https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/${language}-tirmidhi/3513.json`,
  );
  const hadith = JSON.parse(raw).hadiths[0],
    bundled = JSON.parse(fs.readFileSync("data/ramadan-dua.json", "utf8"));
  assert.equal(bundled[key], hadith.text);
  if (key === "ar") assert.deepEqual(bundled.grades, hadith.grades);
  console.log(
    crypto.createHash("sha256").update(raw).digest("hex"),
    language + "-tirmidhi/3513.json",
  );
}
for (const [name, bytes] of [
  ["ar.json", ar],
  ["en.json", en],
  ["LICENSE", license],
])
  console.log(crypto.createHash("sha256").update(bytes).digest("hex"), name);
console.log(
  "PASS: exact MIT source text/counts/references/English, license, and Tirmidhi text/grades",
);
