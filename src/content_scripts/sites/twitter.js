/* eslint no-unused-vars: 0 */
/* global
Miri
log

isContainsKanji
*/

function applyRubyForTwitter() {
  const twitterMiri = new Miri();

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

        addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
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

              const [textNode] = c.childNodes;
              const { textContent } = textNode;

              // const { textContent } = c.childNodes[0];
              if (!textContent.trim().length) {
                // text content should not empty
                return;
              }

              if (!isContainsKanji(textContent)) {
                // text content should contains kanji
                return;
              }

              tweetBag.push({
                c: textNode,
                tc: textContent,
              });
            });
          });
        });
      });

      if (tweetBag.length) {
        twitterMiri.parseArticle(tweetBag);
      }
    });

    observer.observe(mainContainer, { childList: true, subtree: true });
  };

  // main
  log('initialized.');
  // delay hook registration to give other extensions time to inject
  setTimeout(registerMutationHook, 100);
}
