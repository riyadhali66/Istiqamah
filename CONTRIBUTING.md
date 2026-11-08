# Contributing to Istiqamah

Assalamu alaikum, and JazakAllahu khairan for wanting to help. Istiqamah is a free, private app that helps Muslims stay consistent in small good deeds every day. Every contribution, big or small, is welcome. We hope it becomes sadaqah jariyah for everyone who takes part.

## Ways to help (no coding needed)

- **Use the app for a week** and tell us what felt confusing, slow or missing.
- **Report bugs**: open an [Issue](../../issues/new/choose) and pick "Bug report".
- **Check religious content**: if a reference, grade, adhkar count or fasting rule looks wrong, open a "Religious content correction" issue. These get top priority.
- **Translations**: improve the Arabic, Urdu, Malayalam or Hindi interface text, or offer a new language.
- **Test on your phone**: Android and iPhone reports, with screenshots, are very valuable.
- **Share it** with someone who could benefit.

## Ways to help (with code)

1. Fork the repository and create a branch: `git checkout -b fix/short-description`.
2. Run the app locally:

   ```sh
   python3 -m http.server 8000
   ```

   Then open `http://localhost:8000`.
3. Run the tests before opening a pull request:

   ```sh
   npm ci
   npx playwright install chromium   # only if Chromium is not installed
   npm test
   ```

4. Open a pull request that explains **what** you changed and **why**. Add screenshots for any visual change.

Look for issues labelled **good first issue** if you are new.

### Code guidelines

- The app is local-first: **no backend, no accounts, no analytics, no ads, no trackers**. Personal data must never leave the device.
- Work in the matching `js/` ES module; per-screen renderers are in `js/ui/`, interface catalogs in `js/i18n/*.json`, and styles in `css/app.css`. There is no build step. `js/app.js` connects events/startup; `js/session.js` contains transient shared state.
- Read [the storage contract](docs/PHASE-1-AUDIT.md) before changing records. Keep `istiqamah.v1` compatible, add migrations deliberately, and back up original bytes before any upgrade. A failed read must never authorize an overwrite.
- Update every language catalog with identical keys. Religious translations require a licensed source; interface translation permission does not cover sacred text.
- Add recovery/offline regression checks to `tests/phase1.cjs` or `tests/browser.cjs`. `npm run test:optional` is a separate network check for explicitly downloaded upstream assets; never commit those assets as test fixtures.
- Keep every new module/JSON/CSS path in `sw.js` so lazy features remain available offline. Use HTTP/HTTPS for ES modules, not direct file opening.
- Escape all user-entered text before rendering it as HTML.
- Every interface string needs all supported languages. Keep RTL layout working for Arabic and Urdu.
- When you change any cached asset, increase the cache version in `sw.js`.
- Keep one change per pull request. Small pull requests are reviewed faster.

## Religious content rules (strict)

These rules protect the trust of every user:

1. **Never generate or paraphrase** Quran, hadith, adhkar or Names of Allah text, whether by hand or with AI. All religious text must be copied from a source listed in [SOURCE-NOTICES.md](SOURCE-NOTICES.md).
2. **Hadith must be graded Sahih or Hasan** in the source data, showing the grade, the grader's name and a link to Sunnah.com.
3. Any new source must be added to `SOURCE-NOTICES.md` with its link, version and license, and its checksum added to `ASSET-SHA256.txt`.
4. Do not add fatwas or rulings. Where personal circumstances matter (zakat, fasting), point users to a qualified scholar.
5. Respect all schools of thought. Do not add content that favours one group over another.

## Licensing

By contributing, you agree that your contribution is released under the project's [MIT License](LICENSE). Third-party content keeps its own license, as listed in `SOURCE-NOTICES.md`.

## Conduct

Be kind, patient and respectful, as our deen teaches us. Give advice sincerely and privately where possible, assume good intentions, and keep discussions focused on improving the app.

## Ramadan and source changes (v1.2.0)

