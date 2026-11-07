// Explicit network integration check. No unclear-license data is checked into the test fixtures.
"use strict";
const { chromium } = require("playwright");
const { spawn, execFileSync } = require("node:child_process");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const port = Number(process.env.TEST_PORT || 8766),
  base = `http://127.0.0.1:${port}`;
const server = spawn(
  "python3",
  ["-m", "http.server", String(port), "--bind", "127.0.0.1"],
  { stdio: "ignore" },
);
let browser;
(async () => {
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(base)).ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext(),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => !!window.Istiqamah);
  await page.locator('[data-action="skip-wizard"]').click();
  await page.locator('[data-action="finish-wizard"]').click();
  await page.locator('[data-action="nav"][data-id="settings"]').first().click();
  const sources = await page.evaluate(
    async () => (await import("./js/optional-content.js")).OPTIONAL_SOURCES,
  );
  await page.route(sources.azkar.url, (route) =>
    route.fulfill({ status: 200, body: "changed source" }),
  );
  await page
    .locator('[data-action="download-optional"][data-id="azkar"]')
    .click();
  await page.waitForFunction(() =>
    document
      .querySelector("#toast")
      .textContent.includes("Download unavailable"),
  );
  assert.equal(await page.evaluate(() => SOURCE_DATA.adhkar.length), 0);
  await page.unroute(sources.azkar.url);
  await page.evaluate(() => {
    Istiqamah.getDay().adhkar["morning-1"] = 2;
    Istiqamah.storage.save();
  });
  for (const [id, source] of Object.entries(sources)) {
    const bytes = execFileSync(
      "curl",
      ["--fail", "--location", "--silent", "--show-error", source.url],
      { maxBuffer: 6 * 1024 * 1024 },
    );
    await page.route(source.url, (route) =>
      route.fulfill({
        status: 200,
        body: bytes,
        contentType: id === "azkar" ? "application/json" : "audio/mpeg",
      }),
    );
    await page
      .locator(`[data-action="download-optional"][data-id="${id}"]`)
      .click();
    await page.waitForFunction(
      () =>
        document.querySelector("#toast").textContent ===
        "Download saved for offline use.",
    );
    assert.equal(
      await page.evaluate(
        async (id) =>
          (await (await import("./js/optional-content.js")).readOptional(id))
            .size,
        id,
      ),
      bytes.length,
    );
    console.log(`PASS: explicit ${id} download verified and saved`);
    // Clear the previous status so the next wait proves completion of the next download.
    await page.evaluate(
      () => (document.querySelector("#toast").textContent = ""),
    );
  }
  assert.equal(await page.evaluate(() => SOURCE_DATA.adhkar.length), 61);
  assert.equal(
    await page.evaluate(() => Istiqamah.getDay().adhkar["morning-1"]),
    2,
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(
    () =>
      !!navigator.serviceWorker.controller &&
      !!window.Istiqamah &&
      SOURCE_DATA.adhkar.length === 61,
  );
  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(
    () => !!window.Istiqamah && SOURCE_DATA.adhkar.length === 61,
  );
  assert.equal(
    await page.evaluate(() => Istiqamah.getDay().adhkar["morning-1"]),
    2,
  );
  const audio = await page.evaluate(async () => {
    const m = await import("./js/optional-content.js");
    const url = await m.optionalAudio("makkah");
    return (await (await fetch(url)).arrayBuffer()).byteLength;
  });
  assert(audio > 400000);
  await page.locator('[data-action="nav"][data-id="settings"]').first().click();
  await page.locator('[data-action="remove-optional"]').click();
  await page.waitForFunction(() => SOURCE_DATA.adhkar.length === 0);
  assert.equal(
    await page.evaluate(() => Istiqamah.getDay().adhkar["morning-1"]),
    2,
  );
  assert.equal(
    await page.evaluate(
      async () =>
        !!(await (
          await import("./js/optional-content.js")
        ).readOptional("makkah")),
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: checksum rejection, offline optional content, removal, and preserved counters",
  );
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close();
    server.kill();
  });
