import { releaseNotes } from "./release.js?v=2.1.0";
import { adhkarLibrary } from "./adhkar-library.js?v=2.1.0";
import { ramadanService } from "./ramadan.js?v=2.1.0";
import {
  maybeRamadanSetup,
  skipRamadanSetup,
  showRamadanSetup,
  advanceSetup,
  ramadanTick,
  printRamadan,
  shareEid,
} from "./ui/ramadan.js?v=2.1.0";
import { session } from "./session.js?v=2.1.0";
import {
  addWizardDebt,
  finishPlan,
  geolocate,
  renderWizard,
  showWizard,
  updateProfile,
  validateDraft,
} from "./ui/onboarding.js?v=2.1.0";
import { modal, render } from "./ui/core.js?v=2.1.0";
import {
  categoryScore,
  dayHabits,
  getDay,
  habitStreak,
  logHabit,
  save,
  score,
  streak,
  syncTodayHabits,
} from "./records.js?v=2.1.0";
import { $, $$, toast, uid } from "./utils.js?v=2.1.0";
import { adhkarService, tasbihSelection } from "./adhkar.js?v=2.1.0";
import { offsetDay, today } from "./dates.js?v=2.1.0";
import { engine } from "./engine.js?v=2.1.0";
import {
  currentSchedule,
  exportCalendar,
  printTracker,
  showSchedule,
  zonedDate,
} from "./schedule.js?v=2.1.0";
import { storage, validate } from "./storage.js?v=2.1.0";
import { t, loadTranslations } from "./i18n.js?v=2.1.0";
import { loadInitialContent, loadHadith } from "./content.js?v=2.1.0";
import { quranService } from "./quran.js?v=2.1.0";
import {
  notifications,
  playAdhan,
  playAudio,
  pomodoro,
  tickTimer,
} from "./reminders.js?v=2.1.0";
import { defaults, fresh, timezone } from "./config.js?v=2.1.0";
import { registerWorker } from "./offline.js?v=2.1.0";
import { prayerService } from "./prayer.js?v=2.1.0";
import { hijriService } from "./hijri.js?v=2.1.0";
import { hadithService } from "./hadith.js?v=2.1.0";
import { ui } from "./ui/views.js?v=2.1.0";

