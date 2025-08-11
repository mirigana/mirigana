/* global
chrome

PARSE_ENGINES
CURRENT_PARSE_ENGINE_KEY
CURRENT_PARSE_ENGINE_DEFAULT

text
div
span
fillText
MiriStorage
*/

const optionsState = {
  [CURRENT_PARSE_ENGINE_KEY]: CURRENT_PARSE_ENGINE_DEFAULT,
  engineKeyOrigin: CURRENT_PARSE_ENGINE_DEFAULT,
};

const mainContainer = document.querySelector('.main-container');
const optionContainer = mainContainer.querySelector('.option');
const optionApplyBtn = mainContainer.querySelector('.apply');
fillText('.label', 'ui_engine_label', true);
fillText('.notice', 'ui_engine_note', true);
fillText('.apply', 'ui_btn_apply', true);


optionApplyBtn.addEventListener('click', () => {
  chrome.storage.local.set({
    [CURRENT_PARSE_ENGINE_KEY]: optionsState[CURRENT_PARSE_ENGINE_KEY],
  }, () => {
    chrome.runtime.reload();
    optionsState.engineKeyOrigin = optionsState[CURRENT_PARSE_ENGINE_KEY];
    optionApplyBtn.setAttribute('disabled', 'disabled');
    window.close();
  });
});

function composeEngineOption(currentEngine) {
  PARSE_ENGINES.forEach((engine) => {
    const activeClassName = (engine.key === currentEngine)
      ? 'active'
      : '';

    const blockOptions = {
      className: `block ${activeClassName}`,
      onClick() {
        const allBlocks = document.querySelectorAll('.block');
        allBlocks.forEach((ele) => ele.classList.remove('active'));

        if (optionsState.engineKeyOrigin !== engine.key) {
          optionsState[CURRENT_PARSE_ENGINE_KEY] = engine.key;
          optionApplyBtn.removeAttribute('disabled');
        } else {
          optionApplyBtn.setAttribute('disabled', 'disabled');
        }

        this.classList.add('active');
      },
    };

    const title = chrome.i18n.getMessage(`${engine.i18nKey}_title`);
    const description = chrome.i18n.getMessage(`${engine.i18nKey}_description`);

    const optionBlock = div(
      blockOptions,
      div(
        'block-selector',
        div(
          'wrap',
          div(
            'title',
            text(title),
            span('check-mark', text('✓')),
          ),
          div(
            'description',
            text(description),
          ),
        ),
      ),
    );

    optionContainer.appendChild(optionBlock);
  });
}

async function initializeOptions() {
  const options = await MiriStorage.local.get();
  let currentEngine = options[CURRENT_PARSE_ENGINE_KEY];

  if (!currentEngine) {
    // write the default value immedately
    currentEngine = optionsState[CURRENT_PARSE_ENGINE_KEY];
    chrome.storage.local.set({
      [CURRENT_PARSE_ENGINE_KEY]: currentEngine,
    });
  }

  optionsState[CURRENT_PARSE_ENGINE_KEY] = currentEngine;
  optionsState.engineKeyOrigin = currentEngine;
  composeEngineOption(currentEngine);
}

initializeOptions();
