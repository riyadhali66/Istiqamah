## Android app 2.1.1, preserving the same local app and records

Starts from merged PR #4/main **4941e2b**. Part 1 only; no Phase 3 features, main push, tag, live deployment or Play submission.

- Capacitor **8.6.0**, app ID `com.riyadhali66.istiqamah`, committed Android project; min SDK **24**, target/compile SDK **36**. `build:web` copies an app-only allowlist to www and bundles the native plugin bridge locally. Native never registers a service worker; web remains buildless/offline.
- Optional seven-day prayer notifications from the existing prayer service, per-prayer switches and offsets, morning/evening adhkar/Quran/bedtime/Ramadan preparation reminders, app/settings refresh and official reboot restoration. Explicit notification/exact-alarm explanations and denied-permission/inexact fallback; no automatic exact-settings prompt. System-default sound only. Provider slots support future Friday/Dhul-Hijjah reminders without a second scheduling system.
- Emerald/adaptive branding, native system-bar insets, Back stack/home exit confirmation, external-browser links, existing WebView file picker, Filesystem + Share plain/encrypted exports, first-run website-backup import guidance. Foreground location permission only on Use my location; manual location remains available. Sensor events remain available in the secure WebView.
- Same schema 3/migration/backup safety. Validated additive notification preferences in existing backups. No data reset. Android automatic cloud/device backup disabled; share files are app-private cache files behind a cache-only FileProvider.
- PR debug APK workflow; tag-only signed APK/AAB/checksum/changelog release workflow using the four signing secrets. Write permissions are confined to the tag-only publish job. Store/privacy/Data safety drafts, signing/phone instructions and five volunteer issue ideas included.
- Cloudflare was already passing on main; added static-only wrangler.jsonc with no Worker source/build step and a deny-by-default .assetsignore. Both Cloudflare root and GitHub Pages subfolder are tested. A versioned bootstrap pathname fixes the prior worker serving a stale bootstrap despite a new version query.

## Verified results

- **49 browser checks**, including real app/worker upgrades from 964ba52, fd79768, d142ca9, 4ff5851 **and merged 4941e2b** → one-tap waiting-worker update → preserved records → offline.
- Existing test:phase2 (10 groups), test:release/recovery, test:sources, test:optional all passed.
- test:native passed: scheduling math/IDs/offsets/toggles/permissions/fallback/cancellation/extension providers/private export bytes.
- test:native-browser passed: no worker, native welcome and invalid-import fallback, explicit permissions, schedule refresh, plain/encrypted sharing, picker import, Back, external browser, five languages/RTL × both themes at 390px.
- test:paths passed: actual worker scopes and offline reload at `/` and `/Istiqamah/`.
- **Actual debug APK built and signature verified**. Actual release APK + AAB built/signed/verified with a **disposable test-only key** to validate the signing configuration. No production signing key or release was created. aapt confirms versionName 2.1.1 / SDK 24–36.
- Mobile web Lighthouse: **92 performance / 100 accessibility / 100 best practices / 100 SEO**. Report committed. Physical-device/OEM alarm, sensor and share-target verification remains on the phone checklist.
- Asset checksums and workflow YAML validated; no keystore, build output, www or node_modules committed.

### CI and Cloudflare status — do not confuse local results with a remote run

GitHub API currently returns `Forbidden`; an actual PR CI run URL cannot be obtained here. Opening this branch as a PR triggers the [Android workflow](https://github.com/riyadhali66/Istiqamah/actions/workflows/android.yml), which uploads the debug APK. This is a workflow link, not a fabricated passing run URL.

The user confirmed current main passed both GitHub Pages and Cloudflare. For this branch, Wrangler 4.158.0 `deploy --dry-run` passed. Actual Wrangler local responses: app/index/js/sw/font **200**; tests/docs/package.json/android/www/wrangler.jsonc **404**. No remote Cloudflare deployment was performed or claimed. Root/subfolder browser/offline tests passed.

## Screenshots (synthetic data, mocked native plugins)


### Today

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/today-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/today-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/today-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/today-ar-dark.png) |

### Android reminders

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/native-settings-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/native-settings-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/native-settings-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/refs/heads/android/capacitor/docs/screenshots/android-2.1.1/native-settings-ar-dark.png) |

## Maintainer and phone checks

Read [Android install/signing/phone checklist](docs/ANDROID.md), [validation](docs/ANDROID-VALIDATION.md), [store drafts](docs/play-store/LISTING.md), [privacy policy](privacy.html) and [five volunteer ideas](docs/ANDROID-VOLUNTEER-IDEAS.md).

**Back up the release keystore, alias and passwords forever. Losing that key prevents updates to already installed direct-distribution APKs.** Add ANDROID_KEYSTORE_BASE64 / ANDROID_KEYSTORE_PASSWORD / ANDROID_KEY_ALIAS / ANDROID_KEY_PASSWORD only in GitHub Actions secrets. After merge, review the debug artifact and phone checks before explicitly tagging v2.1.1. No tag or public release is made by this PR.

On the phone: back up website records; install debug APK; explicitly import the backup; verify historical records, plain/encrypted share/picker round trips, airplane-mode use, all languages/RTL/themes, notification permission denial/grant, exact-alarm fallback, per-prayer offsets, method/time-zone changes, reopen/reboot and battery restrictions, Back and external links. Website and APK storage do not transfer automatically. Debug and production signing certificates differ; export before uninstalling to switch builds. Open the app at least weekly to refresh the seven-day horizon.

Part 2 starts only after Part 1 merges and the user says continue.
