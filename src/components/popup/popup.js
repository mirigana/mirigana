/* global
chrome
HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
HIRAGANA_COLOR_KEY
HIRAGANA_COLOR_DEFAULT
HIRAGANA_NO_SELECTION_KEY
HIRAGANA_NO_SELECTION_DEFAULT
MIRI_EVENTS
HIRAGANA_COLORS
*/


function fillText(id, textOrKey, useKey) {
  const ele = document.querySelector(id);
  ele.textContent = useKey
    ? chrome.i18n.getMessage(textOrKey)
    : textOrKey;
}

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

function prepareColorSwitcher(initValue) {
  const switcher = document.querySelector('.color-switcher');
  HIRAGANA_COLORS.forEach((c) => {
    const tile = document.createElement('div');
    tile.className = 'block';
    tile.style.backgroundColor = c.value;
    tile.dataset.color = c.value;

    if (c.value === initValue) {
      tile.className += ' active';
    }

    switcher.appendChild(tile);
  });

  switcher.addEventListener('click', (e) => {
    const { color } = e.target.dataset;

    // update class
    switcher.querySelectorAll('.block').forEach((ele) => {
      ele.className = 'block';
    });
    e.target.className = 'block active';

    // update to storage
    const saveData = {
      [HIRAGANA_COLOR_KEY]: color,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_HIRAGANA_COLOR, color);
  });
}

function prepareKanaSizeRange(initValue) {
  const range = document.querySelector('.kana-size input');
  range.value = initValue;

  range.addEventListener('input', (e) => {
    const pct = +e.target.value;
    fillText('.kana-size .value', pct);

    // update to storage
    const saveData = {
      [HIRAGANA_SIZE_PERCENTAGE_KEY]: pct,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_HIRAGANA_SIZE, pct);
  });
}

function prepareKanaSelection(initValue) {
  const selection = document.querySelector('.kana-selection input');
  selection.checked = initValue;

  selection.addEventListener('change', (e) => {
    const kanaless = e.target.checked;
    // update to storage
    const saveData = {
      [HIRAGANA_NO_SELECTION_KEY]: kanaless,
    };
    chrome.storage.sync.set(saveData);

    broadcast(MIRI_EVENTS.UPDATE_HIRAGANA_NO_SELECT, kanaless);
  });
}

// load from stroage
chrome.storage.sync.get([
  HIRAGANA_SIZE_PERCENTAGE_KEY,
  HIRAGANA_NO_SELECTION_KEY,
  HIRAGANA_COLOR_KEY,
], (result = {}) => {
  const pct = result[HIRAGANA_SIZE_PERCENTAGE_KEY] || HIRAGANA_SIZE_PERCENTAGE_DEFAULT;
  prepareKanaSizeRange(pct);

  const color = result[HIRAGANA_COLOR_KEY] || HIRAGANA_COLOR_DEFAULT;
  prepareColorSwitcher(color);

  const kanaless = result[HIRAGANA_NO_SELECTION_KEY] || HIRAGANA_NO_SELECTION_DEFAULT;
  prepareKanaSelection(kanaless);


  fillText('.kana-size .literal', 'ui_furigana_size', true);
  fillText('.kana-size .value', pct);
  fillText('.kana-selection .literal', 'ui_skip_furigana_selection', true);
  fillText('.footer .feedback', 'ui_feedback', true);
  fillText('.footer .version', `ver ${chrome.runtime.getManifest().version}`);
});


// bind a tag
document.querySelector('.feedback').addEventListener('click', () => {
  // e.preventDefault();
  chrome.tabs.create({
    url: 'https://twitter.com/ctx_mirigana',
    active: true,
  });
  return false;
});
