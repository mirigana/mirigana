/* global
  MIRI_EVENTS

  downloadToArrayBuffer
  getLocalStoragePromise
  setLocalStoragePromise

  getBuiltinDictAssetsPromise
*/

/*
eslint no-unused-vars: 0
*/

function listenTokenParseMessage(callback) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { event, tweets } = request;
    if (event !== MIRI_EVENTS.REQUEST_TOKEN) {
      return false;
    }

    callback(tweets, sendResponse);
    return true;
  });
}


function downloadBuiltinAssetsPromise() {
  return getBuiltinDictAssetsPromise().then((assets) => {
    console.log(assets)

    // TODO move logic to background for preventing block on options page closed
    return Promise.all(assets.map(((ast) => {
      const { id: key } = ast;
      // download missing assets
      // https://static.mirigana.app/base.dat
      const url = `https://static.mirigana.app/${key}`;
      return downloadToArrayBuffer(url)
        .then((data) => setLocalStoragePromise(key, data));
    })));
  });
}


function loadTokenDictionaries() {

}
