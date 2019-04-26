/* global chrome */

(() => {
  const miri = {
    log: (...args) => {
      console.log('[MIRI]', ...args);
    },
  };

  const kanaToHira = (str = '') => str.replace(/[\u30a1-\u30f6]/g, (match) => {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });

  const renderKana = hirakana => document.createTextNode(hirakana);

  const renderKanji = (hirakana, kanji) => {
    const el = document.createElement('ruby');
    el.innerHTML = `${kanji}<rt>${hirakana}</rt>`;
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
          surfix.push(ahira.pop());
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

  const registerMutationHook = () => {
    const MAIN_CONTAINER_SELECTOR = 'main';
    const TL_CONTAINER_SELECTOR = 'section>div>div>div.css-1dbjc4n';
    const TWEET_ARTICLE_SELECTOR = 'article div[lang=ja]';

    const mainContainer = document.querySelector(MAIN_CONTAINER_SELECTOR);

    if (!mainContainer) {
      miri.log('not found main container element.');
      return;
    }

    const observer = new MutationObserver((mutationsList) => {
      const tlContainer = document.querySelector(TL_CONTAINER_SELECTOR);
      if (!tlContainer) {
        // timeline container should be rendered
        return;
      }

      mutationsList.forEach((mutation) => {
        const { addedNodes } = mutation;

        if (!addedNodes.length) {
          // ignore the non-add events
          return;
        }

        addedNodes.forEach((node) => {
          if (node.nodeType !== 1) {
            // node type should be element(1)
            return;
          }

          const allContainers = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
          allContainers.forEach(addRuby);
        });
      });
    });

    observer.observe(mainContainer, { childList: true, subtree: true });
  };

  waitForTimeline()
    .then(() => {
      miri.log('timeline loaded.');
      registerMutationHook();
    }).catch((e) => {
      miri.log('timeline load tiemout.');
    });
})();
