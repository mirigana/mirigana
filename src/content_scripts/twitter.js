/* global
chrome
MIRI_EVENTS

miri,
addRuby,
waitForTimeline
updateRubySizeStyle
updateNoSelectStyle
*/

const registerMutationHook = () => {
  const MAIN_CONTAINER_SELECTOR = '#react-root';
  const TL_CONTAINER_SELECTOR = 'section>div>div>div';
  const TWEET_ARTICLE_SELECTOR = 'article div[dir="auto"]';

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
    const { pct, kanaless } = response;
    updateRubySizeStyle('miri-ruby', pct);
    updateNoSelectStyle('miri-no-select', kanaless);
  },
);


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event, value } = request;

  if (event === MIRI_EVENTS.UPDATE_HIRAGANA_SIZE) {
    updateRubySizeStyle('miri-ruby', value);
  } else if (event === MIRI_EVENTS.UPDATE_HIRAGANA_NO_SELECT) {
    updateNoSelectStyle('miri-no-select', value);
  }
});
