# Istiqamah

**Small deeds. Every day. Limitless results.**

**2.1.0 — combined Phase 1 + Phase 2.** This branch replaces PR #2 on top of current main; it does not deploy or change main until reviewed and merged.

### 🌐 Try it now: **[riyadhali66.github.io/Istiqamah](https://riyadhali66.github.io/Istiqamah/)**

Free, with no login and no ads. Works offline after the first visit. Available in English, العربية, اردو, മലയാളം and हिन्दी.

A private, local-first Muslim life companion. The entry HTML, readable ES modules in `js/`, and styles in `css/app.css` have no build step. Small companion files provide installable PWA support, local fonts, libraries, and attributed offline religious content. No login, application backend, AI API, build step, or runtime package installation is required.

## 🤝 Help improve Istiqamah

Istiqamah is free and open source. We hope it becomes sadaqah jariyah for everyone who helps build it. You don't need to be a programmer to contribute:

- **Use it and give feedback:** try it for a week and [share what to improve](../../issues/new/choose).
- **Check the religious content:** report any wrong reference, grade or count with your source. These reports get top priority.
- **Translate:** improve the Arabic, Urdu, Malayalam or Hindi text, or add a new language.
- **Test on your phone:** Android and iPhone reports with screenshots help a lot.
- **Write code:** fix bugs, improve accessibility, or help with future accounts, cloud sync and push notifications.
- **Star ⭐ the repository and share it** with someone who could benefit.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. JazakAllahu khairan 🤲

## Review this combined branch

