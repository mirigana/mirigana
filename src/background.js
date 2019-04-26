/* global chrome, kuromoji */

// TODO prepare for next version
false && chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostEquals: 'twitter.com' },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()],
    }]);
  });
});

kuromoji.builder({ dicPath: 'data/' }).build((error, tokenizer) => {
  if (error != null) {
    console.log(error);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const result = tokenizer.tokenize(request.text);
    sendResponse(result);
  });
});
