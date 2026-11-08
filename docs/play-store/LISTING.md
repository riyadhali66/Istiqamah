# Play Store draft — prepared, not published

App: Istiqamah · Package: com.riyadhali66.istiqamah · Category: Lifestyle

English short description: Small daily steps with private habits, prayer times and Ramadan planning.

English description: Istiqamah helps you build a gentle, consistent daily routine. Track personal habits, reflect privately, read sourced offline adhkar, and plan Ramadan at your own pace. Prayer times are calculated on your phone from your chosen location, method and time zone. Optional prayer and habit notifications use Android permissions. Export or import plain or passphrase-encrypted backups. No account, ads, analytics or trackers. Your records stay on your device. External reading links and optional downloads contact their credited providers. Religious content includes source references; the app does not provide rulings or medical advice.

Arabic short description: خطوات يومية صغيرة مع عادات خاصة وأوقات الصلاة وتخطيط رمضان.

Arabic description: يساعدك استقامة على بناء روتين يومي لطيف ومستمر. تابع عاداتك وتأملاتك الخاصة، واقرأ الأذكار الموثقة دون اتصال، وخطط لرمضان وفق ظروفك. تُحسب أوقات الصلاة على هاتفك بحسب الموقع وطريقة الحساب والمنطقة الزمنية التي تختارها. إشعارات الصلاة والعادات اختيارية وبأذونات أندرويد. يمكنك تصدير واستيراد نسخ احتياطية عادية أو مشفرة بكلمة مرور. لا حسابات ولا إعلانات ولا تحليلات ولا تتبع. تبقى سجلاتك على جهازك. تتصل الروابط والتنزيلات الاختيارية بالمزودين المذكورين. يعرض المحتوى الديني مراجعه؛ ولا يقدم التطبيق فتاوى أو نصائح طبية.

Privacy policy: host the bundled privacy.html at your public production origin and enter that exact URL in Play Console. Do not use a localhost URL.

## Screenshots and graphics to supply

Use synthetic profiles only. Phone portrait: Today, native reminder permissions/settings, long Tasbih text/counter, Ramadan, encrypted-backup/share flow. Supply English and Arabic, light/dark. Current mocked-WebView captures are in docs/screenshots/android-2.1.1; capture real APK screens on a phone before store submission. High-resolution app icon: icon-512.png. Feature graphic (1024×500) remains a store-design task; do not claim the existing icon is a feature graphic.

## Data safety draft answers

- Data collected by the app: **No**. No backend, analytics, ads, login or automatic record upload.
- Data shared by the app: **No automatic personal-data sharing**. User-initiated exports go only to the chosen share destination; evaluate Play's user-initiated-sharing exception against the final release.
- Location: saved coordinates are used on-device for prayer calculations, not transmitted. Optional foreground coarse/fine location is requested only by Use my location. No background location permission.
- Financial, health, religious practice and journal records: local only, not collected by developer. Never include private records in store screenshots.
- Optional external links/download providers receive ordinary connection metadata, including IP address. Disclose this in privacy policy and re-review Play's classification if any provider behavior changes.
- Encryption: local app records and safety copies are unencrypted; optional encrypted backup files use AES-GCM/PBKDF2. Do not claim all stored data is encrypted by the app.
- Deletion: users can clear app data/uninstall (export first); there is no server account or server deletion process.
- Permissions: POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, INTERNET and optional foreground ACCESS_COARSE_LOCATION / ACCESS_FINE_LOCATION. Exact alarms are optional and use inexact fallback. No contacts/camera/microphone/background-location collection.
- Advertising ID / ads / tracking: none. Android automatic backup disabled.

These answers describe the implemented build, not a submitted/approved Play listing. The account owner must complete content rating, target audience, app access (no login), permissions declarations and the current Play Console questionnaire before submission. No Play publishing is performed by this PR.
