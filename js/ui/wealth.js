import { session } from "../session.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";
import { esc, money } from "../utils.js?v=2.1.0";

function view_wealth() {
  let total = session.state.debts.reduce((s, d) => s + d.total, 0),
    paid = session.state.debts.reduce((s, d) => s + d.paid, 0),
    percent = total ? Math.round((paid / total) * 100) : 0;
  let z = session.state.zakat,
    assets =
      (+z.cash || 0) +
      (+z.gold || 0) * (+z.goldPrice || 0) +
      (+z.silver || 0) * (+z.silverPrice || 0) +
      (+z.stock || 0) +
      (+z.receivables || 0) -
      (+z.due || 0),
    nisab = (+z.goldPrice || 0) * 85;
  return `<div class="grid"><div class="stack">${session.state.profile.hasDebts ? `<section class="card"><div class="cardhead"><h2>${t("Debt tracker")}</h2><span class="badge">${percent}% ${t("Debt-free")}</span></div><div class="progress-track"><div style="width:${percent}%"></div></div><p class="muted" style="font-size:12px;margin:10px 0">${money(paid)} / ${money(total)}</p>${session.state.debts.map((d) => `<div class="list-row"><div class="debt-title"><strong>${esc(d.name)}</strong><span>${money(d.paid)} / ${money(d.total)}</span></div><div class="row section-gap"><input type="number" min="0.01" max="${d.total - d.paid}" step="0.01" id="pay-${d.id}" aria-label="${t("Log payment")}"><button class="btn secondary" data-action="pay" data-id="${d.id}" ${d.paid >= d.total ? "disabled" : ""}>${t("Log payment")}</button></div><details style="margin-top:8px"><summary class="subtle">${t("Payment history")}</summary>${(d.payments || []).map((p) => `<p class="subtle">${p.date} \xB7 ${money(p.amount)}</p>`).join("")}</details></div>`).join("")}<form id="debt-form" class="section-gap"><h3>${t("Add debt")}</h3><label>${t("Debt name")}</label><input name="name" required maxlength="80"><div class="formgrid"><div><label>${t("Total")}</label><input name="total" type="number" min="0.01" max="1000000000000" step="0.01" required></div><div><label>${t("Already paid")}</label><input name="paid" type="number" min="0" step="0.01" value="0" required></div></div><button class="btn section-gap">${t("Add debt")}</button></form></section>` : `<section class="card"><h2>${t("Debt tracker")}</h2><label class="inline-check"><input type="checkbox" id="enable-debts">${t("I have debts")}</label></section>`}<section class="card"><h2>${t("Monthly savings goal")}</h2><div class="formgrid"><div><label>${t("Target")}</label><input type="number" min="0" data-profile="savings" value="${+session.state.profile.savings || 0}"></div><div><label>${t("Savings this month")} \xB7 ${session.month}</label><input type="number" id="savings-amount" min="0" value="${session.state.savings[session.month] || 0}"></div></div><div class="progress-track section-gap"><div style="width:${Math.min(100, ((session.state.savings[session.month] || 0) / (session.state.profile.savings || 1)) * 100)}%"></div></div></section></div><section class="card"><h2>${t("Zakat calculator")}</h2><small>${t("Your data never leaves your phone.")}</small><div class="notice">${session.lang === "ar" ? "\u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0645\u0644\u0629 \u0646\u0641\u0633\u0647\u0627 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0628\u0627\u0644\u063A. \u0627\u0644\u062A\u0642\u062F\u064A\u0631 \u064A\u0641\u062A\u0631\u0636 \u0645\u0631\u0648\u0631 \u062D\u0648\u0644 \u0642\u0645\u0631\u064A." : session.lang === "ur" ? "\u062A\u0645\u0627\u0645 \u0631\u0642\u0648\u0645 \u0627\u06CC\u06A9 \u06C1\u06CC \u06A9\u0631\u0646\u0633\u06CC \u0645\u06CC\u06BA \u062F\u0631\u062C \u06A9\u0631\u06CC\u06BA\u06D4 \u062A\u062E\u0645\u06CC\u0646\u06C1 \u0627\u06CC\u06A9 \u0642\u0645\u0631\u06CC \u0633\u0627\u0644 \u06AF\u0632\u0631\u0646\u06D2 \u06A9\u0627 \u0641\u0631\u0636 \u06A9\u0631\u062A\u0627 \u06C1\u06D2\u06D4" : session.lang === "ml" ? "എല്ലാ തുകകൾക്കും ഒരേ കറൻസി ഉപയോഗിക്കുക. കണക്കുകൂട്ടൽ ഒരു ചാന്ദ്ര വർഷത്തെ ഉടമസ്ഥത അനുമാനിക്കുന്നു." : session.lang === "hi" ? "सभी राशियों के लिए एक ही मुद्रा का उपयोग करें। अनुमान एक चंद्र वर्ष के स्वामित्व को मानता है।" : "Use one currency for all amounts. Estimate assumes one lunar year of ownership."}</div><div class="formgrid">${[
    ["cash", "Cash"],
    ["gold", "Gold (grams)"],
    ["goldPrice", "Gold price per gram"],
    ["silver", "Silver (grams)"],
    ["silverPrice", "Silver price per gram"],
    ["stock", "Business stock"],
    ["receivables", "Receivables"],
    ["due", "Debts due"],
  ]
    .map(
      ([k, l]) =>
        `<div><label>${t(l)}</label><input type="number" data-zakat="${k}" min="0" step="0.01" value="${+z[k] || 0}"></div>`,
    )
    .join(
      "",
    )}</div><div class="notice"><div>${t("Nisab (85g gold)")}: ${nisab ? money(nisab) : "\u2014"}</div><h2>${t("Estimated zakat")}: ${nisab ? money(assets >= nisab ? Math.max(0, assets) * 0.025 : 0) : "\u2014"}</h2><p>${t("Consult a scholar for your specific case.")}</p></div></section></div>`;
}
export { view_wealth };