- `js/ramadan.js` owns calendar context, planner, qada and isolated preview records; `js/ramadan-model.js` supplies schema defaults/validation; `js/ui/ramadan.js` renders controls, charts, print and the greeting image.
- All Ramadan day fields belong under `days[date].ramadan`. Never store an exemption reason. Keep qada and financial values off greeting images.
- `data/adhkar.json` is copied from the pinned MIT source in SOURCE-NOTICES. Keep `sourceOrder`, stable IDs and reviewed `legacyKey` aliases. Do not reuse a legacy key for a new/different text. Preserve earlier counters even where no safe mapping exists.
- Run `npm test`; it includes `tests/ramadan.cjs` and the permanent `tests/upgrade.cjs`. The upgrade fixture is the actual Phase 1 commit, not a synthetic worker. Keep that fixture revision until deliberately adding another release boundary.
- For source changes run `npm run test:sources`; for optional audio run `npm run test:optional`. These separate checks need network/curl.
- The `?v=1.2.0` module graph protects upgrades from an existing cache-first worker. Bump dependency/catalog versions together on a future incompatible release, update the SW cache version and include every local lazy file in its install manifest. The worker matches its current cache ignoring the version query and fetches installation assets with `cache: reload`.
- Preview and screenshots must use a fresh synthetic profile. Never publish a real user's records in an image or test fixture.

## Android and static hosting (2.1.1)

- Part 1 starts from merged 2.1.0 (`4941e2b`). Keep web source buildless; `build:web` is an allowlisted copy plus a native-only plugin bridge bundle. Never commit `www/`, generated public assets, Gradle caches, local SDK paths or signing keys.
- Native-only platform helpers live in `js/native-platform.js`, pure notification planning in `js/native-model.js`, lifecycle/integration in `js/native.js`, and Settings UI in `js/ui/native.js`. Web execution must never fetch native plugins or request native permissions. Native execution must never register a worker.
- Keep schema 3. Native notification preferences are additive under `settings.nativeNotifications`, strictly validated and included in existing backups. No localStorage reset and no duplicate migration chain. Current Ramadan records use `ramadanConfig` / `ramadanV3`; the older fields described in the historical 1.2.0 section above are read-only archives. Optional private notes remain optional.
- Notification providers reserve slots 0–4 for prayers, 10–13 for daily habits and 20–21 for Ramadan preparation. Future Friday/Dhul-Hijjah providers can use stable slots 30–99. Reuse the existing prayer/calendar/time-zone functions; do not recalculate religion-specific times in native code. Never attach unresolved-license audio.
- Exact alarms and notification permission are optional. Do not open permission/settings screens automatically on launch or resume. Preserve the explicit explanation and inexact fallback. Reboot restoration comes from the official Local Notifications receiver; weekly horizon refresh requires opening the app.
- Run existing suites plus `npm run test:native`, `npm run test:native-browser`, `npm run test:paths`, `npm run android:sync` and an Android debug build. Test launch, permissions, reboot, battery restrictions, share/file picker and orientation on a physical phone before a public release. Browser mocks are not physical-device certification.
- Browser tests must honor `process.env.CHROMIUM_PATH` with a system/bundled fallback. Never require one developer's hard-coded browser path.
- Cloudflare uses static-only `wrangler.jsonc` (no main/Worker source/build command). Keep `.assetsignore` deny-by-default. Verify `/` and `/Istiqamah/`, including worker scope and offline reloads. Native sources/tests/docs/packages/signing material must not be served as Cloudflare assets.
- Update the current app module graph and SW cache together (2.1.1). Keep historical release fixtures pinned; tests import the current module graph and archive actual previous Git commits for upgrade validation.
- Use pull requests only. Signing/release instructions and phone checks are in `docs/ANDROID.md`; Play Store materials are drafts and do not authorize publishing.

- A prior cache-first worker can ignore version query strings even for the bootstrap. Use a new bootstrap pathname for a new release (`js/boot-2.1.1.js` here), and retain a real upgrade test from merged 2.1.0 so stale startup code cannot run before the waiting-worker update.
