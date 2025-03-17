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

const kanaConvert = (kana, isHiraToKata) => {
  if (isHiraToKata && !/[ぁ-ん]/.test(kana)) {
    return kana;
  }
  if (!isHiraToKata && !/[ァ-ン]/.test(kana)) {
    return kana;
  }
  const MAGIC = isHiraToKata ? 96 : -96;
  return String.fromCharCode(kana.charCodeAt(0) + MAGIC);
};

const hira2kata = (str) => str.split('').map((c) => kanaConvert(c, true)).join('');

const kata2hira = (str) => str.split('').map((c) => kanaConvert(c, false)).join('');

const sameKana = (kana1, kana2) => hira2kata(kana1) === hira2kata(kana2);

// https://stackoverflow.com/questions/70302587/how-to-use-substring-with-special-unicode-characters
const substrEx = (text, from, len) => [...text].slice(from, len).join('');

const countSameChar = (arr, char) => arr.reduce((a, b) => {
  if (b === char) {
    a += 1;
  }
  return a;
}, 0);

const countSameCharForSurfaceGroup = (surfaceGroup, char, blockIndex) => {
  return surfaceGroup.reduce((acc, sg, idx) => {
    if(idx > blockIndex && sg.s === char) {
        acc +=1;
    }
    return acc;
  }, 0);
}

// smash the token into the substring which not mixed kanji and kana
const smash = (tkn) => {
  // prepare the data structure
  const surfaceGroup = [...tkn.s].reduce((group, curr, idx) => {
    const isKanji = !(/[ぁ-んァ-ン]/).test(curr);
    if (idx === 0 || !isKanji || isKanji !== group.lastIsKanji) {
      group.push({
        s: curr,
        isKanji,
        r: [],
        p: tkn.p + idx,
      });
    } else {
      // should merge
      const last = group[group.length - 1];
      last.s = `${last.s}${curr}`;
    }

    group.lastIsKanji = isKanji;
    return group;
  }, []);

  // attach reading
  const readArray = [...tkn.r];
  for (let i = 0, blockIndex = 0; i < readArray.length;) {
    const curr = readArray.shift();
    const block = surfaceGroup[blockIndex];

    if (!block.isKanji) {
      block.r.push(curr);
      blockIndex += 1;
      continue;
    }

    const nextBlock = surfaceGroup[blockIndex + 1];
    if (
      nextBlock
      && !nextBlock.isKanji
      && curr === nextBlock.s
      && countSameChar(readArray, curr) - countSameCharForSurfaceGroup(surfaceGroup, curr, blockIndex + 1) === 0
    ) {
      nextBlock.r.push(curr);
      blockIndex += 2;
      continue;
    }

    block.r.push(curr);
  }

  return surfaceGroup
    .filter((sg) => sg.isKanji)
    .map((sg) => ({
      s: sg.s,
      r: sg.r.join(''),
      p: sg.p,
    }));
};

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

const setRubyVisibility = (id, visible) => {
  updateStyleNode(id, `
rt.furigana {
  ${visible ? '' : 'display: none;'}
}
`);
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

    // hide furigana on text being selected
    document.addEventListener('selectionchange', () => {
      if (!SettingStorage.get('kanaless')) {
        return;
      }

      const selection = document.getSelection();
      if (!selection.isCollapsed) {
        // not selected any text
        return;
      }

      if (!tweetContainer.contains(selection.anchorNode)) {
        // the selection is not belongs to the container
        return;
      }

      container.querySelectorAll('.furigana').forEach((rb) => {
        rb.style.visibility = 'hidden';
      });
      window.__mirigana__.hiddenRubyContainers.push(tweetContainer);
    });
  }

  const text = container.innerText;

  // smash the token to the kanji-only token
  const smashed = token.reduce((ret, tkn) => ret.concat(smash(tkn)), []);

  // create blocks from smashed token
  let pos = 0;
  const blocks = [];
  smashed.forEach((r) => {
    if (r.p !== pos) {
      blocks.push({
        s: substrEx(text, pos, r.p)
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
      s: substrEx(text, pos)
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
