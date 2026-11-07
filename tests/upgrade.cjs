"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path"),
  http = require("node:http"),
  { execFileSync } = require("node:child_process");
module.exports = async ({ browser, check, seed }) => {
  await check(
    "REAL UPGRADE: previous git release + worker + records → current same-origin app → offline",
    async () => {
      const parent = execFileSync(
        "git",
        ["rev-parse", "d142ca93f45fc4e23afc2546b6c3c155ef2a8e61"],
        { encoding: "utf8" },
      ).trim();
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "istiqamah-upgrade-")),
        archive = path.join(dir, "old.tar");
      execFileSync("git", [
        "archive",
        "--format=tar",
        "--output=" + archive,
        parent,
      ]);
      execFileSync("tar", ["-xf", archive, "-C", dir]);
      let root = dir;
      const server = http.createServer((req, res) => {
        let file = path.resolve(
          root,
          "." + new URL(req.url, "http://localhost").pathname,
        );
        if (!file.startsWith(root + path.sep) && file !== root) {
          res.writeHead(403);
          return res.end();
        }
        if (fs.existsSync(file) && fs.statSync(file).isDirectory())
          file = path.join(file, "index.html");
        try {
          res.setHeader(
            "Content-Type",
            {
              ".js": "text/javascript",
              ".html": "text/html",
              ".css": "text/css",
              ".json": "application/json",
              ".svg": "image/svg+xml",
              ".webmanifest": "application/manifest+json",
              ".woff2": "font/woff2",
              ".png": "image/png",
            }[path.extname(file)] || "application/octet-stream",
          );
          res.setHeader("Cache-Control", "no-cache");
          res.end(fs.readFileSync(file));
        } catch {
          res.writeHead(404);
          res.end();
        }
      });
      await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
      const base = `http://127.0.0.1:${server.address().port}`,
        context = await browser.newContext();
      const page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const old = structuredClone(seed);
      old.schemaVersion = 1;
      delete old.ramadan;
      try {
        await context.addInitScript((data) => {
          if (!sessionStorage.getItem("seed")) {
            localStorage.setItem("istiqamah.v1", JSON.stringify(data));
            sessionStorage.setItem("seed", "1");
          }
        }, old);
        await page.goto(base);
        await page.waitForFunction(() => !!window.Istiqamah);
        assert.equal(
          await page.evaluate(() => Istiqamah.state.schemaVersion),
          1,
        );
        await page.evaluate(async () => {
          await navigator.serviceWorker.ready;
        });
        await page.reload();
        await page.waitForFunction(
          () => !!navigator.serviceWorker.controller && !!window.Istiqamah,
        );
        const before = await page.evaluate(() =>
          localStorage.getItem("istiqamah.v1"),
        );
        assert(before);
        root = path.resolve(__dirname, "..");
        await page.reload();
        await page.waitForFunction(
          () => window.Istiqamah?.state.schemaVersion === 2,
        );
        const after = await page.evaluate(() => Istiqamah.state);
        for (const key of Object.keys(old))
          if (key !== "schemaVersion") assert.deepEqual(after[key], old[key]);
        assert.equal(
          await page.evaluate(() =>
            localStorage.getItem("istiqamah.migration.v2"),
          ),
          before,
        );
        await page.waitForFunction(async () =>
          (await caches.keys()).some((k) => k.startsWith("istiqamah-v1-2-")),
        );
        await page.waitForFunction(async () => {
          const names = await caches.keys();
          return !names.some((k) => k.startsWith("istiqamah-v1-1-"));
        });
        await context.setOffline(true);
        await page.reload();
        await page.waitForFunction(
          () =>
            window.Istiqamah?.state.schemaVersion === 2 &&
            SOURCE_DATA.adhkar.length === 50,
        );
        assert.equal(
          await page.evaluate(() => Istiqamah.state.profile.name),
          old.profile.name,
        );
        assert.equal(
          await page.evaluate(() => Istiqamah.validate(Istiqamah.state)),
          true,
        );
        assert.deepEqual(errors, []);
      } finally {
        await context.close();
        await new Promise((resolve) => server.close(resolve));
        fs.rmSync(dir, { recursive: true, force: true });
      }
    },
  );
};
