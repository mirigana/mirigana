/* global
chrome

HIRAGANA_SIZE_PERCENTAGE_KEY
HIRAGANA_SIZE_PERCENTAGE_DEFAULT
SITE_RUBY_DISABLED_KEY
SITE_RUBY_DISABLED_DEFAULT
MIRI_EVENTS

MiriStorage
MiriUtil
fillText
*/


function prepareToggleButton(initValue) {
  const DISABLE_CLASSNAME = 'disabled';
  const toggler = document.querySelector('.btn-toggle-site');
  if (initValue) {
    toggler.classList.add(DISABLE_CLASSNAME);
  }

  toggler.addEventListener('click', (e) => {
    e.currentTarget.classList.toggle(DISABLE_CLASSNAME);
    const nextValue = e.currentTarget.classList.contains(DISABLE_CLASSNAME);

    MiriStorage.site.set(SITE_RUBY_DISABLED_KEY, nextValue);
  });
}

function prepareKanaSizeRange(initValue) {
  const range = document.querySelector('.kana-size input');
  range.value = initValue;

  range.addEventListener('input', (e) => {
    const pct = +e.target.value;
    fillText('.kana-size .value', pct);

    MiriStorage.site.set(HIRAGANA_SIZE_PERCENTAGE_KEY, pct);
  });
}


function nullish(value, defaultValue) {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}

function bindLink(selector, url) {
  document.querySelector(selector).addEventListener('click', () => {
    chrome.tabs.create({
      url,
      active: true,
    });
    return false;
  });
}


// bind a tag
bindLink(
  '.feedback',
  'https://x.com/ctx_mirigana',
);
bindLink(
  '.app-icon',
  'https://chromewebstore.google.com/detail/mirigana/hbekfodhcnfpkmoeaijgbamedofonjib',
);

async function initializePopup() {
  const settings = await MiriStorage.site.get();
  if (!settings) {
    return;
  }

  const errorOverlay = document.querySelector('.error-overlay');
  errorOverlay.style.display = 'none';

  prepareToggleButton(settings[SITE_RUBY_DISABLED_KEY]);

  const pct = nullish(
    settings[HIRAGANA_SIZE_PERCENTAGE_KEY],
    HIRAGANA_SIZE_PERCENTAGE_DEFAULT,
  );
  prepareKanaSizeRange(pct);

  fillText('.site-name', settings.hostname);
  fillText('.kana-size .literal', 'ui_furigana_size', true);
  fillText('.kana-size .value', pct);
  fillText('.footer .feedback', 'ui_feedback', true);
  fillText('.footer .version', `${chrome.runtime.getManifest().version}`);
}

initializePopup();
