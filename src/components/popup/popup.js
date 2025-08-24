/* global
chrome

FURIGANA_SIZE_KEY
FURIGANA_SIZE_DEFAULT
FURIGANA_OPACITY_KEY
FURIGANA_OPACITY_DEFAULT

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

function prepareProgressControl(inputSelector, storageKey, initValue) {
  const range = document.querySelector(`${inputSelector} input`);
  range.value = initValue;

  range.addEventListener('input', (e) => {
    const value = +e.target.value;
    MiriStorage.site.set(storageKey, value);
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
    settings[FURIGANA_SIZE_KEY],
    FURIGANA_SIZE_DEFAULT,
  );
  prepareProgressControl('.kana-size', FURIGANA_SIZE_KEY, pct);

  const opacity = nullish(
    settings[FURIGANA_OPACITY_KEY],
    FURIGANA_OPACITY_DEFAULT,
  );
  prepareProgressControl('.kana-opacity', FURIGANA_OPACITY_KEY, opacity);

  fillText('.error-overlay div', 'ui_popup_error_overlay', true);
  fillText('.site-name', settings.hostname);
  fillText('.footer .feedback', 'ui_popup_feedback', true);
  fillText('.footer .version', `${chrome.runtime.getManifest().version}`);
}

initializePopup();
