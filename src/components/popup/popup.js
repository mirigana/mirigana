/* global
chrome
HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
MIRI_EVENTS
*/

const size = document.querySelector('#size');
const textPct = document.querySelector('#textPct');
const ver = document.querySelector('#ver');

const updatePctLiteral = (pct) => {
  textPct.textContent = pct;
};

const sizeChangeHandler = () => {
  const pct = +size.value;
  updatePctLiteral(pct);

  // update to storage
  const saveData = {
    [HIRAGANA_SIZE_PERCENTAGE_KEY]: pct,
  };
  chrome.storage.sync.set(saveData);

  // update font size in all tabs
  chrome.tabs.query({ url: 'https://twitter.com/*' }, (tabs) => {
    if (!tabs.length) {
      return;
    }

    const msg = {
      event: MIRI_EVENTS.UPDATE_HIRAGANA_SIZE,
      pct,
    };
    tabs.forEach(t => chrome.tabs.sendMessage(t.id, msg));
  });
};

// load from stroage
chrome.storage.sync.get([HIRAGANA_SIZE_PERCENTAGE_KEY], (result) => {
  const pct = result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT;
  size.value = pct;
  updatePctLiteral(pct);
});

size.addEventListener('input', sizeChangeHandler);

const manifestData = chrome.runtime.getManifest();
ver.textContent = manifestData.version;
