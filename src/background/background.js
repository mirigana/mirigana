/* global
chrome
kuromoji

CURRENT_PARSE_ENGINE_KEY
CURRENT_PARSE_ENGINE_DEFAULT
SITE_RUBY_DISABLED_KEY

MIRI_EVENTS
PARSE_ENGINES

rebulidTokens
retrieveFromCache
persiseToCache
MiriUtil
MiriStorage
*/

// init engine

async function startBackground() {
  const extensionSettings = await MiriStorage.local.get();
  // const storage = await MiriUtil.storage.loadAll();
  const currentEngineKey = extensionSettings[CURRENT_PARSE_ENGINE_KEY] || CURRENT_PARSE_ENGINE_DEFAULT;
  if (currentEngineKey === PARSE_ENGINES[0].key) {
    // local
    const tokenizer = await kuromoji.builder({ dicPath: 'data/' }).build();
    MiriUtil.addEventListener(MIRI_EVENTS.REQUEST_TOKEN, (request, sender, sendResponse) => {
      const { tweets } = request;
      const results = tweets.map((t) => tokenizer.tokenize(t));
      sendResponse(rebulidTokens(results));
      return true;
    });
  } else if (currentEngineKey === PARSE_ENGINES[1].key) {
    // remote
    MiriUtil.addEventListener(MIRI_EVENTS.REQUEST_TOKEN, (request, sender, sendResponse) => {
      const { tweets } = request;
      const { cacheArray, requestArray } = retrieveFromCache(tweets);
      const postBody = JSON.stringify(requestArray);

      if (!requestArray.length) {
        // all tweets in cache, return immedately
        sendResponse(cacheArray);
        return true;
      }

      fetch('https://api.mirigana.app/nlp', {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: postBody,
      }).then((res) => res.json())
        .then((tokens) => {
          // compose the complete token array
          const results = cacheArray.map((ca, idx) => {
            if (ca !== undefined) {
              return ca;
            }

            // persist to cache
            const k = tweets[idx];
            const v = tokens.shift();
            persiseToCache(k, v);

            return (v);
          });

          sendResponse(results);
        })
        .catch((error) => {
          sendResponse(null);
        });

      return true;
    });
  }
}

MiriUtil.addEventListener(MIRI_EVENTS.LOAD_EXTENSION_INFO, (request, sender, sendResponse) => {
  chrome.management.getSelf((info) => {
    sendResponse({ info });
  });

  // indicate async callback
  return true;
});


startBackground();
