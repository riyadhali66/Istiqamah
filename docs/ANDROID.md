# Android 2.1.1: install, build and verify

## Install

After a maintainer tags a signed release, open this repository's GitHub **Releases**, download `istiqamah-v2.1.1.apk`, and check its SHA-256 against `SHA256SUMS.txt`. Android may ask you to allow **Install unknown apps** for your browser/files app; allow only for this installation, then turn it off. AAB is for Play Console, not direct phone installation. The website remains available as a PWA: browser menu → Install app / Add to Home Screen.

PR debug APKs are under GitHub Actions → Android APK → run → Artifacts. Sign into GitHub, download/extract the artifact ZIP, then install `app-debug.apk`. Debug builds use a different signing certificate from production; they cannot replace a signed release. Back up records before uninstalling any build. Artifacts expire per repository policy; signed Releases are the durable download route.

## First run and data

Website storage does not automatically transfer to the Android WebView. Export a backup from website Settings, save it to the phone, then choose **Already using Istiqamah on the website? Import your backup**. The system file picker accepts both existing JSON and encrypted envelope backups. Encrypted files require their passphrase. The same validation, original-bytes migration, undo copies and schema 3 are used. Android exports open the system share sheet via app-private cache files. Plain exports and local safety copies are unencrypted; keep them private. Android automatic cloud/device backup is disabled. Export before uninstalling or clearing app data.

## Maintainer: signing in four steps

1. On a trusted computer with a JDK, create the release keystore in one command (it prompts for passwords; never put passwords in shell history):

   ```sh
   keytool -genkeypair -v -keystore istiqamah-release.jks -alias istiqamah -keyalg RSA -keysize 3072 -validity 36500
   ```

   **BACK UP THIS KEYSTORE, ITS ALIAS AND PASSWORDS FOREVER in at least two secure places. Losing the signing key means existing APK installations can never receive an update signed by you; a new key cannot replace it.** Play App Signing has its own enrollment/recovery rules; do not rely on those for directly distributed APKs.

2. Repository Settings → Secrets and variables → Actions: add **ANDROID_KEYSTORE_BASE64**, **ANDROID_KEYSTORE_PASSWORD**, **ANDROID_KEY_ALIAS**, **ANDROID_KEY_PASSWORD**. The Base64 value is the complete keystore encoded as one line. Linux: `base64 -w0 istiqamah-release.jks`; macOS: `base64 < istiqamah-release.jks | tr -d '\n'`; PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('istiqamah-release.jks'))`. Enter these values only in GitHub's secret fields. Never commit the keystore or paste secrets into chat/issues. Protect version tags and allow release workflows only from reviewed main.
3. After this PR merges and you verify its debug APK, update versions through a PR for each subsequent release. For 2.1.1, from up-to-date main run `git tag v2.1.1` then `git push origin v2.1.1`. Tagging publishes signed release artifacts automatically; this implementation does not create a tag or publish a release for you.
4. Actions builds/verifies a signed APK and AAB, then attaches them and checksums to a GitHub Release with the matching CHANGELOG section. Download the APK from Releases. Missing secrets or a tag/package version mismatch fails the release build; it never substitutes a debug/unsigned release.

versionName comes from package.json. CI versionCode is `210100000 + GITHUB_RUN_NUMBER`, increasing with successive workflow runs; all APK/AAB tasks in one run use the same code. Local debug uses UTC minutes unless `ANDROID_VERSION_CODE` is explicitly provided. Do not change/reset CI's versionCode scheme for already distributed releases.

## Build locally

Use Node 24, Java **JDK** 21, Android SDK platform 36/build tools 36 (Gradle may resolve its default 35 tools), and accepted SDK licenses:

```sh
npm ci
npm run android:sync
bash android/gradlew -p android assembleDebug --no-daemon
```

Windows: `android\gradlew.bat -p android assembleDebug`. The output is `android/app/build/outputs/apk/debug/app-debug.apk`. Android Studio can open `android/`. Min SDK 24 / target SDK 36. `www/` and generated public assets are ignored and recreated by `build:web`; no docs, tests, tooling or node_modules are copied. `android/` source/Gradle wrapper/resources are committed.

## Exactly what to check on a phone

1. On the **web**, back up; confirm 2.1.1, historical journals/counters/Ramadan plans, both themes and your language. Reload offline. Verify both GitHub Pages `/Istiqamah/` and Cloudflare root if you use both; each origin has separate local records.
2. Install the debug APK. In airplane mode, finish a new plan and open Today, Ramadan, Tasbih, Settings. Confirm full Arabic text, RTL in Arabic/Urdu, and English/Malayalam/Hindi. No first-run network is required.
3. Import a real backup only after keeping a safe original. Check older habit snapshots, debts, words, children, independent adhkar counters/favorites and Ramadan records. Export plain and encrypted copies through the share sheet; restore each through the file picker and confirm. A wrong passphrase must leave current records intact.
4. Settings → Android reminders: read the explanation, grant/deny Android 13+ notifications. Denial leaves the rest of the app usable. Enable one prayer, set a before-prayer offset and check the next prayer's reminder. Compare the displayed calculation, location and time zone. Use my location asks only for foreground location; declining it leaves manual city/coordinates available. Toggle it off and ensure pending reminders cancel.
5. On Android 12+, deny exact alarms and confirm graceful less-precise scheduling. Use **Exact alarm settings** only if you want precision. Return to the app and check rescheduling. Change time zone/method/reminder time, background/reopen, and reboot: existing seven-day alarms should restore. Open the app at least weekly to replenish its seven-day horizon. Force-stop/battery restrictions and system permission changes may prevent/delay alarms; reopen after changing them. Reminders are aids, not a guaranteed prayer-time authority.
6. Enable morning/evening adhkar, Quran, bedtime and Ramadan preparation (only active Ramadan dates). Check optional offsets are preparation reminders, not additional religious deadlines. Native notification sound must be the Android system default.
7. Open Sunnah.com/Quran.com/GitHub links: they should use the external browser. Press hardware Back through screens/dialogs; Today asks before exit. Rotate the phone; DeviceOrientation remains available when the device has a suitable sensor. Part 1 does not add a Qibla compass.

Mock tests cannot certify actual OEM notification delivery, reboot, share targets or sensors. Record phone model, Android version, permission/battery settings and observed time when reporting an issue.
