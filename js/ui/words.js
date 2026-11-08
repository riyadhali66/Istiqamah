import { t } from "../i18n.js?v=2.1.0";
import { session } from "../session.js?v=2.1.0";
import { esc } from "../utils.js?v=2.1.0";

function view_words() {
  return `<div class="grid"><section class="card"><h2>${t("Word log")}</h2><form id="word-form"><label>${t("Word")}</label><input name="word" required maxlength="120"><label>${t("Meaning")}</label><input name="meaning" required maxlength="500"><label>${t("Example sentence")}</label><textarea name="example" maxlength="1000"></textarea><button class="btn section-gap">${t("Add word")}</button></form></section><section class="card"><div class="cardhead"><h2>${t("Review words")}</h2><span class="badge">${session.state.words.length}</span></div>${
    session.state.words.length
      ? (() => {
          session.wordIndex %= session.state.words.length;
          let w = session.state.words[session.wordIndex];
          return `<div class="word-card"><h2>${esc(w.word)}</h2>${session.wordReveal ? `<p>${esc(w.meaning)}</p><small>${esc(w.example)}</small>` : `<button class="linkbtn section-gap" data-action="reveal">${t("Reveal answer")}</button>`}</div><button class="btn secondary" data-action="next-word">${t("Next word")} \u2192</button>`;
        })()
      : `<div class="empty">${t("Add word")}</div>`
  }</section><section class="card full">${session.state.words.map((w) => `<div class="list-row row between"><div><h3>${esc(w.word)}</h3><p>${esc(w.meaning)}</p><small>${esc(w.example)}</small></div><button class="linkbtn" data-action="remove-word" data-id="${w.id}">${t("Remove")}</button></div>`).join("")}</section></div>`;
}
export { view_words };