("use strict");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  session.installEvent = e;
});
document.addEventListener("click", async (e) => {
  const el = e.target.closest("[data-action]");
  if (!el || el.disabled) return;
  const { action, id, value, index, key } = el.dataset;
  switch (action) {
    case "ramadan-toggle":
      ramadanService.mode(ramadanService.context().active?"off":"on");render();break;
    case "ramadan-setup-skip":
      skipRamadanSetup();
      break;
    case "ramadan-setup":
      showRamadanSetup();
      break;
    case "ramadan-setup-next":
      advanceSetup();
      break;
    case "ramadan-details":
      session.page = "tools";
      session.tool = "ramadan";
      render();
      break;
    case "ramadan-preview-off":
      ramadanService.preview("off");
      render();
      break;
    case "ramadan-shawwal":
      session.page = "tools";
      session.tool = "fasting";
      render();
      break;
    case "ramadan-print":
      printRamadan();
      break;
    case "eid-share":
      await shareEid();
      break;
    case "qada-done":
      ramadanService.makeUp();
      render();
      break;
    case "qada-undo":
      ramadanService.makeUp(-1);
      render();
      break;
    case "wizard-debt":
      if (addWizardDebt()) renderWizard();
      break;
    case "nav":
      session.page = id;
      render();
      window.scrollTo({ top: 0, behavior: "instant" });
      break;
    case "theme":
      session.state.settings.theme =
        session.state.settings.theme === "dark" ? "light" : "dark";
      save();
      render();
      break;
    case "check": {
      const h = dayHabits(session.selectedDate).find((h2) => h2.id === id);
      logHabit(id, (getDay().values[id] || 0) >= h.target ? 0 : h.target);
      break;
    }
    case "water":
      logHabit(id, (getDay().values[id] || 0) === +value ? +value - 1 : +value);
      break;
    case "mood":
      getDay().mood = +value;
      save();
      render();
      break;
    case "location":
      session.page = "settings";
      render();
      $('#main [data-profile="city"]')?.focus();
      break;
    case "settings-geolocate":
      geolocate("settings");
      break;
    case "geolocate":
      geolocate("draft");
      break;
    case "wizard-next":
      if (validateDraft()) {
        if (session.wizardStep === 7) finishPlan();
        else {
          session.wizardStep++;
          renderWizard();
          $("#wizard").scrollTop = 0;
        }
      }
      break;
    case "wizard-back":
      session.wizardStep = Math.max(0, session.wizardStep - 1);
      renderWizard();
      break;
    case "skip-wizard":
      if (validateDraft()) finishPlan();
      break;
    case "finish-wizard":
      $("#wizard").close();
      session.page = "today";
      render();
      save();
      break;
    case "commitment":
      session.draft.commitment = id;
      renderWizard();
      break;
    case "rank": {
      const i = session.draft.goals.indexOf(id),
        j = i + +value;
      if (j >= 0 && j < session.draft.goals.length)
        [session.draft.goals[i], session.draft.goals[j]] = [
          session.draft.goals[j],
          session.draft.goals[i],
        ];
      renderWizard();
      break;
    }
    case "onboarding":
      showWizard();
      break;
    case "tool":
      session.tool = id;
      render();
      break;
    case "adhkar-tab":
      session.adhkarTab = id;
      render();
      break;
    case "dhikr":
      adhkarService.increment(session.adhkarTab, +index);
      render();
      break;
    case "dhikr-reset":
      adhkarLibrary.set(adhkarService.list(session.adhkarTab)[Number(index)],0,session.selectedDate);
      getDay().values[
        session.adhkarTab === "morning" ? "adhkar-am" : "adhkar-pm"
      ] = 0;
      save();
      render();
      break;
    case "tasbih": {
      if(session.state.adhkarPrefs.selected && !adhkarLibrary.selected())break;
      const selected = tasbihSelection();
      if (selected) {
        const previous = adhkarLibrary.count(selected.entry);
        if (adhkarLibrary.target(selected.entry) && previous >= adhkarLibrary.target(selected.entry)) break;
        adhkarService.increment(selected.period, selected.index, today());
        const count = adhkarLibrary.count(selected.entry);
        if ([33, 100].includes(count) || count === selected.entry.count)
          navigator.vibrate?.(150);
      } else {
        session.state.tasbih.count++;
        if (
          [33, 100].includes(session.state.tasbih.count) ||
          session.state.tasbih.count % session.state.tasbih.goal === 0
        ) {
          navigator.vibrate?.(150);
          if (session.state.tasbih.link) {
            let h = session.state.habits.find(
              (h) => h.id === session.state.tasbih.link,
            );
            if (h) getDay(today()).values[h.id] = h.target;
          }
        }
      }
      save();
      render();
      break;
    }
    case "dhikr-favorite":
      if (adhkarLibrary.selected()) adhkarLibrary.favorite(adhkarLibrary.selected().id);
      render(); break;
    case "tasbih-previous":
    case "tasbih-next":
      adhkarLibrary.move(action === "tasbih-next" ? 1 : -1); render(); break;
    case "tasbih-reset": {
      if(session.state.adhkarPrefs.selected && !adhkarLibrary.selected())break;
      const entry = adhkarLibrary.selected();
      if(entry) adhkarLibrary.set(entry,0); else session.state.tasbih.count=0;
      save(); render(); break;
    }
    case "tasbih-goal":
      session.state.tasbih.goal = +value;
      save();
      render();
      break;
    case "pay": {
      const amount = Number($("#pay-" + id).value),
        debt = session.state.debts.find((d) => d.id === id);
      if (
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > debt.total - debt.paid + 1e-6
      ) {
        toast("Enter a payment within the remaining balance.");
        return;
      }
      debt.paid = Math.min(
        debt.total,
        Math.round((debt.paid + amount) * 100) / 100,
      );
      (debt.payments ??= []).push({ date: today(), amount });
      save();
      render();
      break;
    }
    case "fast": {
      let d = getDay(id);
      d.fasted = !d.fasted;
      if (dayHabits(id).some((h) => h.id === "fast-plan"))
        d.values["fast-plan"] = d.fasted ? 1 : 0;
      save();
      render();
      break;
    }
    case "reveal":
      session.wordReveal = true;
      render();
      break;
    case "next-word":
      session.wordIndex++;
      session.wordReveal = false;
      render();
      break;
    case "remove-word":
      session.state.words = session.state.words.filter((w) => w.id !== id);
      save();
      render();
      break;
    case "kid-star": {
      const d = getDay();
      d.kids[id] ??= {};
      d.kids[id][key] = !d.kids[id][key];
      save();
      render();
      break;
    }
    case "move-habit": {
      const i = session.state.habits.findIndex((h) => h.id === id),
        j = i + +value;
      if (j >= 0 && j < session.state.habits.length)
        [session.state.habits[i], session.state.habits[j]] = [
          session.state.habits[j],
          session.state.habits[i],
        ];
      syncTodayHabits();
      render();
      break;
    }
    case "remove-habit":
      session.state.habits = session.state.habits.filter((h) => h.id !== id);
      syncTodayHabits();
      render();
      break;
    case "unlock": {
      const h = engine.next();
      if (h) {
        session.state.habits.push(h);
        syncTodayHabits();
        render();
      }
      break;
    }
    case "schedule":
      showSchedule();
      break;
    case "remove-block": {
      const b = session.state.schedule.find((b2) => b2.id === id);
      if (b) b.hidden = true;
      else
        session.state.schedule.push({
          id,
          time: "00:00",
          label: "",
          hidden: true,
        });
      save();
      $("#modal").close();
      showSchedule();
      break;
    }
    case "close-modal":
      $("#modal").close();
      break;
    case "export-day":
      exportCalendar(1);
      break;
    case "export-week":
      exportCalendar(7);
      break;
    case "print":
      printTracker();
      break;
    case "encrypted-backup":
      (await import("./ui/backups.js?v=2.1.0")).showEncryptedExport();
      break;
    case "restore-days":
      await (await import("./ui/backups.js?v=2.1.0")).showRestoreDays();
      break;
    case "choose-snapshot":
      (await import("./ui/backups.js?v=2.1.0")).chooseSnapshot(Number(id));
      break;
    case "export-original":
      storage.exportOriginal();
      break;
    case "download-optional":
      await (await import("./ui/downloads.js?v=2.1.0")).installOptional(id, el);
      break;
    case "remove-optional":
      await (await import("./ui/downloads.js?v=2.1.0")).deleteOptional();
      break;
    case "backup":
      storage.export();
      break;
    case "reset-plan":
      modal(
        "Reset plan",
        `<p>${session.lang === "ar" ? "\u0647\u0644 \u062A\u0631\u064A\u062F \u0625\u0639\u0627\u062F\u0629 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0639\u0627\u062F\u0627\u062A \u0645\u0646 \u0625\u062C\u0627\u0628\u0627\u062A\u0643\u061F \u0633\u064A\u0628\u0642\u0649 \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u0633\u0627\u0628\u0642 \u0648\u0627\u0644\u062F\u064A\u0648\u0646 \u0648\u0627\u0644\u0643\u0644\u0645\u0627\u062A \u0645\u062D\u0641\u0648\u0638\u064B\u0627." : session.lang === "ur" ? "\u0627\u067E\u0646\u06D2 \u062C\u0648\u0627\u0628\u0627\u062A \u0633\u06D2 \u0639\u0627\u062F\u0627\u062A \u062F\u0648\u0628\u0627\u0631\u06C1 \u0628\u0646\u0627\u0626\u06CC\u06BA\u061F \u0633\u0627\u0628\u0642\u06C1 \u0631\u06CC\u06A9\u0627\u0631\u0688\u060C \u0642\u0631\u0636 \u0627\u0648\u0631 \u0627\u0644\u0641\u0627\u0638 \u0645\u062D\u0641\u0648\u0638 \u0631\u06C1\u06CC\u06BA \u06AF\u06D2\u06D4" : session.lang === "ml" ? "നിങ്ങളുടെ ഉത്തരങ്ങളിൽ നിന്ന് ശീലങ്ങൾ പുനഃസൃഷ്ടിക്കണോ? മുൻകാല ചരിത്രവും കടങ്ങളും വാക്കുകളും സുരക്ഷിതമായി നിലനിൽക്കും." : session.lang === "hi" ? "क्या आप अपने उत्तरों से आदतें फिर से बनाना चाहते हैं? आपका इतिहास, क़र्ज़ और शब्द सुरक्षित रहेंगे।" : "Regenerate habits from your answers? Your history, debts, and words will be kept."}</p><button class="btn section-gap" data-action="confirm-reset">${t("Reset plan")}</button>`,
      );
      break;
    case "confirm-reset":
      session.state.habits = engine.generate(session.state.profile).habits;
      session.state.schedule = [];
      syncTodayHabits();
      $("#modal").close();
      render();
      toast("Saved");
      break;
    case "verse-audio": {
      let v = quranService.daily();
      if (v) playAudio(quranService.audio(v));
      break;
    }
    case "test-sound":
      if (session.state.settings.sound === "silent") toast("Silent");
      else playAdhan();
      break;
    case "notifications":
      await notifications();
      break;
    case "check-updates":
      await window.IstiqamahCheckUpdate?.();
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) await registration.update().catch(() => {});
      }
      break;
    case "install":
      if (session.installEvent) {
        await session.installEvent.prompt();
        await session.installEvent.userChoice;
        session.installEvent = null;
      } else
        toast(
          "Use your browser menu: Install app, or Share \u2192 Add to Home Screen.",
        );
      break;
    case "timer":
      if (pomodoro.running) {
        tickTimer();
        pomodoro.running = false;
      } else {
        if (!pomodoro.remaining) pomodoro.remaining = 25 * 60;
        pomodoro.ends = Date.now() + pomodoro.remaining * 1e3;
        pomodoro.running = true;
      }
      render();
      break;
    case "timer-reset":
      pomodoro.running = false;
      pomodoro.remaining = 25 * 60;
      render();
      break;
  }
});
document.addEventListener("change", async (e) => {
  const el = e.target;
  if (el.id === "ramadan-start-date") {
    if(/^\d{4}-\d{2}-\d{2}$/.test(el.value)) {ramadanService.config().manualStart=el.value;ramadanService.config().mode="on";save();render();}return;
  }
  if(el.dataset.completion) {
    const c=ramadanService.config().completion,k=el.dataset.completion;
    c[k]=k==='enabled'?el.checked:k==='pages'?Math.max(0,Math.min(1e6,+el.value||0)):el.value;
    c.setOn=today();save();render();return;
  }
  if(el.dataset.ramadanGoal) {ramadanService.config().goals[el.dataset.ramadanGoal]=el.checked;save();render();return;}
  if(el.dataset.ramadanConfig) {
    const k=el.dataset.ramadanConfig;
    ramadanService.config()[k]=k==='nightGoals'?el.value:k==='dailyTargetEnabled'?el.checked:Math.max(0,Math.min(k==='dailyPages'?1e6:180,+el.value||0));save();render();return;
  }
  if (el.id === "ramadan-mode") {
    ramadanService.mode(el.value);
    render();
    return;
  }
  if (el.id === "ramadan-adjustment") {
    ramadanService.config().adjustment = Number(el.value);
    if (!ramadanService.context().preview) save();
    render();
    return;
  }
  if (el.id === "ramadan-preview") {
    ramadanService.preview(el.value);
    session.page = "today";
    render();
    return;
  }
  if (el.dataset.ramadan) {
    const key = el.dataset.ramadan;
    if (key === "setupNotFasting") return;
    if (["fitrAmount", "fitrPeople"].includes(key)) {
      const value = Number(el.value);
      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 1e6 ||
        (key === "fitrPeople" &&
          (!Number.isInteger(value) || value < 1 || value > 100))
      )
        return;
      ramadanService.config()[key] = value;
      if (!ramadanService.context().preview) save();
    } else {
      const value = key === "reason" ? el.value : el.type === "checkbox" ? el.checked : Number(el.value);
      if (
        typeof value === "number" &&
        (!Number.isFinite(value) || value < 0 || value > 1e6)
      )
        return;
      ramadanService.update(key, value);
    }
    render();
    return;
  }
  if (el.dataset.draftDebt) {
    session.draftDebt[el.dataset.draftDebt] = el.value;
    return;
  }
  if (el.dataset.draft) {
    const k = el.dataset.draft;
    const valid = updateProfile(
      k,
      el.type === "checkbox" ? el.checked : el.value,
      session.draft,
    );
    if (!valid) {
      toast("Check your location or time zone.");
      el.focus();
      return;
    }
    if (k === "language") {
      session.lang = session.draft.language;
      await loadTranslations(session.lang);
      document.documentElement.lang = session.lang;
      document.documentElement.dir = ["ar", "ur"].includes(session.lang)
        ? "rtl"
        : "ltr";
      renderWizard();
    }
    if (["city", "country", "hasDebts"].includes(k)) renderWizard();
    return;
  }
  if (el.dataset.multi) {
    const k = el.dataset.multi;
    if (el.checked && !session.draft[k].includes(el.value))
      session.draft[k].push(el.value);
    if (!el.checked)
      session.draft[k] = session.draft[k].filter((v) => v !== el.value);
    if (k === "goals") renderWizard();
    return;
  }
  if (el.dataset.goal) {
    session.draft.goalText[el.dataset.goal] = el.value;
    return;
  }
  if (el.dataset.profile) {
    const k = el.dataset.profile;
    if (
      !updateProfile(
        k,
        el.type === "checkbox" ? el.checked : el.value,
        session.state.profile,
      )
    ) {
      toast("Check your location or time zone.");
      render();
      return;
    }
    session.lang = session.state.profile.language;
    await loadTranslations(session.lang);
    save();
    render();
    return;
  }
  if (el.dataset.habit) {
    logHabit(el.dataset.habit, el.value);
    return;
  }
  if (el.dataset.zakat) {
    session.state.zakat[el.dataset.zakat] = Math.max(0, +el.value || 0);
    save();
    render();
    return;
  }
  if (el.dataset.editHabit) {
    let h = session.state.habits.find((h2) => h2.id === el.dataset.editHabit);
    if (!h) return;
    const key = el.dataset.key;
    if (key === "target") {
      let n = Number(el.value);
      if (!Number.isFinite(n) || n <= 0 || n > 1e6) {
        toast("Target must be between 1 and 1,000,000.");
        render();
        return;
      }
      h.target = n;
    } else h[key] = el.value.trim() || h[key];
    syncTodayHabits();
    return;
  }
  if (el.dataset.reward) {
    let child = session.state.children.find((c) => c.id === el.dataset.reward);
    if (child) child.reward = el.value;
    save();
    return;
  }
  if (el.dataset.kidMinutes) {
    const d = getDay();
    d.kidMinutes ??= {};
    d.kidMinutes[el.dataset.kidMinutes] = Math.max(0, +el.value || 0);
    save();
    return;
  }
  switch (el.id) {
    case "day-picker":
      if (el.value && el.value <= today()) {
        session.selectedDate = el.value;
        render();
      }
      break;
    case "month-picker":
      if (/^\d{4}-\d{2}$/.test(el.value)) {
        session.month = el.value;
        render();
      }
      break;
    case "pause-faith":
      getDay().pauseFaith = el.checked;
      save();
      render();
      break;
    case "stress":
      getDay().stress = +el.value;
      save();
      $("#stress-value").textContent = el.value;
      break;
    case "enable-debts":
      session.state.profile.hasDebts = el.checked;
      save();
      render();
      break;
    case "savings-amount":
      session.state.savings[session.month] = Math.max(0, +el.value || 0);
      save();
      render();
      break;
    case "theme-select":
      session.state.settings.theme = el.value;
      save();
      render();
      break;
    case "sound-select":
      session.state.settings.sound = el.value;
      save();
      break;
    case "adhkar-category":
      session.state.adhkarPrefs.category=el.value;save();render();break;
    case "adhkar-search":
      session.state.adhkarPrefs.search=el.value;save();render();break;
    case "dhikr-personal-target":
      if(adhkarLibrary.selected() && +el.value>=1 && +el.value<=10000)
        session.state.adhkarPrefs.personalTargets[adhkarLibrary.selected().id]=+el.value;
      save();render();break;
    case "tasbih-adhkar":
      session.state.adhkarPrefs.selected = el.value;
      save();
      render();
      break;
    case "tasbih-link":
      session.state.tasbih.link = el.value;
      save();
      break;
    case "import-file":
      await (
        await import("./ui/backups.js?v=2.1.0")
      ).handleBackupFile(el.files[0]);
      el.value = "";
      break;
  }
});
document.addEventListener("input", (e) => {
  const el = e.target;
  if(el.id === "adhkar-search" && !e.isComposing){
    const start=el.selectionStart,end=el.selectionEnd;
    session.state.adhkarPrefs.search=el.value;save();render();
    const next=$("#adhkar-search");next?.focus();next?.setSelectionRange(start,end);return;
  }
  if (el.dataset.journal) {
    getDay().journal[el.dataset.journal] = el.value;
    save();
  }
  if (el.dataset.review) {
    session.state.reviews[session.month] ??= {};
    session.state.reviews[session.month][el.dataset.review] = el.value;
    save();
  }
  if (el.id === "stress") $("#stress-value").textContent = el.value;
});
document.addEventListener("submit", (e) => {
  const form = e.target;
  if (
    ![
      "habit-form",
      "debt-form",
      "word-form",
      "schedule-form",
      "block-form",
    ].includes(form.id)
  )
    return;
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  switch (form.id) {
    case "habit-form":
      if (session.state.habits.length >= 100)
        return toast("A maximum of 100 habits is supported.");
      session.state.habits.push({
        id: uid(),
        label: data.label.trim(),
        category: data.category,
        target: +data.target,
        unit: data.unit.trim(),
        weight: 1,
      });
      syncTodayHabits();
      render();
      break;
    case "debt-form": {
      const total = Number(data.total),
        paid = Number(data.paid);
      if (
        !Number.isFinite(total) ||
        total <= 0 ||
        !Number.isFinite(paid) ||
        paid < 0 ||
        paid > total
      )
        return toast("Already paid must be between zero and the total.");
      session.state.debts.push({
        id: uid(),
        name: data.name.trim(),
        total,
        paid,
        payments: paid ? [{ date: today(), amount: paid }] : [],
      });
      save();
      render();
      break;
    }
    case "word-form":
      session.state.words.push({ id: uid(), ...data, date: today() });
      {
        const d = getDay(today());
        d.values.words = (d.values.words || 0) + 1;
      }
      save();
      render();
      break;
    case "schedule-form":
      $$("#schedule-form [data-block-time]").forEach((el) => {
        const id = el.dataset.blockTime,
          label = $$("#schedule-form [data-block-label]").find(
            (i) => i.dataset.blockLabel === id,
          ).value;
        let b = session.state.schedule.find((b2) => b2.id === id);
        if (b) Object.assign(b, { time: el.value, label, hidden: false });
        else session.state.schedule.push({ id, time: el.value, label });
      });
      save();
      $("#modal").close();
      render();
      break;
    case "block-form":
      session.state.schedule.push({
        id: uid(),
        label: data.label.trim(),
        time: data.time,
      });
      save();
      $("#modal").close();
      showSchedule();
      break;
  }
});
$("#wizard").addEventListener("cancel", (e) => {
  e.preventDefault();
  if (session.state.onboarded) {
    $("#wizard").close();
    session.lang = session.state.profile.language;
    render();
  } else if (validateDraft()) finishPlan();
});
window.addEventListener("storage", (e) => {
  if (e.key === storage.key) {
    toast("Another tab changed your data. Reload to see the latest records.");
  }
});
session.lang = "en";
session.storageError = false;
session.state = await storage.load();
import("./optional-content.js?v=2.1.0").then(m=>m.loadOptionalFont()).catch(()=>{});
session.lang = ["en", "ar", "ur", "ml", "hi"].includes(
  session.state.profile.language,
)
  ? session.state.profile.language
  : "en";
