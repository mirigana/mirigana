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

// button should only available in twitter scope
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {
            hostEquals: 'twitter.com',
          },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    }]);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { event } = request;
  if (event !== MIRI_EVENTS.INITIALIZED) {
    return false;
  }
  chrome.storage.sync.get([
    HIRAGANA_SIZE_PERCENTAGE_KEY,
    HIRAGANA_NO_SELECTION_KEY,
    HIRAGANA_COLOR_KEY,
  ], (result) => {
    sendResponse({
      pct: result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT,
      kanaless: result[HIRAGANA_NO_SELECTION_KEY] || HIRAGANA_NO_SELECTION_DEFAULT,
      color: result[HIRAGANA_COLOR_KEY] || HIRAGANA_COLOR_DEFAULT,
    });
  });

  // indicate async callback
  return true;
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
