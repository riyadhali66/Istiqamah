import { session } from "../session.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";

function view_tools() {
  let tabs = [
    ["ramadan", "Ramadan"],
    ["tasbih", "Tasbih"],
    ["wealth", "Wealth"],
    ["fasting", "Fasting"],
    ["words", "Word log"],
    ...(session.state.profile.kids > 0 ? [["kids", "Kids Mode"]] : []),
  ];
  return (
    this.heading(
      t("My toolkit"),
      "Small deeds. Every day. Limitless results.",
    ) +
    `<div class="tabs">${tabs.map(([id, title]) => `<button class="tab ${session.tool === id ? "active" : ""}" data-action="tool" data-id="${id}">${t(title)}</button>`).join("")}</div>` +
    (
      {
        ramadan: () => this.ramadan(),
        tasbih: () => this.tasbih(),
        wealth: () => this.wealth(),
        fasting: () => this.fasting(),
        words: () => this.words(),
        kids: () => this.kids(),
      }[session.tool] || (() => this.tasbih())
    )()
  );
}
export { view_tools };
