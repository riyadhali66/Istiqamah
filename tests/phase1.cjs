"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
module.exports = async function ({ browser, base, check, seed }) {
  const legacy = structuredClone(seed);
  delete legacy.schemaVersion;
  async function open(data, raw) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      acceptDownloads: true,
    });
    await context.addInitScript(
      ({ data, raw }) => {
        if (!sessionStorage.getItem("seeded")) {
          if (raw !== undefined) localStorage.setItem("istiqamah.v1", raw);
          else if (data)
            localStorage.setItem("istiqamah.v1", JSON.stringify(data));
          sessionStorage.setItem("seeded", "1");
        }
      },
      { data, raw },
    );
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base);
    await page.waitForFunction(() => !!window.Istiqamah);
    return { context, page, errors };
  }
  async function settings(page) {
    await page
      .locator('[data-action="nav"][data-id="settings"]')
      .first()
      .click();
  }
  await check(
    "legacy migration preserves every field and original bytes before upgrade",
    async () => {
      const { context, page, errors } = await open(legacy);
      const result = await page.evaluate(() => ({
        state: Istiqamah.state,
        original: localStorage.getItem("istiqamah.migration.v1"),
        saved: JSON.parse(localStorage.getItem("istiqamah.v1")),
      }));
      assert.equal(result.original, JSON.stringify(legacy));
      assert.equal(result.saved.schemaVersion, 1);
      for (const key of Object.keys(legacy))
        assert.deepEqual(result.state[key], legacy[key]);
      const migrated = await page.evaluate(async () => {
        const { migrate } = await import("./js/storage.js");
        const first = migrate(Istiqamah.state);
        return JSON.stringify(first) === JSON.stringify(migrate(first));
      });
      assert(migrated);
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "migration refuses to upgrade if its original-byte backup fails",
    async () => {
      const context = await browser.newContext();
      await context.addInitScript((data) => {
        localStorage.setItem("istiqamah.v1", JSON.stringify(data));
        const original = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === "istiqamah.migration.v1")
            throw new DOMException("Quota", "QuotaExceededError");
          return original.call(this, key, value);
        };
      }, legacy);
      const page = await context.newPage();
      await page.goto(base);
      await page.waitForFunction(() => !!window.Istiqamah);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("istiqamah.v1")),
        JSON.stringify(legacy),
      );
      assert.equal(await page.evaluate(() => Istiqamah.storage.save()), false);
      await context.close();
    },
  );
  await check(
    "corrupt and future-schema records cannot be overwritten by later saves",
    async () => {
      for (const raw of [
        "{broken-json",
        JSON.stringify({ ...legacy, schemaVersion: 99 }),
      ]) {
        const { context, page } = await open(null, raw);
        assert.equal(
          await page.evaluate(() => Istiqamah.storage.save()),
          false,
        );
        assert.equal(
          await page.evaluate(() => localStorage.getItem("istiqamah.v1")),
          raw,
        );
        assert.equal(await page.locator("#wizard").isVisible(), false);
        await settings(page);
        assert(
          await page
            .locator('[data-action="export-original"]')
            .last()
            .isVisible(),
        );
        await context.close();
      }
    },
  );
  await check(
    "stale tabs cannot overwrite a more recent save, including a cleared record",
    async () => {
      const { context, page } = await open(legacy),
        other = await context.newPage();
      await other.goto(base);
      await other.waitForFunction(() => !!window.Istiqamah);
      await other.evaluate(() => {
        Istiqamah.state.profile.name = "Latest tab";
        Istiqamah.storage.save();
      });
      assert.equal(
        await page.evaluate(() => {
          Istiqamah.state.profile.name = "Stale tab";
          return Istiqamah.storage.save();
        }),
        false,
      );
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("istiqamah.v1")).profile.name,
        ),
        "Latest tab",
      );
      await other.evaluate(() => localStorage.removeItem("istiqamah.v1"));
      assert.equal(await page.evaluate(() => Istiqamah.storage.save()), false);
      await context.close();
    },
  );
  await check(
    "encrypted export/import authenticates passphrases and ciphertext without replacing records on failure",
    async () => {
      const { context, page, errors } = await open(legacy);
      await settings(page);
      await page.locator('[data-action="encrypted-backup"]').click();
      await page
        .locator("#export-passphrase")
        .fill("a private test passphrase");
      await page
        .locator("#export-passphrase-confirm")
        .fill("a private test passphrase");
      const event = page.waitForEvent("download");
      await page.locator("#encrypted-export-form button").click();
      const file = await event;
      const text = fs.readFileSync(await file.path(), "utf8"),
        envelope = JSON.parse(text);
      assert.equal(envelope.cipher, "AES-256-GCM");
      assert(!text.includes(legacy.profile.name));
      assert(!text.includes("profile"));
      const result = await page.evaluate(async (env) => {
        const { decryptBackup, encryptBackup } =
          await import("./js/backup-crypto.js");
        let wrong = false,
          tampered = false,
          bounds = false;
        try {
          await decryptBackup(env, "wrong");
        } catch {
          wrong = true;
        }
        try {
          await decryptBackup(
            { ...env, ciphertext: "AAAA" + env.ciphertext.slice(4) },
            "a private test passphrase",
          );
        } catch {
          tampered = true;
        }
        try {
          await decryptBackup({ ...env, iterations: 2 ** 32 }, "x");
        } catch {
          bounds = true;
        }
        const other = await encryptBackup(
          Istiqamah.state,
          "a private test passphrase",
        );
        return {
          wrong,
          tampered,
          bounds,
          unique: env.iv !== other.iv && env.salt !== other.salt,
        };
      }, envelope);
      assert.deepEqual(result, {
        wrong: true,
        tampered: true,
        bounds: true,
        unique: true,
      });
      await page.locator("#import-file").setInputFiles({
        name: "encrypted.json",
        mimeType: "application/json",
        buffer: Buffer.from(text),
      });
      await page.locator("#import-passphrase").fill("incorrect");
      await page.locator("#decrypt-backup-form button").click();
      await page.waitForFunction(() =>
        document
          .querySelector("#toast")
          .textContent.includes("Could not unlock"),
      );
      assert.equal(
        await page.evaluate(() => Istiqamah.state.profile.name),
        legacy.profile.name,
      );
      await page
        .locator("#import-passphrase")
        .fill("a private test passphrase");
      await page.locator("#decrypt-backup-form button").click();
      await page.locator("#confirm-import").click();
      await page.waitForFunction(() => !document.querySelector("#modal").open);
      assert.equal(
        await page.evaluate(() => Istiqamah.state.profile.name),
        legacy.profile.name,
      );
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "IndexedDB retains seven daily copies, confirms restore, and keeps an undo checkpoint",
    async () => {
      const { context, page } = await open(legacy);
      await page.evaluate(async () => {
        const { snapshots } = await import("./js/snapshots.js");
        await Istiqamah.storage.snapshot();
        for (let i = 9; i >= 1; i--) {
          const date = Istiqamah.offsetDay(Istiqamah.today(), -i),
            copy = structuredClone(Istiqamah.state);
          copy.profile.name = "Earlier " + i;
          await snapshots.put(date, JSON.stringify(copy));
        }
      });
      assert.equal(
        await page.evaluate(
          async () => (await Istiqamah.storage.snapshots.list()).length,
        ),
        7,
      );
      await settings(page);
      await page.locator('[data-action="restore-days"]').click();
      await page.locator('[data-action="choose-snapshot"]').nth(1).click();
      assert.equal(
        await page.evaluate(() => Istiqamah.state.profile.name),
        legacy.profile.name,
      );
      await page.locator("#confirm-import").click();
      await page.waitForFunction(() =>
        Istiqamah.state.profile.name.startsWith("Earlier"),
      );
      assert(
        (
          await page.evaluate(
            async () => await Istiqamah.storage.snapshots.checkpoints(),
          )
        ).some(
          (row) => JSON.parse(row.data).profile.name === legacy.profile.name,
        ),
      );
      await context.close();
    },
  );
  await check(
    "restore refuses replacement when the undo database fails",
    async () => {
      const { context, page } = await open(legacy);
      const result = await page.evaluate(async () => {
        const { snapshots } = await import("./js/snapshots.js");
        const old = snapshots.checkpoint;
        snapshots.checkpoint = async () => {
          throw Error("quota");
        };
        let rejected = false;
        try {
          await Istiqamah.storage.replace({
            ...structuredClone(Istiqamah.state),
            profile: { ...Istiqamah.state.profile, name: "Must not replace" },
          });
        } catch {
          rejected = true;
        }
        snapshots.checkpoint = old;
        return {
          rejected,
          name: JSON.parse(localStorage.getItem("istiqamah.v1")).profile.name,
        };
      });
      assert.deepEqual(result, { rejected: true, name: legacy.profile.name });
      await context.close();
    },
  );
  await check(
    "new settings controls fit five languages at 390px, and catalogs have identical keys",
    async () => {
      const { context, page, errors } = await open(legacy);
      await settings(page);
      const catalogs = ["en", "ar", "ur", "ml", "hi"].map((language) =>
        JSON.parse(fs.readFileSync(`js/i18n/${language}.json`, "utf8")),
      );
      for (const catalog of catalogs)
        assert.deepEqual(
          Object.keys(catalog).sort(),
          Object.keys(catalogs[0]).sort(),
        );
      for (const language of ["en", "ar", "ur", "ml", "hi"]) {
        await page.locator('[data-profile="language"]').selectOption(language);
        await page.waitForFunction(
          (language) => document.documentElement.lang === language,
          language,
        );
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.locator('[data-action="encrypted-backup"]').click();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
        );
        await page.locator('[data-action="close-modal"]').click();
      }
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "no optional source requests at startup and charts are lazy",
    async () => {
      const context = await browser.newContext();
      const page = await context.newPage(),
        requests = [];
      page.on("request", (request) => requests.push(request.url()));
      await page.goto(base);
      await page.waitForFunction(() => !!window.Istiqamah);
      assert(
        !requests.some((url) => url.includes("raw.githubusercontent.com")),
      );
      assert.equal(await page.evaluate(() => typeof window.Chart), "undefined");
      await page.locator('[data-action="skip-wizard"]').click();
      await page.locator('[data-action="finish-wizard"]').click();
      await page
        .locator('[data-action="nav"][data-id="progress"]')
        .first()
        .click();
      await page.waitForFunction(() => typeof window.Chart === "function");
      assert.equal(await page.locator("canvas").count(), 3);
      await context.close();
    },
  );
  await check(
    "missing religious translations display exact Arabic with a source-language label",
    async () => {
      const { context, page } = await open({
        ...legacy,
        profile: { ...legacy.profile, language: "ml" },
      });
      await page.waitForFunction(() => SOURCE_DATA.hadith.length === 60);
      const result = await page.evaluate(() => ({
        shown: document.querySelector(".hadith-text").textContent,
        source: Istiqamah.hadithService.get().ar,
        verse: document.querySelector(".quran").textContent,
        expected: Istiqamah.quranService.daily().ar,
      }));
      assert.equal(result.shown, result.source);
      assert.equal(result.verse, result.expected);
      await context.close();
    },
  );
  await check(
    "strict validation rejects impossible dates and unsafe nested keys",
    async () => {
      const { context, page } = await open(legacy);
      const result = await page.evaluate(() => {
        let a = structuredClone(Istiqamah.state);
        a.days["2026-02-31"] = { values: {} };
        let b = structuredClone(Istiqamah.state);
        b.profile.extra = JSON.parse('{"__proto__":{"polluted":true}}');
        return [Istiqamah.validate(a), Istiqamah.validate(b)];
      });
      assert.deepEqual(result, [false, false]);
      await context.close();
    },
  );
};
