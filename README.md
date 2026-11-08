# Istiqamah 2.1.0

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