await loadTranslations(session.lang);
session.draftDebts = [];
session.draftDebt = { name: "", total: "", paid: 0 };
session.page = "today";
session.tool = "tasbih";
session.selectedDate = today();
session.month = today().slice(0, 7);
session.adhkarTab = "morning";
session.charts = [];
session.wizardStep = 0;
session.draft = null;
session.wordIndex = 0;
session.wordReveal = false;
session.installEvent = null;
session.offlineReady = false;
session.lastToday = today();
window.SOURCE_DATA = { quran: [], hadith: [], names: [], adhkar: [] };
await storage
  .snapshot()
  .catch(() => toast("Safety copies are unavailable. Export a file backup."));
render();
if (!session.state.onboarded && !session.storageError) showWizard();
if (session.storageError)
  toast("Saved data could not be read. Import a backup before making changes.");
maybeRamadanSetup();
registerWorker();
loadInitialContent()
  .then(() => {
    if (
      ["today", "reflections"].includes(session.page) ||
      (session.page === "tools" && session.tool === "tasbih")
    )
      render();
    return loadHadith();
  })
  .then(() => {
    if (session.page === "today") render();
  })
  .catch(() => toast("Readings could not be loaded. Your records are safe."));
setInterval(() => {
  releaseNotes();
  prayerService.tick();
  ramadanTick();
  tickTimer();
  let now = today();
  if (now !== session.lastToday) {
    if (session.selectedDate === session.lastToday) session.selectedDate = now;
    if (session.month === session.lastToday.slice(0, 7))
      session.month = now.slice(0, 7);
    session.lastToday = now;
    maybeRamadanSetup();
    render();
  }
}, 1e3);
window.Istiqamah = {
  get state() {
    return session.state;
  },
  engine,
  ramadanService,
  prayerService,
  hijriService,
  quranService,
  hadithService,
  adhkarService,
  adhkarLibrary,
  storage,
  ui,
  score,
  categoryScore,
  streak,
  habitStreak,
  today,
  getDay,
  offsetDay,
  zonedDate,
  currentSchedule,
  exportCalendar,
  validate,
  render,
};
