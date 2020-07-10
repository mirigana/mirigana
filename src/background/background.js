/* global
chrome
kuromoji
HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
HIRAGANA_COLOR_KEY
HIRAGANA_COLOR_DEFAULT
HIRAGANA_NO_SELECTION_KEY
HIRAGANA_NO_SELECTION_DEFAULT

MIRI_EVENTS

rebulidToken
*/

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event } = request;
  if (event !== MIRI_EVENTS.INITIALIZED) {
    return false;
  }
  chrome.storage.sync.get([
    HIRAGANA_SIZE_PERCENTAGE_KEY,
    HIRAGANA_NO_SELECTION_KEY,
    HIRAGANA_COLOR_KEY,
  ], (result = {}) => {
    sendResponse({
      pct: result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT,
      kanaless: result[HIRAGANA_NO_SELECTION_KEY] || HIRAGANA_NO_SELECTION_DEFAULT,
      color: result[HIRAGANA_COLOR_KEY] || HIRAGANA_COLOR_DEFAULT,
    });
  });

  // indicate async callback
  return true;
});

// disable page action icon for the site other than twitter.com
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.match(/^https:\/\/twitter.com\//)) {
    chrome.pageAction.show(tabId);
  } else {
    chrome.pageAction.hide(tabId);
  }
});

kuromoji.builder({ dicPath: 'data/' }).build().then((tokenizer) => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { event, text } = request;
    if (event !== MIRI_EVENTS.REQUEST_TOKEN) {
      return false;
    }

    const token = tokenizer.tokenize(text);
    const result = rebulidToken(token);
    sendResponse(result);

    // indicate async callback
    return true;
  });
}).catch((err) => {
  console.log(err);
});
