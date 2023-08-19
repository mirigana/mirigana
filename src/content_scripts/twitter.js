/* global
MIRI_EVENTS

Miri
SettingStorage
log
debug

renderRuby
setRubyVisibility
updateRubySizeStyle
updateRubyColorStyle
updateNoSelectStyle
*/

const onTokenReady = (c, t) => {
  renderRuby(c, t);
};

SettingStorage.on('updated', (settings) => {
  const {
    enabled,
    pct,
    kanaless,
    color
  } = settings;
  setRubyVisibility('miri-ruby-visible', enabled);
  updateRubySizeStyle('miri-ruby', pct);
  updateRubyColorStyle('miri-ruby-color', color);
  updateNoSelectStyle('miri-no-select', kanaless);
});

const miri = new Miri({
  onTokenReady,
});

const registerMutationHook = () => {
  const MAIN_CONTAINER_SELECTOR = '#react-root';
  const TL_CONTAINER_SELECTOR = 'section>div>div>div';
  const TWEET_ARTICLE_SELECTOR = 'article div[lang=ja]';

  const mainContainer = document.querySelector(MAIN_CONTAINER_SELECTOR);

  if (!mainContainer) {
    log('not found main container element.');
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    const tlContainer = document.querySelector(TL_CONTAINER_SELECTOR);
    if (!tlContainer) {
      // timeline container should be rendered
      return;
    }

    const tweetBag = [];
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;

      if (!addedNodes.length) {
        // ignore the non-add events
        return;
      }

      if (
        addedNodes.length === 1 && (
          addedNodes[0].nodeType === 3 ||
          addedNodes[0].tagName === "RUBY"
        )
      ) {
        // ignore kana updates
        return;
      }

      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) {
          // node type should be element(1)
          return;
        }

        const articles = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
        articles.forEach((article) => {
          [...article.children].forEach((c) => {
            if (c.childElementCount) {
              // contaniner should only has text node
              return;
            }

            if (c.tagName === 'IMG') {
              // the data-emoji-text will cause the bug that
              // chrome copy the hidden ruby text unexpectly
              // this is a workaround, may cause some issue
              // on accessibility
              if (c.dataset.emojiText) {
                c.removeAttribute('data-emoji-text');
              }
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

            // Twitter bug 2020-08-17 ?
            // sometimes twitter will update same element twice with unknown rease
            // unique the result to prevent appending duplicate ruby
            const duplicated = tweetBag.some((t) => t.c === c && t.tc === textContent);
            if (duplicated) {
              return;
            }

            tweetBag.push({
              c,
              tc: textContent,
            });
          });
        });
      });
    });

    if (tweetBag.length) {
      miri.addTweets(tweetBag);
    }
  });

  observer.observe(mainContainer, { childList: true, subtree: true });
};

const registerDeckMutationHook = () => {
  const MAIN_CONTAINER_SELECTOR = 'body>div.application';
  const COLUMN_CONTAINER_SELECTOR = 'div.column-scroller';
  const TWEET_ARTICLE_SELECTOR = 'p.tweet-text[lang=ja]';

  const mainContainer = document.querySelector(MAIN_CONTAINER_SELECTOR);

  if (!mainContainer) {
    log('not found main container element.');
    return;
  }

  const observer = new MutationObserver((mutationsList) => {
    const columnContainer = document.querySelector(COLUMN_CONTAINER_SELECTOR);
    if (!columnContainer) {
      // column container should be rendered
      return;
    }

    const tweetBag = [];
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;

      if (!addedNodes.length) {
        // ignore the non-add events
        return;
      }

      if (
        addedNodes.length === 1 && (
          addedNodes[0].nodeType === 3 ||
          addedNodes[0].tagName === "RUBY" ||
          addedNodes[0].tagName === "SPAN"
        )
      ) {
        // ignore kana updates
        return;
      }

      addedNodes.forEach((node) => {
        if (node.nodeType !== 1) {
          // node type should be element(1)
          return;
        }

        const articles = node.querySelectorAll(TWEET_ARTICLE_SELECTOR);
        articles.forEach((article) => {
          [...article.childNodes].forEach((c) => {
            if (c.nodeType !== 3) {
              // only get text node(3)
              return
            }

            const { textContent } = c;
            if (!textContent.trim().length) {
              // text content should not empty
              return;
            }

            const textSpan = document.createElement("span");
            article.replaceChild(textSpan, c);
            tweetBag.push({
              c: textSpan,
              tc: textContent,
            });
          });
        });
      });
    });

    if (tweetBag.length) {
      miri.addTweets(tweetBag);
    }
  });

  observer.observe(mainContainer, { childList: true, subtree: true });
};

// main
log('initialized.');
setTimeout(registerMutationHook, 100);
registerDeckMutationHook();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, value } = request;
  if (event === MIRI_EVENTS.TOGGLE_EXTENSION) {
    setRubyVisibility('miri-ruby-visible', value);
    SettingStorage.set({ enabled: value });
  } else if (event === MIRI_EVENTS.UPDATE_HIRAGANA_SIZE) {
    updateRubySizeStyle('miri-ruby', value);
    SettingStorage.set({ pct: value });
  } else if (event === MIRI_EVENTS.UPDATE_HIRAGANA_COLOR) {
    updateRubyColorStyle('miri-ruby-color', value);
    SettingStorage.set({ color: value });
  } else if (event === MIRI_EVENTS.UPDATE_HIRAGANA_NO_SELECT) {
    updateNoSelectStyle('miri-no-select', value);
    SettingStorage.set({ kanaless: value });
  }
});
