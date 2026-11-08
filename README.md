# Istiqamah 2.1.1

A local-first companion for small, consistent steps. English, Arabic, Urdu, Malayalam and Hindi; mobile, RTL, dark mode, offline use. No account, backend, analytics or AI API.

Run `python3 tools/serve.py` (Windows: `py tools/serve.py`) and open http://localhost:8000. Python's basic static server also works. Use HTTPS for a public installation. No build step is required.

Release 2.1.0 combines the modular foundation and Ramadan work with the permitted broader adhkar library. See [migration and operating notes](docs/PHASE-2-NOTES.md), [source register](SOURCE-NOTICES.md), [validation results](docs/RELEASE-2.1.0-VALIDATION.md), and [phone/update checklist](docs/UPDATE-2.1.0.md).

## Validation

```sh
npm ci
npm test
npm run test:phase2
npm run test:release
npm run test:sources
npm run test:optional
```

Browser checks use Playwright Chromium (or `CHROMIUM_PATH`). Source/optional checks explicitly contact pinned providers. All source versions needed for the real-upgrade suite must be present in Git history.

## Data safety

Export a backup in Settings before changing installations. Keep the same origin: protocol, hostname and port identify browser storage. Clearing site data deletes local records. Moving from localhost to a public site requires an exported backup; no automatic cloud transfer exists. Migration keeps original bytes and blocks writes if it cannot back them up. Optional encrypted exports protect the exported file; local records and safety copies remain unencrypted.

A GitHub branch push or pull request is not a live-site deployment. Merge and your hosting deployment must complete before a public site can offer the update.

## Install on Android (2.1.1)

Download the signed APK from [GitHub Releases](https://github.com/riyadhali66/Istiqamah/releases) once a maintainer publishes a version tag. Android may require allowing installation from your browser/files app. Check the release checksum. PR debug APKs are available as GitHub Actions artifacts after a PR build; they use a different certificate from production. **Export a backup before uninstalling or changing build types.** You can also keep using the web/PWA version.

What works: the complete offline app, same schema 3 records and backups, optional seven-day prayer/habit/Ramadan notifications, per-prayer switches and before-prayer offsets, optional exact alarms with fallback, Android share-sheet plain/encrypted exports and file-picker imports, external-browser links, native back navigation, five languages/RTL and dark mode. Website data requires an explicit backup import. System-default notification sound only; no unlicensed audio/font is bundled. Sensor availability depends on the device; Qibla and the other Phase 3 features are not implemented in Part 1.

[Android build, signing, install and phone checklist](docs/ANDROID.md) · [Store listing/privacy/Data safety drafts](docs/play-store/LISTING.md) · [Privacy policy](privacy.html).

```sh
npm ci
npm run android:sync
# JDK 21 + Android SDK 36 required
bash android/gradlew -p android assembleDebug --no-daemon
```

The web app still runs without a build step. Cloudflare uses static-only `wrangler.jsonc` + `.assetsignore`; no Worker source or app build is required. `npm run test:paths` verifies both root hosting and GitHub Pages' `/Istiqamah/` scope/offline behavior.
