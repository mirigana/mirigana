/* global
chrome
MIRI_EVENTS

miri,
addRuby,
waitForTimeline,
appendStyleNode
*/

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

// main
waitForTimeline()
  .then(() => {
    miri.log('timeline loaded.');
    registerMutationHook();
  }).catch((e) => {
    miri.log('timeline load tiemout.');
  });


// initialized update the font size
chrome.runtime.sendMessage(
  {
    event: MIRI_EVENTS.INITIALIZED,
  },
  (response) => {
    const { pct } = response;
    appendStyleNode('miri-ruby', pct);
  },
);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, pct } = request;
  if (event !== MIRI_EVENTS.UPDATE_HIRAGANA_SIZE) {
    return;
  }

  appendStyleNode('miri-ruby', pct);
});
