/* global
chrome
HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
HIRAGANA_NO_SELECTION_KEY
HIRAGANA_NO_SELECTION_DEFAULT
MIRI_EVENTS
*/

const size = document.querySelector('#size');
const kana = document.querySelector('#kana');

const textPct = document.querySelector('#textPct');
const ver = document.querySelector('#ver');

const updatePctLiteral = (pct) => {
  textPct.textContent = pct;
};

const broadcast = (event, value) => {
  chrome.tabs.query({ url: 'https://twitter.com/*' }, (tabs) => {
    if (!tabs.length) {
      return;
    }

    const msg = {
      event,
      value,
    };
    tabs.forEach(t => chrome.tabs.sendMessage(t.id, msg));
  });
};

const sizeChangeHandler = () => {
  const pct = +size.value;
  updatePctLiteral(pct);

  // update to storage
  const saveData = {
    [HIRAGANA_SIZE_PERCENTAGE_KEY]: pct,
  };
  chrome.storage.sync.set(saveData);

  broadcast(MIRI_EVENTS.UPDATE_HIRAGANA_SIZE, pct);
};

const kanaChangeHandler = () => {
  const kanaless = kana.checked;
  // update to storage
  const saveData = {
    [HIRAGANA_NO_SELECTION_KEY]: kanaless,
  };
  chrome.storage.sync.set(saveData);

  broadcast(MIRI_EVENTS.UPDATE_HIRAGANA_NO_SELECT, kanaless);
};

// load from stroage
chrome.storage.sync.get([HIRAGANA_SIZE_PERCENTAGE_KEY, HIRAGANA_NO_SELECTION_KEY], (result) => {
  const pct = result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT;
  size.value = pct;
  updatePctLiteral(pct);

  const kanaless = result[HIRAGANA_NO_SELECTION_KEY] || HIRAGANA_NO_SELECTION_DEFAULT;
  kana.checked = kanaless;
});

size.addEventListener('input', sizeChangeHandler);
kana.addEventListener('change', kanaChangeHandler);

const manifestData = chrome.runtime.getManifest();
ver.textContent = `ver ${manifestData.version}`;
