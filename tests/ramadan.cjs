"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs");
module.exports = async ({ browser, base, check, seed }) => {
  const legacy = structuredClone(seed);
  legacy.schemaVersion = 1;
  delete legacy.ramadan;
  async function open(date = "2027-02-08", extra = {}) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      acceptDownloads: true,
    });
    const page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.clock.install({ time: new Date(date + "T08:00:00+04:00") });
    await context.addInitScript(
      (data) => {
        if (!sessionStorage.getItem("fixture")) {
          localStorage.setItem("istiqamah.v1", JSON.stringify(data));
          sessionStorage.setItem("fixture", "1");
        }
      },
      { ...legacy, ...extra },
    );
    await page.goto(base);
    await page.waitForFunction(
      () => !!window.Istiqamah && SOURCE_DATA.adhkar.length === 50,
    );
    if (await page.locator('[data-action="ramadan-setup-skip"]').isVisible())
      await page.locator('[data-action="ramadan-setup-skip"]').click();
    return { context, page, errors };
  }
  async function setDate(page, date) {
    await page.clock.setFixedTime(new Date(date + "T08:00:00+04:00"));
    await page.evaluate(async () => {
      const { session } = await import("./js/session.js?v=1.2.0");
      session.selectedDate = Istiqamah.today();
      Istiqamah.render();
    });
  }
  async function settings(page) {
    await page
      .locator('[data-action="nav"][data-id="settings"]')
      .first()
      .click();
    await page.locator("#ramadan-mode").waitFor();
  }
  await check(
    "Ramadan dates: preparation, day 1, day 21, calendar Eid and 2 Shawwal",
    async () => {
      const { context, page, errors } = await open("2027-02-05");
      assert(
        (await page.locator("body").innerText()).includes("Ramadan is coming"),
      );
      await setDate(page, "2027-02-08");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().day),
        1,
      );
      assert(await page.locator("#ramadan-home").isVisible());
      assert.equal(await page.locator("[data-ramadan-countdown]").count(), 2);
      const clocks = await page.evaluate(() =>
        Istiqamah.ramadanService.countdowns().map((c) => c.seconds),
      );
      assert(clocks.every((s) => s > 0 && s < 86400));
      await setDate(page, "2027-02-28");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().day),
        21,
      );
      assert(await page.locator(".odd-night").isVisible());
      assert(
        (await page.locator(".ramadan-night").innerText()).includes("3513"),
      );
      await setDate(page, "2027-03-09");
      assert(await page.locator("#eid-summary").isVisible());
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().active),
        false,
      );
      await setDate(page, "2027-03-10");
      assert(
        (await page.locator("#eid-summary").innerText()).includes(
          "six days of Shawwal",
        ),
      );
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "manual 30-day month, ±1 moon adjustment, manual start/end and late-evening odd night",
    async () => {
      const { context, page } = await open();
      await settings(page);
      await page.locator("#ramadan-adjustment").selectOption("-1");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().active),
        false,
      );
      await page.locator("#ramadan-adjustment").selectOption("1");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().day),
        2,
      );
      await page.locator("#ramadan-adjustment").selectOption("0");
      await page.locator("#ramadan-mode").selectOption("on");
      await setDate(page, "2027-03-09");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().day),
        30,
      );
      await settings(page);
      await page.locator("#ramadan-mode").selectOption("off");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().active),
        false,
      );
      await page.locator("#ramadan-mode").selectOption("auto");
      await setDate(page, "2027-02-27");
      await page.clock.setFixedTime(new Date("2027-02-27T20:00:00+04:00"));
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.night().number),
        21,
      );
      await context.close();
    },
  );
  await check(
    "khatm recalculates exact remaining pages and gentle catch-up for all four goals",
    async () => {
      const { context, page } = await open("2027-02-18");
      for (const goal of [0.5, 1, 2, 3]) {
        const p = await page.evaluate((goal) => {
          const s = Istiqamah.ramadanService;
          s.config().goal = goal;
          return s.planner();
        }, goal);
        assert.equal(p.target, 604 * goal);
        assert.equal(p.perDay, Math.ceil((604 * goal - p.read) / p.days));
        assert(p.behind);
      }
      await page.evaluate(() => {
        let s = Istiqamah.ramadanService;
        s.config().goal = 1;
        s.update("pages", 604);
      });
      const p = await page.evaluate(() => Istiqamah.ramadanService.planner());
      assert.equal(p.remaining, 0);
      assert.equal(p.perDay, 0);
      assert.equal(p.perPrayer, 0);
      assert.equal(p.behind, false);
      await context.close();
    },
  );
  await check(
    "two-step setup, daily checklist, private qada, paused streak and correction",
    async () => {
      const { context, page, errors } = await open();
      await page.locator('[data-action="ramadan-setup"]').click();
      await page.locator("#ramadan-goal").selectOption("0.5");
      await page.locator("#ramadan-taraweeh").selectOption("home");
      await page.locator('[data-action="ramadan-setup-next"]').click();
      await page.locator("#ramadan-sadaqah").fill("5");
      await page.locator('[data-ramadan="setupNotFasting"]').check();
      await page.locator('[data-action="ramadan-setup-next"]').click();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        1,
      );
      await page.locator('[data-ramadan="fasted"]').check();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        0,
      );
      await setDate(page, "2027-02-09");
      await page.locator('[data-ramadan="notFasting"]').check();
      await setDate(page, "2027-02-10");
      await page.locator('[data-ramadan="fasted"]').check();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.summary().best),
        2,
      );
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        1,
      );
      await page.reload();
      await page.waitForFunction(() => !!window.Istiqamah);
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        1,
      );
      await setDate(page, "2027-03-10");
      await page
        .locator('[data-action="nav"][data-id="tools"]')
        .first()
        .click();
      await page.locator('[data-action="tool"][data-id="ramadan"]').click();
      await page.locator('[data-action="qada-done"]').click();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        0,
      );
      await page.locator('[data-action="qada-undo"]').click();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        1,
      );
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "historical Today date edits correct Ramadan records and qada without changing the real clock",
    async () => {
      const { context, page } = await open("2027-02-10");
      await page.locator("#day-picker").fill("2027-02-09");
      await page.locator("#day-picker").dispatchEvent("change");
      await page.locator('[data-ramadan="notFasting"]').check();
      assert.equal(
        await page.evaluate(
          () => Istiqamah.state.days["2027-02-09"].ramadan.notFasting,
        ),
        true,
      );
      assert.equal(await page.evaluate(() => Istiqamah.today()), "2027-02-10");
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        1,
      );
      await page.locator('[data-ramadan="notFasting"]').uncheck();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.qada().remaining),
        0,
      );
      await context.close();
    },
  );
  await check(
    "fitr calculation, 30 cells, charts, one-page print and non-sensitive Eid PNG",
    async () => {
      const { context, page, errors } = await open("2027-02-28");
      await page.locator('[data-ramadan="fitrAmount"]').fill("20");
      await page.locator('[data-ramadan="fitrAmount"]').blur();
      await page.locator('[data-ramadan="fitrPeople"]').fill("4");
      await page.locator('[data-ramadan="fitrPeople"]').blur();
      assert((await page.locator("body").innerText()).includes("Total: 80"));
      await page.locator('[data-action="ramadan-details"]').click();
      await page.locator(".ramadan-heatmap").waitFor();
      assert.equal(await page.locator(".ramadan-heatmap > div").count(), 30);
      await page.waitForFunction(() => typeof window.Chart === "function");
      assert(await page.locator("#ramadan-chart").isVisible());
      await page.evaluate(() => (window.print = () => (window.printed = true)));
      await page.locator('[data-action="ramadan-print"]').click();
      assert.equal(await page.locator("#print-area .print-page").count(), 1);
      assert(await page.evaluate(() => window.printed));
      await setDate(page, "2027-03-09");
      await page
        .locator('[data-action="nav"][data-id="today"]')
        .first()
        .click();
      const event = page.waitForEvent("download");
      await page.locator('[data-action="eid-share"]').click();
      const file = await event;
      const bytes = fs.readFileSync(await file.path());
      assert.equal(bytes.subarray(1, 4).toString(), "PNG");
      assert(!bytes.includes(Buffer.from(legacy.profile.name)));
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "preview at day 30 and Eid never changes real records or qada",
    async () => {
      const { context, page } = await open("2026-11-08");
      const before = await page.evaluate(() => JSON.stringify(Istiqamah.state));
      await settings(page);
      await page
        .locator("details")
        .filter({ has: page.locator("#ramadan-preview") })
        .locator("summary")
        .click();
      await page.locator("#ramadan-preview").selectOption("30");
      await page.locator('[data-ramadan="notFasting"]').check();
      await page.locator('[data-ramadan="pages"]').fill("10");
      await page.locator('[data-ramadan="pages"]').blur();
      assert.equal(
        await page.evaluate(() => Istiqamah.ramadanService.context().day),
        30,
      );
      assert.equal(
        await page.evaluate(() => JSON.stringify(Istiqamah.state)),
        before,
      );
      await page.evaluate(() => {
        Istiqamah.ramadanService.preview("31");
        Istiqamah.render();
      });
      assert(await page.locator("#eid-summary").isVisible());
      await page.locator('[data-action="ramadan-preview-off"]').click();
      assert.equal(
        await page.evaluate(() => JSON.stringify(Istiqamah.state)),
        before,
      );
      await context.close();
    },
  );
  await check(
    "Ramadan English, Arabic, Urdu, Malayalam and Hindi fit 390px in both themes",
    async () => {
      const { context, page, errors } = await open("2027-02-28");
      for (const lang of ["en", "ar", "ur", "ml", "hi"])
        for (const theme of ["light", "dark"]) {
          await settings(page);
          await page.locator('[data-profile="language"]').selectOption(lang);
          await page.waitForFunction(
            (l) => document.documentElement.lang === l,
            lang,
          );
          await page.locator("#theme-select").selectOption(theme);
          await page
            .locator('[data-action="nav"][data-id="today"]')
            .first()
            .click();
          assert.equal(
            await page.evaluate(
              () => document.documentElement.scrollWidth > innerWidth,
            ),
            false,
          );
          assert.equal(
            await page.locator("html").getAttribute("dir"),
            ["ar", "ur"].includes(lang) ? "rtl" : "ltr",
          );
        }
      assert.deepEqual(errors, []);
      await context.close();
    },
  );
  await check(
    "real schema 1 migrates to 2 with original bytes, no old-field changes and idempotence",
    async () => {
      const { context, page } = await open("2026-11-08");
      const result = await page.evaluate(async () => {
        const { migrate } = await import("./js/storage.js?v=1.2.0");
        return {
          state: Istiqamah.state,
          original: localStorage.getItem("istiqamah.migration.v2"),
          idempotent:
            JSON.stringify(migrate(Istiqamah.state)) ===
            JSON.stringify(migrate(migrate(Istiqamah.state))),
        };
      });
      assert.equal(result.original, JSON.stringify(legacy));
      assert.equal(result.state.schemaVersion, 2);
      for (const key of Object.keys(legacy))
        if (key !== "schemaVersion")
          assert.deepEqual(result.state[key], legacy[key]);
      assert(result.idempotent);
      await context.close();
    },
  );
  await check(
    "bundled adhkar has exact licensed source fields and safe stable counter aliases",
    async () => {
      const { context, page } = await open("2026-11-08");
      const entries = await page.evaluate(() => SOURCE_DATA.adhkar);
      assert.equal(entries.length, 50);
      assert(
        entries.every((e) => e.text && e.en && e.reference && e.count > 0),
      );
      const aliases = entries.map((e) => e.legacyKey).filter(Boolean);
      assert.equal(new Set(aliases).size, aliases.length);
      await page.evaluate(() => {
        Istiqamah.getDay().adhkar["morning-14"] = 2;
        Istiqamah.state.tasbih.selected = "morning-14";
        Istiqamah.storage.save();
      });
      await page
        .locator('[data-action="nav"][data-id="tools"]')
        .first()
        .click();
      await page.locator('[data-action="tool"][data-id="tasbih"]').click();
      assert(
        (await page.locator("#tasbih-adhkar").innerText()).includes(
          "Earlier counter progress",
        ),
      );
      assert.equal(await page.locator(".tasbih-button").innerText(), "2");
      assert(await page.locator(".tasbih-button").isDisabled());
      await context.close();
    },
  );
};
