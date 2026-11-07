# Phase 2: storage, content and calendar boundaries

## Storage and upgrade

Personal data stays under `istiqamah.v1`, with `version: 1` retained and `schemaVersion: 2` added. Missing/1 schemas migrate through the existing validated import/load path. Before upgrading the active key, `istiqamah.migration.v2` receives the **exact original bytes**; the earlier v1 backup is untouched. If that v2 key already contains a different copy, a separate IndexedDB checkpoint must succeed before replacement. A backup failure enters recovery and prevents overwriting the active record. Migration is idempotent. Legacy file backups remain importable through the same migration.

New top-level `ramadan` defaults: `{mode:'auto', adjustment:0, manualStart:'', manualEnd:'', goal:1, taraweeh:'home', dailySadaqah:0, setupYear:0, qadaPaid:0, fitrAmount:0, fitrPeople:1}`. No exemption reason exists in the schema or controls. A day edited during Ramadan has `days[date].ramadan` with `season`, `day`, checkbox fields (`fasted`, `notFasting`, `suhoor`, `taraweeh`, `dua`, `feed`, `nightPrayer`, `itikaf`) and numeric `pages`/`sadaqah`. Fasted/notFasting are mutually exclusive.

Qada is derived from the count of saved `notFasting` flags across seasons minus `qadaPaid`, clamped at zero. Correcting a day automatically updates it. Make-up logging and its undo are offered after Ramadan. This is a personal record, not a determination of religious obligation; the interface directs users to a qualified scholar.

The old day's fields, including adhkar keys, are not rewritten by migration. The UI may create a new current-day record when opening the app, as in prior releases. Validation covers the new root/day data as well as existing fields. Local daily safety copies and local records remain unencrypted; optional encrypted export protects its file.

## Counter compatibility

`data/adhkar.json` contains 26 morning and 24 evening rows derived from 34 source rows. Its `text`, `en`, `count`, `reference`, and `description` are exact source fields; source `order` and morning/evening `type` are retained as provenance. Source rows applicable to both periods are copied into each list without changing sacred text.

Reviewed equivalent entries use explicit `legacyKey` aliases, so an old `morning-N`/`evening-N` count is still read and incremented under its original key. Different or combined entries get independent stable `seen-period-sourceOrder` IDs. The old source's separately counted combined supplications are not guessed into the new combined text. All earlier positive numeric counts remain visible under Reflections → Earlier counter progress. An unmatched saved tasbih selection remains selected, shows its retained count, and is disabled until the user chooses another entry; it is never silently reassigned to a different dhikr. Repeat targets come from the new licensed source; an older higher count is retained even if it exceeds the new target.

The old optional Azkar installer and its source are removed. Existing optional IndexedDB blobs are not read or rendered as core content, and Remove optional downloads can clear them. No old counter is cleared when retiring that installer.

## Dates, nights and preview

Automatic mode uses the existing ArabicCore/Umm al-Qura conversion. For 1448 it computes 8 February 2027 through 8 March, followed by Eid on 9 March: 29 Ramadan days. The interface and print sheet retain 30 slots. The preparation banner appears on the three preceding days. `+1` adjustment advances the effective Hijri date one day; `-1` delays it. Historical Today date selection edits that date’s Ramadan record and recalculates qada without changing the real clock; its prayer outputs show clock times rather than a live countdown. The actual time zone/prayer calculations still come from the user's existing profile.

Manual start within automatic Ramadan uses that month's start; outside it, it anchors a 30-day window on today. Manual end ends that window today. Return the control to Automatic for calendar activation again. A local moon-sighting difference can therefore be recorded without changing existing days.

Night numbers advance after the computed Maghrib; 21, 23, 25, 27 and 29 receive the odd-night highlight. Without prayer coordinates, there is no reliable local sunset boundary; the day's night number is used and prayer countdowns ask for location. Suhoor after today's Fajr shows the next Fajr, and iftar after Maghrib shows the next Maghrib.

Khatm uses 604 pages times the selected goal minus pages already logged, divided by actual remaining days including today. The daily requirement rounds up; the “about N pages after each prayer” suggestion rounds that daily amount across five prayers. Completed targets produce zero remaining pages. A paused fasting day preserves the Ramadan fasting streak without adding a fasted day.

Settings → About & Credits → Developer preview is a **temporary, synthetic 30-day practice month**, so day 30 is available even when the actual calendar month has 29 days. It stores checklist/settings changes in session memory, never real `days` or qada. Exit preview or reload to discard it. The normal Today date heading continues to show the real current date; the preview banner labels the separate practice month.

## Sharing, print and verification

Eid PNG drawing uses only the app name, translated greeting and app URL. It never draws the name, fasting history, qada, exemption flag or finances. The private on-device Eid summary is separate. The printable sheet deliberately includes the user's own checklist and should be handled like a private backup.

The permanent `tests/upgrade.cjs` fixture installs actual Phase 1 commit `d142ca93f45fc4e23afc2546b6c3c155ef2a8e61`, its real service worker, and app-created data from the browser regression flow. It then switches the served files on the **same origin**, reloads into schema 2, compares every old field, checks the exact pre-migration bytes and reloads offline. Versioned module/catalog dependencies avoid mixing the new HTML with the prior cache-first module graph. The new worker precaches every local JS/JSON/CSS path using reload semantics and matches current assets ignoring their release query.

The 45 browser checks also exercise mocked calendar boundaries, manual controls, planner math, qada, preview isolation, licensed counter compatibility, encrypted backup behavior and all five languages at 390px in both themes. Separate `test:sources` verifies exact upstream religious fields and `test:optional` verifies adhan checksums/offline/removal. A generated PDF was checked as one A4 landscape page. Local gzip-served Lighthouse mobile results were 95/100/100/100 (performance/accessibility/best practices/SEO); rerun on deployment.

All 12 Phase 2 screenshots were made in a fresh isolated Chromium profile with synthetic name **Demo** and city **Dubai**, using temporary preview records. None captures an existing user's entries, passphrase, private journal, finances or credentials.
