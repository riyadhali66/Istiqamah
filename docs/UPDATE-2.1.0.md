# Update to 2.1.0 and check it on your phone

## After merging and deployment

A GitHub push or PR merge changes the repository. Your hosting provider must deploy those files before the public site can update. This release does not publish a live site automatically.

1. Open your existing Istiqamah address online, in the same browser/profile. In Settings export a backup first, preferably encrypted; keep its passphrase separately.
2. Reopen/navigate to that same address after the deployment. A legacy page already open cannot show newly written UI until it next navigates. Wait for **A new version of Istiqamah is ready — Update now**. Tap **Update now** once. The app reloads once after the entire offline cache is ready.
3. Confirm **2.1.0** in the footer and Settings → About. Read and dismiss What's new; it should remain dismissed on the next reopen.
4. Check a previous day's habits, targets/snapshot, journal, debts/payments, words and child records. In Tasbih check your old free count, selected dhikr and favorite. Unmatched source counts are read-only under Earlier counter progress, with their original text where known.
5. In Settings choose your local Ramadan start and month length, or Automatic/±1 adjustment. Check your location/time zone, Fajr/Maghrib and the explicit countdown labels. Preparation offsets are personal reminders. Check fasting/pause, Quran pages and optional family/charity/adhkar goals. Turn Ramadan off and confirm the regular plan returns; turn it on and confirm Ramadan records remain.
6. In Tasbih try search, categories, favorite, previous/next, and a missing-count personal goal. Increment two entries, reset one, and verify the other is unchanged. Morning/evening counts should match Reflections.
7. Switch Arabic or Urdu and dark mode. Long religious text must remain readable while scrolling. Repeat in your preferred language.
8. Close/reopen in airplane mode after the app says it is cached. Today, Ramadan, Tasbih, saved records and bundled readings should still work. External audio requires a prior explicit download; nothing is downloaded automatically.
9. In Settings confirm Restore a previous day lists safety copies. Test encrypted file restoration only after exporting the current records; restoration replaces current data and creates an undo checkpoint.

Do not clear site data, localStorage, browser history/site storage, or uninstall to update. A migration-backup failure intentionally blocks writes. Export the original records and free device space before retrying.

## Updating an older downloaded ZIP / localhost copy

1. Export the current app backup. Keep the old folder until the new copy works.
2. Download the merged **2.1.0** repository ZIP and extract **all** files into a new folder. Do not copy only index.html or layer new files over obsolete root scripts.
3. Stop the previous local server. Start the complete new folder using the **same hostname and port** you used before. On Windows with Python installed, run `py tools/serve.py 8000` from that folder; on macOS/Linux use `python3 tools/serve.py 8000`. If Windows says Python is not found, install Python from python.org, reopen PowerShell, and confirm `py --version` first.
4. Open exactly the previous address, for example `http://localhost:8000/`. `localhost`, `127.0.0.1`, another port, HTTPS and a public hostname have separate browser storage. A change of folder alone does not change storage when the origin stays the same.
5. Use the update banner once, then follow the phone checks above. If moving to a different origin, import your exported backup into that new installation and confirm before replacement. Nothing transfers automatically.

Opening index.html via `file://` cannot provide reliable service-worker/offline updates; use the local HTTP server or an HTTPS host. If startup fails, the plain recovery screen can export **raw localStorage** and restore the most recent earlier daily copy after an original-bytes undo backup. Keep raw exports private; local copies are unencrypted.
