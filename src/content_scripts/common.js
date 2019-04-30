/* eslint no-unused-vars: 0 */
/* global
chrome
MIRI_EVENTS
*/

const miri = {
  log: (...args) => {
    console.log('[MIRI]', ...args);
  },
};

// inject the css file into the head element
const appendStyleNode = (id, pct) => {
  const head = document.querySelector('head');
  const oldNode = document.querySelector(`#${id}`);
  if (oldNode) {
    head.removeChild(oldNode);
  }

  const cssNode = document.createElement('style');
  cssNode.id = id;
  cssNode.textContent = `
ruby > rt {
  font-size: ${pct}%;
}
`;
  head.appendChild(cssNode);
};

const kanaToHira = (str = '') => str.replace(/[\u30a1-\u30f6]/g, (match) => {
  const chr = match.charCodeAt(0) - 0x60;
  return String.fromCharCode(chr);
});

const getKanaTag = tag => `<img alt="${tag}" src='data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"></svg>' />`;

const renderKana = hirakana => document.createTextNode(hirakana);

const renderKanji = (hirakana, kanji) => {
  const el = document.createElement('ruby');
  // const kanaStart = getKanaTag('<%');
  // const kanaEnd = getKanaTag('%>');
  const kanaStart = getKanaTag('(');
  const kanaEnd = getKanaTag(')');

  el.innerHTML = `${kanji}<rt>${kanaStart}${hirakana}${kanaEnd}</rt>`;
  return el;
};

const renderRuby = (container, token) => {
  token.forEach((r) => {
    const { reading, surface_form } = r;

    const partialKanjiRegex = /[\u4E00-\u9FFF]/;
    const allKanjiRegex = /^[\u4E00-\u9FFF]*$/;

    if (allKanjiRegex.test(surface_form)) {
      // all kanji
      const hira = kanaToHira(reading);
      container.appendChild(renderKanji(hira, surface_form));
    } else if (partialKanjiRegex.test(surface_form)) {
      // partial, remove ending kana
      const hira = kanaToHira(reading);

      const ahira = hira.split('');
      const akanji = surface_form.split('');
      const surfix = [];
      while (ahira.length && ahira[ahira.length - 1] === akanji[akanji.length - 1]) {
        surfix.unshift(ahira.pop());
        akanji.pop();
      }

      const okanji = akanji.join('');
      const ohira = ahira.join('');
      const lhira = surfix.join('');

      container.appendChild(renderKanji(ohira, okanji));
      container.appendChild(renderKana(lhira));
    } else {
      // kana
      container.appendChild(renderKana(surface_form));
    }
  });
};

const waitForTimeline = () => new Promise((resolve, reject) => {
  let interval = null;
  let timeout = null;

  interval = setInterval(() => {
    if (document.querySelector('main')) {
      clearInterval(interval);
      clearTimeout(timeout);
      resolve();
    }
  }, 500);

  timeout = setTimeout(() => {
    clearInterval(interval);
    reject();
  }, 20000);
});

const addRuby = (container) => {
  // tweet container can has multiple parts
  // plain text, anchor, hashtags...
  // each parts can only has 1 child element/node
  // find the plain text and render it with ruby

  [...container.children].forEach((c) => {
    if (c.childElementCount) {
      // contaniner should only has text node
      return;
    }

    if (c.tagName !== 'SPAN') {
      // child should has span sub-child
      return;
    }

    if (!c.childNodes.length || c.childNodes.nodeType === 3) {
      // sub-child should has text node(3)
      return;
    }

    const { textContent } = c.childNodes[0];
    if (!textContent.trim().length) {
      // text content should not empty
      return;
    }

    miri.log('Raw:', textContent);
    chrome.runtime.sendMessage({
      event: MIRI_EVENTS.REQUEST_TOKEN,
      text: textContent,
    }, (response) => {
      if (!response) {
        miri.log('Error: token response is invalid for', textContent);
      }

      // clear origin text
      c.innerText = '';
      renderRuby(c, response);
    });
  });
};