This PR branch is `integrate-phase1-phase2-2.1`. Before merge, download [this branch ZIP](https://github.com/riyadhali66/Istiqamah/archive/refs/heads/integrate-phase1-phase2-2.1.zip), not the older main ZIP. Serve the entire extracted directory over HTTP/HTTPS and confirm version **2.1.0**. The live site remains on main until this replacement PR is reviewed and merged.

## Open it

From this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` on the same computer. Alternatively, serve this directory with any static web server. Use HTTPS for a phone or a deployed site. Do not open a development server to the public Internet.

ES modules require a static HTTP server; direct `file://` opening is no longer supported. Service workers, encryption and phone installation require HTTPS or localhost. Browser storage is scoped to the address you open; export and import a backup when moving between file, localhost, and a deployed address.

## Update an existing localhost copy

A GitHub push does not update a folder you downloaded earlier. Download the latest `main` ZIP and extract it, or run `git pull` in a Git clone. Stop the old Python server, start it from the updated folder using the same port, and reopen the exact same address (`http://localhost:8000/`). Reload once, wait briefly for the new offline worker, then reload again if the old interface remains. Do not clear site data: the personal records belong to the browser origin and survive replacement of application files. Export a backup before switching addresses or ports.

## Install on a phone

The app is live at **https://riyadhali66.github.io/Istiqamah/**, deployed with GitHub Pages from the `main` branch.

1. **Open the link on your phone:** use **Google Chrome** on Android or **Safari** on iPhone.
2. **Install it:**
   - **Android (Chrome):** tap the **three dots (⋮)** at the top right → **Install app** (or **Add to Home Screen**).
   - **iPhone (Safari):** tap the **Share** icon (square with an up arrow) at the bottom → **Add to Home Screen**.
3. **Open Istiqamah from your home screen.** It opens full-screen with no address bar. Choose your language (English, العربية, اردو, മലയാളം or हिन्दी) in the setup wizard or later in **Settings**.

Stay online the first time you open it, so the offline cache can finish. After that, the app works offline.

To host your own copy, serve the **entire directory**, including `vendor/` and `data/`, from any HTTPS static host.

After installation, reopen it from the home screen. The app, prayer calculations, Hijri calendar, charts and all licensed bundled readings work offline. All 113 permitted Azkar DB entries are bundled. The two adhan recordings and Uthmani font remain absent from the distribution and install cache; they are separate credited, hash-verified Settings downloads. The default font is the bundled SIL OFL Amiri. Removing optional downloads retains all bundled adhkar and saved counters. Verse recitation streams from EveryAyah when first played and is cached when the browser permits. External commentary links need a connection.

## Save the tracker as a PDF

Open **Progress**, choose a month, then select **Print / Save as PDF**. Alternatively, use the button in Settings. Choose **Save as PDF**, **A4**, **landscape**. The first page is the personalized month tracker, followed by a monthly summary. For large habit lists, the browser may paginate the tracker across additional pages. Buttons and navigation are hidden. This exports the selected month's records, not example data.

## Phase 2 — Ramadan Mode and the offline adhkar library

[Desktop preview](docs/screenshots/ramadan-desktop.png) · [Mobile preview](docs/screenshots/ramadan-mobile.png). These screenshots use isolated test data and a simulated Ramadan date.

### Enable Ramadan Mode

Open **Settings → Ramadan Mode**, enable it, and save. The Today switch appears during Ramadan or while the mode is enabled. Outside the selected Ramadan dates, the mode waits and the ordinary plan remains visible; the dashboard does not pretend that the current day is Ramadan.

The default season uses the existing Umm al-Qura table. If your community announces another start date, enter **Local start date** and the announced **29 or 30 day month length**. A local override is specific to that season; clear or update it for the next year. The dashboard identifies the calendar, start date, and adjustment. Historical day records retain their original calendar information.

The dashboard adds fasting status, actual Quran pages and their target, optional Taraweeh/charity/adhkar/family goals, local Fajr/Maghrib times, and the relevant countdown. Suhoor/iftar **preparation** offsets are personal settings, not extra fasting deadlines or an obligatory imsak time. Their schedule blocks are included in calendar exports with exact instants, even across midnight. Preparation notifications are handled by the exported calendar; the existing in-app notification limitations still apply.

The optional last-ten-nights planning panel appears from Ramadan day 21, whether the selected season ends after 29 or 30 days. Goals and notes are optional. This is a calendar-based planning aid, not a claim about a particular night's religious status.

**Not fasting today** excludes the fasting habit. **Pause tracking** excludes all Ramadan overlay habits. Those paused habits do not lose their streaks, and reasons are optional private notes. Existing prayer/fasting pause controls remain available. Turning off the mode restores today's regular plan while keeping recorded Ramadan values, notes, and historical snapshots. No financial donation amount, health diagnosis, fasting eligibility decision, or religious ruling is inferred.

### Quran completion planning

Enter remaining pages and a completion date today or later. Days are inclusive: 60 pages over five remaining days starts at 12 pages/day. Subsequent days subtract pages recorded since the plan's starting date and divide the remaining pages by the remaining days, rounded up. Today's completed pages are entered separately. Targets are optional planning aids, not prescribed worship amounts.

Changing the plan updates today's and future targets; completed past days keep their own target snapshots. Each ordinary-plan Quran record remains separate from the Ramadan overlay. A plan with an expired deadline produces no new completion target until it is updated.

### The expanded adhkar library

**My toolkit → Tasbih** contains General remembrance, Morning, Evening, After prayer, Before sleep, Upon waking, Entering/leaving home, Eating/drinking, Travel, and Forgiveness/supplication. Search Arabic with or without vowel marks, or search category/reference text. Favorites and personal counting goals are saved locally.

All 113 texts are copied verbatim from the inspected Azkar DB source, with original references and source provenance. There are no generated religious translations. **52 entries have no structured repetition-count field**; the complete original text remains visible, and any numeric goal entered for those entries is explicitly personal. An embedded instruction in the Arabic text is not replaced by an invented numeric default. Empty references are labeled as not supplied by the source. The previously named Hisn Al Muslim source was inspected but contributes no newly bundled text because its inspected repository supplies no clear reuse terms.

Daily counts use content-derived stable IDs, not array positions. Next/previous uses the current filtered list. Reset affects only the selected entry. Morning/evening entries share their counts with Reflections, and free counting remains independent. Entries outside the active filter can stay selected without losing their counts.

### One migration chain and recovery

The authoritative key stays `istiqamah.v1`. The pipeline is **legacy → outer `schemaVersion: 1` → additive `phase2.schemaVersion: 2` records**. `js/storage.js` alone controls persistence. `js/phase2-state.js` supplies pure transforms and validation; feature initialization never performs a second migration or writes around storage's guards.

Before *either* transform runs, `storage.load()` validates the old structure and durably saves its **exact original bytes**. The first copy is `istiqamah.migration.v1`; it is read back and verified. If an earlier original is already present, the current original bytes must be committed and read back from a separate IndexedDB checkpoint. A thrown write, silent no-op, blocked/unavailable IndexedDB, or a stale concurrent active record prevents the upgrade. Recovery blocks ordinary saves and never replaces unreadable/future-schema data with onboarding defaults.

The chain accepts legacy state from `964ba52`, Phase 1 schema-1 state, and Phase 2 state from `fd79768`, including Ramadan snapshots, notes, favorites, stable IDs, and positional counters. Positional keys and selected dhikr IDs are mapped through the existing 61-entry manifest. Stable counts, including zero, take precedence; compatibility aliases remain synchronized. Pure migration and repeated loads are idempotent. Existing regular-plan snapshots remain separate from Ramadan snapshots.

Phase 1's stale-tab comparison, encrypted backups and **seven IndexedDB daily copies** remain. Plain and encrypted file imports validate/authenticate first, retain the current exact undo bytes and imported original bytes, then migrate and replace only after all required copies succeed. Passphrases and derived keys are never persisted. The encrypted envelope and exact decrypted JSON can be retained as separate local import checkpoints; local copies remain unencrypted unless the checkpoint itself is an encrypted envelope. Original/undo copies are available through the recovery UI.

### Update a downloaded copy safely

1. In the currently working app, **Settings → Export backup**.
2. Download the latest GitHub ZIP (or run `git pull`). Extract/copy the **entire** app: include `index.html`, `sw.js`, and the complete `js/`, `css/`, `data/`, and `vendor/` directories. Replacing only `index.html` is insufficient.
3. Stop the old static server and start it from the updated directory using the same address, port, and browser profile. For the previous setup, reopen exactly **`http://localhost:8000/`**.
4. Reload, allow the updated worker to activate, and reload again if needed. **Settings → Install app → Check for updates** also checks and reloads. Confirm **Istiqamah 2.1.0** in the footer or Ramadan settings badge.
5. Do **not** clear site data. If you move to another address, port, device, or a different direct-file location, import the exported backup in that new origin.

This combined version uses ES modules and needs HTTP/HTTPS; direct `file://` opening is not supported. On Windows use `py -m http.server 8000` if the Python launcher is installed, or use the hosted site after this PR is merged/deployed. The existing hosted site can be used without installing Python. Its deployment must finish before it can show the new version.

New feature assets carry versioned URLs, and installation fetches fresh shell files. The worker prefers fresh online HTML and retains an offline fallback. Future code/data releases must increment both the asset URL version and service-worker cache version when those assets change.

## What works

- Eight skippable onboarding steps; English, Arabic, Urdu, Malayalam, and Hindi interfaces (with RTL layout for Arabic/Urdu and LTR for English/Malayalam/Hindi); ranked goals, individual goal descriptions, children, work situation, struggles, faith practices, daily rhythm, optional debts, and three commitment levels.
- Local rule-based plans for debt repayment, business development, job searching, study, health, language learning, parenting, stress, sleep, and faith. The five prayers have separate check-ins and count as one habit group when describing commitment levels. Gentle has five groups, Balanced ten, and Full power at least fifteen groups.
- Local Adhan JS prayer calculations using city presets, manually entered coordinates, or optional device geolocation; country-appropriate method suggestions, Shafi/Hanafi Asr, explicit IANA timezone, and next-prayer countdown. No location is transmitted to a prayer API.
- Daily numeric and checkbox habits, water glasses, mood and stress, journal entries, prayer/fasting pauses, weighted scores, actual streaks, and optional habit suggestions after seven active days. Prayer weights are three times ordinary habits. Scores use capped completion ratios. Paused prayer/fasting habits are excluded, and paused prayer days preserve existing prayer streaks.
- Editable, addable, removable habits; reorder controls; historical habit snapshots; editable schedule block labels and times, additional blocks, and removal. Schedule order follows the selected times; prayer blocks continue to follow actual prayer calculations.
- Multiple months, a real calendar-length heatmap, five weekly summaries, line/radar/mood-sleep charts, milestones, monthly reviews, and next-month goals. Empty history is shown as empty rather than simulated achievements. Week 5 includes all remaining days after day 28.
- Debt balances, payment histories with overpayment checks, savings goals, gold-based nisab and zakat estimates.
- Tasbih with a morning/evening adhkar picker, complete Arabic source text and references, automatic source repetition targets, next-dhikr navigation, and daily counts shared with Reflections; free counting retains 33/100 milestones, optional vibration and a linked faith habit; morning/evening adhkar with original repeat counts; fasting calendar, White Days, Ashura, Arafah, six Shawwal days, and next-day fasting prompts. Eid days and the days of Tashriq cannot be marked through the optional fasting calendar; Ramadan does not receive voluntary-fasting suggestions. Local moon-sighting dates can differ from Umm al-Qura. Arafah advice is for non-pilgrims; consult a scholar about your own circumstances.
- Individual child star charts, Quran minutes, and parent-set rewards; word log and reveal/review cards; a 25-minute focus timer; calendar exports for one or seven days with UTC timestamps and five-minute reminders.
- Plain JSON and optional encrypted backup export, validated legacy/encrypted import with confirmation and an undo copy before replacement, seven daily local safety copies, plan regeneration, re-onboarding, light/dark themes, installable offline shell, and a dedicated print layout.

## Religious content and exact boundaries

Religious text is copied from the requested source datasets, never generated. The `data/*.json` files bundle 15 curated Quran references in Arabic, English (Abdel Haleem), and Urdu (Fateh Muhammad Jalandhry); 60 thematic Sunan Abi Dawud references with explicit **Sahih or Hasan** source grades and grader names, in three languages; 99 names from Names of Allah JSON. Hadith references and grading remain linked to their Sunnah.com pages. Attribution and retrieval details are in `SOURCE-NOTICES.md`.

Azkar DB is bundled as 113 source-preserved entries in ten categories under the explicit reuse grant in its README. Structured repetition counts remain nullable, and absent references are labeled honestly. The names dataset supplies **Arabic meanings only**. Those meanings and the original adhkar remain in Arabic in all interfaces, with a source-language label; this release does not invent English or Urdu religious translations. Quran commentary opens the appropriate Quran.com tafsir page; commentary text is not bundled. There is no in-app tafsir API integration in v1.

`hadithService` exposes the bundled open-data provider and a future server-provider interface. The Sunnah.com provider is inactive until a separately implemented server endpoint exists. No API key is present or requested by this frontend. A future server must keep `X-API-Key` private and enforce the same grade checks. There is no account/cloud-sync/push-notification backend in this version.

Browser notifications and adhan reminders work **only while the app is open**; browsers can suspend background tabs and require an initial tap for audio. Silent is the default. Export the calendar for reminders managed by a calendar application. Devices control vibration and installation availability.

## Privacy and backups

Personal profiles, coordinates, plans, financial entries, children, words, and journals stay in `localStorage`. No analytics, ads, telemetry, geocoding, or remote personal-data requests are included. Fonts, bundled religious data, charts and prayer calculations are local assets. Adhkar/adhan downloads contact GitHub only after an explicit tap; downloaded files stay in local IndexedDB. Optional Quran refresh and EveryAyah recitation reveal the normal request metadata/IP address to their providers; commentary links open external sites. The promise concerns personal app entries, not network anonymity.

Local browser storage, automatic safety copies and plain JSON exports are **not encrypted**. Settings → Export encrypted backup protects that exported file using AES-256-GCM and a PBKDF2-SHA256 key (310,000 iterations) with a unique random salt and nonce. Use at least 12 characters and store the passphrase separately; it cannot be recovered. Settings → Import backup accepts either format and asks for the encrypted file’s passphrase. Use a trusted device/browser profile. Clearing site data, uninstalling, or private-browsing cleanup can remove records. Export backups regularly and store them privately. Import/restore replaces current local records only after confirmation and a successful undo checkpoint. Settings → Restore a previous day lists seven recent active-day copies and recent undo/migration copies. Dates when the app was closed have no new snapshot. There are no external deletion or account operations.

## Code structure

- `index.html`: semantic shell, local vendor loaders and `js/app.js` module entry.
- `css/app.css`: calm responsive light/dark styles.
- `js/prayer.js`, `hijri.js`, `quran.js`, `hadith.js`, `adhkar.js`: existing services.
- `js/config.js`, `dates.js`, `engine.js`, `records.js`: defaults, calendar keys, plans and scoring.
- `js/storage.js`, `snapshots.js`, `backup-crypto.js`: compatible persistence, migration, undo/daily copies and encrypted files.
- `js/content.js`, `optional-content.js`: lazy licensed readings and explicit optional downloads.
- `js/ramadan.js`, `adhkar-library.js`, `phase2-state.js`: Ramadan planning, stable counters and the pure feature migration step.
- `js/ui/ramadan.js`, `ui/adhkar-library.js`, `phase2-events.js`: feature rendering and event wiring; no separate root Phase 2 bundle.
- `js/ui/`: one renderer per screen, common controls, onboarding, charts and backup/download workflows.
- `js/i18n/{en,ar,ur,ml,hi}.json`: interface catalogs with identical keys; Arabic and Urdu use RTL.
- `js/app.js`: startup and event wiring; `js/session.js`: transient shared session state.
- `tests/browser.cjs`, `tests/phase1.cjs`: offline, recovery and regression checks; `tests/optional.cjs`: separate upstream-download integration.

`window.Istiqamah` retains the existing service/test interface. Personal data stays under `istiqamah.v1`, with `version: 1` retained and `schemaVersion: 1` added. The original bytes are backed up under `istiqamah.migration.v1` **before** upgrading. Unknown/corrupt records enter recovery and cannot be overwritten by ordinary saves. See [the audit and complete storage contract](docs/PHASE-1-AUDIT.md).

`sw.js` caches the complete shell and bundled data. Increment its cache version when shipping changed assets; reload after the new worker is installed. Online page reloads request fresh HTML and update the cached offline copy. Settings → Install app → Check for updates also checks the worker and reloads. Offline personal data persists independently of the shell cache.

## Development and tests

Node 18+ and Python 3 are sufficient. The application itself needs neither npm nor Node.

```sh
npm ci
# If Chromium is not already installed:
npx playwright install chromium
npm test
```

Tests use `/usr/bin/chromium` when present, or Playwright's installed Chromium. Set `CHROMIUM_PATH` to override. The runner starts its own local static server on port 8765 (override with `TEST_PORT`) and uses a fresh browser profile, leaving personal browser data untouched. It checks onboarding, personalization, prayer/timezone calculations, scoring, pauses, historical snapshots, escaping, debts, zakat, words, children, tasbih, adhkar, fasting dates, ICS downloads, backups, print pages, translations, mobile overflow, source completeness, and offline reloads.

## Added to fill practical gaps

- **Explicit timezone and manual coordinates:** makes location permission optional and keeps prayer times consistent when exporting calendars.
- **Historical habit snapshots:** changing a target today does not rewrite an earlier month's score.
- **Input validation, payment limits, and import confirmation:** protects existing records from malformed backups and accidental replacement.
- **Focus timer and recorded Quran minutes for children:** turns study and family intentions into measurable daily actions.
- **Cached licensed fonts/data and separate optional downloads:** the central daily workflow survives a lost connection without third-party scripts.
- **Moon-sighting and reminder explanations:** makes the calendar's source and browser limitations visible where users need them.

## Combined validation

`npm test` runs all inherited browser/Phase 1 checks, integration recovery cases, the Phase 2 suite, and real historical upgrades. The current result is **55 checks passed**: 38 browser/storage checks, 15 Phase 2 checks, and two real upgrade scenarios. `npm run test:optional` additionally verifies all four explicit optional downloads (original Azkar source, Makkah/Mishary recordings, and Uthmani font), rejects altered bytes, and checks offline use/removal with counters preserved.

`tests/upgrades.cjs` stages the actual tracked application from **964ba52** and **fd79768**, installs its original service worker, saves counters/journals (and Ramadan/favorites for fd79768), proves the old app works offline, then deploys the current files. It verifies exact original-byte backup, both schema layers, preserved values, an IndexedDB daily copy, offline restart, and removal of retired assets from caches. Historical audio/font files are extracted only into temporary test deployments from existing Git history; they are not reintroduced into the repository or distribution. A full Git history containing those commits and `tar` are required for these two tests.

Phase 1's historical Lighthouse measurements remain in its audit/history; they are not new 2.1.0 performance measurements. The app still has no build step, account, server API, analytics, or background push service.

## Screenshots

Current Chromium captures at 390 × 844 (sample profile):

| Today | Arabic RTL | Dark mode | Encrypted backup |
| --- | --- | --- | --- |
| ![Today](docs/screenshots/today-mobile.png) | ![Arabic RTL](docs/screenshots/today-arabic.png) | ![Dark mode](docs/screenshots/today-dark.png) | ![Encrypted backup](docs/screenshots/encrypted-backup.png) |

## Safely release and test on a phone

1. Export a backup from the current live app before releasing. Keep the GitHub Pages origin/path unchanged so existing browser storage remains available.
2. Review and merge the combined 2.1.0 pull request when ready; do not deploy either conflicting phase independently. GitHub Settings → Pages should continue to deploy from **main / (root)**; serve the entire repository, including `js/`, `css/`, `data/` and `vendor/`. No build or backend setup is required.
3. On your phone, open the existing live URL in Chrome (Android) or Safari (iPhone). Settings → Check for updates, then reopen the app. Do not clear site data. Confirm the same name, habits and history are present; the schema upgrade is automatic.
4. In Settings, export an encrypted backup, then import it using its passphrase. Confirm only after reviewing the replacement notice. Open Restore a previous day and verify a safety copy is listed.
5. Wait for “Offline app cached”, turn on airplane mode, reopen, log one habit and view Progress. Try Arabic/Urdu and dark mode. Bundled adhkar work offline immediately after caching; optional recordings/font require a separate explicit download.
6. No Supabase, Vercel, API keys or account settings are needed for 2.1.0. It adds no sync and no real background push notifications.

## License

The Istiqamah application code is released under the [MIT License](LICENSE). Third-party libraries, fonts, religious texts and audio in `vendor/` and `data/` keep their own licenses and terms, as listed in [SOURCE-NOTICES.md](SOURCE-NOTICES.md).
