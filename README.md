# Istiqamah

**Small deeds. Every day. Limitless results.**

A private, local-first Muslim life companion. The application, styles, and application JavaScript are in `index.html`. Small companion files provide installable PWA support, local fonts, libraries, and attributed offline religious content. No login, application backend, AI API, build step, or runtime package installation is required.

## 🤝 Help improve Istiqamah

Istiqamah is free and open source. We hope it becomes sadaqah jariyah for everyone who helps build it. You don't need to be a programmer to contribute:

- **Use it and give feedback:** try it for a week and [share what to improve](../../issues/new/choose).
- **Check the religious content:** report any wrong reference, grade or count with your source. These reports get top priority.
- **Translate:** improve the Arabic, Urdu, Malayalam or Hindi text, or add a new language.
- **Test on your phone:** Android and iPhone reports with screenshots help a lot.
- **Write code:** fix bugs, improve accessibility, or help with v2 (accounts, cloud sync, push notifications).
- **Star ⭐ the repository and share it** with someone who could benefit.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. JazakAllahu khairan 🤲

## Open it

From this directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` on the same computer. Alternatively, serve this directory with any static web server. Use HTTPS for a phone or a deployed site. Do not open a development server to the public Internet.

You can also open `index.html` directly for the basic app. Service workers and phone installation require HTTPS or localhost. Browser storage is scoped to the address you open; export and import a backup when moving between file, localhost, and a deployed address.

## Update an existing localhost copy

A GitHub push does not update a folder you downloaded earlier. Download the latest `main` ZIP and extract it, or run `git pull` in a Git clone. Stop the old Python server, start it from the updated folder using the same port, and reopen the exact same address (`http://localhost:8000/`). Reload once, wait briefly for the new offline worker, then reload again if the old interface remains. Do not clear site data: the personal records belong to the browser origin and survive replacement of application files. Export a backup before switching addresses or ports.

## Install on a phone

Host the **entire directory**, including `vendor/` and `data/`, on an HTTPS static host. Visit it once online and allow the offline cache to finish.

- **Android / Chrome:** browser menu → Install app, or Settings → Install app.
- **iPhone / Safari:** Share → Add to Home Screen → Open as Web App.

After installation, reopen it from the home screen. The app, prayer calculations, Hijri calendar, charts, all bundled readings, and both adhan recordings work offline. Verse recitation streams from EveryAyah when first played and is cached when the browser permits. External commentary links need a connection.

## Save the tracker as a PDF

Open **Progress**, choose a month, then select **Print / Save as PDF**. Alternatively, use the button in Settings. Choose **Save as PDF**, **A4**, **landscape**. The first page is the personalized month tracker, followed by a monthly summary. For large habit lists, the browser may paginate the tracker across additional pages. Buttons and navigation are hidden. This exports the selected month's records, not example data.

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
- JSON backup export, validated import with confirmation before replacement, plan regeneration, re-onboarding, light/dark themes, installable offline shell, and a dedicated print layout.

## Religious content and exact boundaries

Religious text is copied from the requested source datasets, never generated. `data/content.js` bundles 15 curated Quran references in Arabic, English (Abdel Haleem), and Urdu (Fateh Muhammad Jalandhry); 60 thematic Sunan Abi Dawud references with explicit **Sahih or Hasan** source grades and grader names, in three languages; 61 morning/evening adhkar entries from Azkar DB; and 99 names from Names of Allah JSON. Hadith references and grading remain linked to their Sunnah.com pages. Attribution and retrieval details are in `SOURCE-NOTICES.md`.

The names dataset supplies **Arabic meanings only**. Those meanings and the original adhkar remain in Arabic in all interfaces, with a source-language label; this release does not invent English or Urdu religious translations. Quran commentary opens the appropriate Quran.com tafsir page; commentary text is not bundled. There is no in-app tafsir API integration in v1.

`hadithService` exposes the bundled open-data provider and a future server-provider interface. The Sunnah.com provider is inactive until a separately implemented server endpoint exists. No API key is present or requested by this frontend. A future server must keep `X-API-Key` private and enforce the same grade checks. There is no account/cloud-sync/push-notification backend in this version.

Browser notifications and adhan reminders work **only while the app is open**; browsers can suspend background tabs and require an initial tap for audio. Silent is the default. Export the calendar for reminders managed by a calendar application. Devices control vibration and installation availability.

## Privacy and backups

Personal profiles, coordinates, plans, financial entries, children, words, and journals stay in `localStorage`. No analytics, ads, telemetry, geocoding, or remote personal-data requests are included. Fonts, religious data, charts, prayer calculations, and adhan sounds are local assets. Optional Quran refresh and EveryAyah recitation reveal the normal request metadata/IP address to their providers; commentary links open external sites. The promise concerns personal app entries, not network anonymity.

Local browser storage and exported backups are **not encrypted**. Use a trusted device/browser profile. Clearing site data, uninstalling, or private-browsing cleanup can remove records. Export backups regularly and store them privately. Import replaces the current local records only after confirmation. There are no external deletion or account operations.

## Code structure

`index.html` contains independent service objects: `prayerService`, `hijriService`, `hadithService`, `quranService`, `adhkarService`, `storage`, `engine`, and `ui`. This keeps the application portable to a later component/server architecture. `window.Istiqamah` exposes the core services for integration tests. Imported data is shape-checked; user-entered text is escaped before HTML rendering. Dates are stored as local calendar keys in the selected timezone; exported schedule events are converted to UTC, including events close to midnight.

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
- **Cached fonts, data, and adhan audio:** the central daily workflow survives a lost connection without relying on third-party scripts.
- **Moon-sighting and reminder explanations:** makes the calendar's source and browser limitations visible where users need them.

## Validation recorded for this release

A clean `npm ci` and all **23 Chromium browser checks** passed. An actual PDF export was additionally generated and inspected: **two A4 landscape pages** for the default plan. Mobile English, Arabic, Urdu, Malayalam, and Hindi layouts were visually inspected at 390 × 844, with no horizontal overflow. Direct `file://` navigation is blocked by the managed test browser's policy, so the verified opening route is the local static server above. No deployment or environment publication was performed.

## License

The Istiqamah application code is released under the [MIT License](LICENSE). Third-party libraries, fonts, religious texts and audio in `vendor/` and `data/` keep their own licenses and terms, as listed in [SOURCE-NOTICES.md](SOURCE-NOTICES.md).
