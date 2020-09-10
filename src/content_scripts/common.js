/* eslint no-unused-vars: 0 */
/* global

MIRI_EVENTS

SettingStorage
*/

window.__mirigana__ = (window.__mirigana__ || {}); // eslint-disable-line no-underscore-dangle
window.__mirigana__.hiddenRubyContainers = []; // eslint-disable-line no-underscore-dangle

const isFirefox = () => (typeof InstallTrigger !== 'undefined');
const isChrome = () => (!!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime));

const getKanaTag = (tag) => `<img alt="${tag}" src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>' />`;
const renderKana = (hirakana) => document.createTextNode(hirakana);

// inject the css file into the head element
const updateStyleNode = (id, content) => {
  const head = document.querySelector('head');
  const oldNode = document.querySelector(`#${id}`);

  const cssNode = oldNode || document.createElement('style');
  cssNode.textContent = content;

  if (!oldNode) {
    cssNode.id = id;
    head.appendChild(cssNode);
  }
};

const updateRubySizeStyle = (id, pct) => {
  updateStyleNode(id, `
rt.furigana {
  font-size: ${pct}%;
}`);
};

const updateRubyColorStyle = (id, color) => {
  updateStyleNode(id, `
rt.furigana {
  color: ${color};
}`);
};

const updateNoSelectStyle = (id, kanaless) => {
  updateStyleNode(id, `
rt.furigana {
  user-select: ${kanaless ? 'none' : 'text'};
}`);
};

const renderKanji = (hirakana, kanji) => {
  const el = document.createElement('ruby');
  const kanaStart = getKanaTag('(');
  const kanaEnd = getKanaTag(')');

  el.innerHTML = `${kanji}<rt class="furigana">${kanaStart}${hirakana}${kanaEnd}</rt>`;
  return el;
};

const renderRuby = (container, token) => {
  // hidden ruby on contextmenu
  if (isChrome()) {
    const tweetContainer = container.parentElement;
    tweetContainer.addEventListener('contextmenu', () => {
      if (!SettingStorage.get('kanaless')) {
        return;
      }

      container.querySelectorAll('.furigana').forEach((rb) => {
        rb.style.visibility = 'hidden';
      });
      window.__mirigana__.hiddenRubyContainers.push(tweetContainer);
    });
  }

  const text = container.innerText;

  // smash the token contains both kanji and kana
  // split it to <kana+kanji+kana> form
  const smashed = [];
  token.forEach((r) => {
    if (!r.r) {
      smashed.push(r);
      return;
    }

    const asurface = r.s.split('');
    const areading = r.r.split('');

    const ahira = [];
    const bhira = [];
    while (asurface[0] === areading[0]) {
      ahira.push(asurface[0]);
      asurface.shift();
      areading.shift();
    }

    while (asurface[asurface.length - 1] === areading[areading.length - 1]) {
      bhira.push(asurface[asurface.length - 1]);
      asurface.pop();
      areading.pop();
    }

    smashed.push({
      s: asurface.join(''),
      r: areading.join(''),
      p: r.p + ahira.length,
    });
  });

  // create blocks from smashed token
  let pos = 0;
  const blocks = [];
  smashed.forEach((r) => {
    if (r.p !== pos) {
      blocks.push({
        s: text.substr(pos, r.p - pos),
      });
      pos = r.p;
    }
    blocks.push({
      s: r.s,
      r: r.r,
    });
    pos += r.s.length;
  });

  if (text.length > pos) {
    blocks.push({
      s: text.substr(pos),
    });
  }

  // clear the original text
  container.innerText = '';
  blocks.forEach((b) => {
    if (b.r) {
      // contains kanji
      container.appendChild(renderKanji(b.r, b.s));
    } else {
      // all kana or unparsed kanji
      container.appendChild(renderKana(b.s));
    }
  });
};

if (isChrome()) {
  // show all ruby be hidden
  document.addEventListener('selectionchange', () => {
    if (document.getSelection().isCollapsed) {
      // text selection has been cleared
      window.__mirigana__.hiddenRubyContainers.forEach((c) => {
        c.querySelectorAll('.furigana').forEach((rb) => {
          rb.style.visibility = 'visible';
        });
      });

      window.__mirigana__.hiddenRubyContainers = [];
    }
  });
}

if (isFirefox()) {
  updateStyleNode('miri-ruby-align', `
ruby {
  ruby-align: space-between;
}`);
}
