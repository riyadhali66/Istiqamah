import { session } from "./session.js?v=1.2.0";

const engine = {
  generate(p) {
    let pool = [],
      add = (id, label, category, target = 1, unit = "", extra = {}) => {
        if (!pool.some((h) => h.id === id))
          pool.push({ id, label, category, target, unit, weight: 1, ...extra });
      };
    const prayers = () =>
      ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].forEach((n) =>
        add("prayer-" + n, "Pray " + n, "Faith", 1, "", {
          prayer: true,
          weight: 3,
        }),
      );
    prayers();
    let candidates = [];
    const collect = () => {
      candidates = pool.slice(5);
      pool = pool.slice(0, 5);
    };
    add("quran", "Read Quran", "Faith", 2, "pages");
    add("adhkar-am", "Morning adhkar", "Faith");
    if (p.hasDebts) {
      add("no-spend", "No unplanned spending", "Debt Freedom");
      add("expenses", "Log expenses", "Debt Freedom");
    }
    if (p.work === "Business owner") {
      add("leads", "Leads contacted", "Wealth & Career", 3, "");
      add("sales", "New clients / sales", "Wealth & Career", 1, "");
      add("top3", "Top 3 tasks before noon", "Wealth & Career", 3, "");
      add("marketing", "One marketing post", "Wealth & Career");
    }
    if (p.work === "Job seeker") {
      add("jobs", "Apply to 2 jobs", "Wealth & Career", 2, "");
      add("cv", "Improve CV / LinkedIn", "Wealth & Career", 20, "minutes");
    }
    if (p.work === "Student") {
      add("study", "Study focus blocks", "Skills", 2, "");
      add("revision", "Revision", "Skills", 20, "minutes");
    }
    if (p.kids > 0) {
      add("family", "Family time", "Family", 20, "minutes");
      add("kids-quran", "Quran with kids", "Family", 10, "minutes");
      add("homework", "Help with homework", "Family");
    }
    if (p.struggles.includes("Stress / anxiety")) {
      add("gratitude", "Gratitude reflection", "Mental Wellbeing");
      add("walk", "Morning walk", "Health & Fitness", 10, "minutes");
      add("adhkar-pm", "Evening adhkar", "Faith");
      add("phone-off", "Phone off before bed", "Mental Wellbeing");
    }
    if (p.struggles.includes("Poor sleep")) {
      add("phone-off", "Phone off before bed", "Mental Wellbeing");
      add("sleep", "Sleep hours", "Health & Fitness", 8, "hours");
    }
    if (p.struggles.some((s) => ["Laziness", "Procrastination"].includes(s))) {
      add("two-min", "Start in 2 minutes", "Mental Wellbeing");
      add("walk", "Morning walk", "Health & Fitness", 10, "minutes");
      add("top3", "Top 3 tasks before noon", "Wealth & Career", 3, "");
    }
    if (p.struggles.includes("Phone addiction"))
      add("phone-off", "Phone off before bed", "Mental Wellbeing");
    if (p.struggles.includes("Loneliness"))
      add("connect", "Connect with someone", "Mental Wellbeing");
    if (p.goals.includes("Language Learning")) {
      add(
        "listen",
        "Listen in your target language",
        "Language Learning",
        10,
        "minutes",
      );
      add("words", "Learn 5 new words", "Language Learning", 5, "");
    }
    if (
      p.goals.includes("Health & Fitness") ||
      p.struggles.includes("Unhealthy eating")
    ) {
      add("water", "Drink water", "Health & Fitness", 8, "glasses");
      add("walk", "Morning walk", "Health & Fitness", 10, "minutes");
      add("steps", "Daily steps", "Health & Fitness", 6e3, "steps");
      add("workout", "Workout", "Health & Fitness", 20, "minutes");
      add("food", "No sugar or junk food", "Health & Fitness");
    }
    if (p.goals.includes("Skills"))
      add("skill", "Learn a skill", "Skills", 20, "minutes");
    if (p.goals.includes("Family"))
      add("family", "Family time", "Family", 20, "minutes");
    if (p.goals.includes("Wealth & Career")) {
      add("top3", "Top 3 tasks before noon", "Wealth & Career", 3, "");
      add("expenses", "Log expenses", "Wealth & Career");
    }
    if (p.goals.includes("Mental Wellbeing"))
      add("gratitude", "Gratitude reflection", "Mental Wellbeing");
    if (p.start.includes("Tahajjud")) add("tahajjud", "Tahajjud", "Faith");
    if (p.start.includes("Quran memorization"))
      add("memorize", "Quran memorization", "Faith", 10, "minutes");
    if (p.start.includes("Sunnah fasting"))
      add("fast-plan", "Sunnah fasting", "Faith", 1, "", { fasting: true });
    add("adhkar-pm", "Evening adhkar", "Faith");
    add("plan", "Plan tomorrow", "Skills");
    add("gratitude", "Gratitude reflection", "Mental Wellbeing");
    add("sleep", "Sleep hours", "Health & Fitness", 8, "hours");
    add("water", "Drink water", "Health & Fitness", 8, "glasses");
    add("walk", "Morning walk", "Health & Fitness", 10, "minutes");
    add("skill", "Learn a skill", "Skills", 20, "minutes");
    add("connect", "Connect with someone", "Family");
    add("steps", "Daily steps", "Health & Fitness", 6e3, "steps");
    add("workout", "Workout", "Health & Fitness", 20, "minutes");
    add("food", "No sugar or junk food", "Health & Fitness");
    add("phone-off", "Phone off before bed", "Mental Wellbeing");
    add("expenses", "Log expenses", "Wealth & Career");
    add(
      "listen",
      "Listen in your target language",
      "Language Learning",
      10,
      "minutes",
    );
    add("words", "Learn 5 new words", "Language Learning", 5, "");
    collect();
    candidates.sort((a, b) => {
      let rank = (h) =>
        p.goals.includes(h.category) ? p.goals.indexOf(h.category) : 20;
      return rank(a) - rank(b);
    });
    let selected = [],
      choose = (id) => {
        let h = candidates.find((h2) => h2.id === id);
        if (h && !selected.some((x) => x.id === id)) selected.push(h);
      };
    if (p.hasDebts) {
      choose("no-spend");
      choose("expenses");
    }
    if (p.work === "Job seeker") choose("jobs");
    if (p.work === "Business owner") choose("leads");
    if (p.work === "Student") choose("study");
    if (p.kids > 0) choose("family");
    for (let c of p.goals) {
      let h = candidates.find((h2) => h2.category === c);
      if (h) choose(h.id);
    }
    if (p.struggles.includes("Stress / anxiety")) choose("gratitude");
    if (p.struggles.includes("Poor sleep")) choose("sleep");
    candidates = [
      ...selected,
      ...candidates.filter((h) => !selected.some((x) => x.id === h.id)),
    ];
    let count =
      p.commitment === "Gentle start"
        ? 9
        : p.commitment === "Balanced"
          ? 14
          : 20;
    return {
      habits: pool.concat(candidates).slice(0, count),
      next: candidates.find(
        (h) => !session.state.habits.some((s) => s.id === h.id),
      ),
    };
  },
  next() {
    const p = { ...session.state.profile, commitment: "Full power" },
      all = this.generate(p).habits;
    return all.find((h) => !session.state.habits.some((s) => s.id === h.id));
  },
};

export { engine };
