export function bindPhase2Events(ctx) {
  const { getState, getDay, today, offsetDay, dateObj, prayerService, hijriService, t, esc, icon, save, render, toast } = ctx;
  const state = () => getState();
  const config = () => state().phase2.ramadan;
  const dhikrConfig = () => state().phase2.adhkar;
  const label = (entry) => t(entry.categoryLabel);
  const { adhkarLibrary: adhkar, ramadanService: ramadan } = ctx;
  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-phase-action]");
    if (!el || el.disabled) return;
    if (el.dataset.phaseAction === "favorite") adhkar.toggleFavorite(el.dataset.id);
    if (el.dataset.phaseAction === "dhikr-previous") adhkar.move(-1);
    render();
  });
  document.addEventListener("change", (event) => {
    const el = event.target;
    switch (el.id) {
      case "adhkar-category":
        dhikrConfig().category = el.value;
        save();
        render();
        break;
      case "dhikr-personal-target": {
        const entry = adhkar.selected();
        if (!entry || entry.count) return;
        if (!el.value) delete dhikrConfig().personalTargets[entry.id];
        else if (el.checkValidity()) dhikrConfig().personalTargets[entry.id] = Number(el.value);
        else {
          el.reportValidity();
          return;
        }
        save();
        render();
        break;
      }
      case "ramadan-today-toggle":
        ramadan.setEnabled(el.checked);
        render();
        break;
      case "ramadan-fasting":
        ramadan.setFasting(ctx.selectedDate(), el.value);
        render();
        break;
    }
  });
  document.addEventListener("input", (event) => {
    const el = event.target;
    if (el.id === "adhkar-search") {
      const position = el.selectionStart;
      dhikrConfig().search = el.value;
      save();
      render();
      const input = document.querySelector("#adhkar-search");
      input.focus();
      input.setSelectionRange(position, position);
    }
    if (["ramadan-reason", "ramadan-night-goals"].includes(el.id)) {
      const r = getDay(ctx.selectedDate()).ramadan;
      if (r) {
        r[el.id === "ramadan-reason" ? "reason" : "nightGoals"] = el.value;
        save();
      }
    }
  });
  document.addEventListener("submit", (event) => {
    if (event.target.id === "ramadan-settings") {
      event.preventDefault();
      if (ramadan.apply(event.target)) {
        render();
        toast("Saved");
      }
    }
  });
}
