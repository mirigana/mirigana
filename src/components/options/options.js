/* global
PARSE_ENGINES
CURRENT_PARSE_ENGINE_KEY
CURRENT_PARSE_ENGINE_DEFAULT
*/

const optionsState = {
  [CURRENT_PARSE_ENGINE_KEY]: CURRENT_PARSE_ENGINE_DEFAULT,
  engineKeyOrigin: CURRENT_PARSE_ENGINE_DEFAULT,
};

function localizeElement(ele) {
  const key = ele.innerText.replace(/^__MSG_/, '');
  ele.innerText = chrome.i18n.getMessage(key);
}

const mainContainer = document.querySelector('.main-container');
const optionContainer = mainContainer.querySelector('.option');
const optionLabel = mainContainer.querySelector('.label');
const optionNotice = mainContainer.querySelector('.notice');
const optionApplyBtn = mainContainer.querySelector('.apply');
localizeElement(optionLabel);
localizeElement(optionNotice);
localizeElement(optionApplyBtn);

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

function createDOM(type, options, ...children) {
  const container = document.createElement(type);
  if (typeof options === 'string') {
    container.className = options;
  } else {
    const { className, ...restOpts } = options;
    container.className = className;

    Object.keys(restOpts).forEach((k) => {
      if (!k.startsWith('on')) {
        return;
      }

      const event = restOpts[k];
      const eventName = k.replace('on', '').toLowerCase();
      container.addEventListener(eventName, event);
    });
  }

  children.forEach((child) => container.appendChild(child));
  return container;
}

function text(textContent) {
  return document.createTextNode(textContent);
}

function div(options, ...children) {
  return createDOM('div', options, ...children);
}

function span(options, ...children) {
  return createDOM('span', options, ...children);
}

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

    const optionBlock = div(blockOptions,
      div('block-selector',
        div('wrap',
          div('title',
            text(title),
            span('check-mark', text('✓'))),
          div('description',
            text(description)))));

    optionContainer.appendChild(optionBlock);
  });
}

chrome.storage.local.get((result = {}) => {
  let currentEngine = result[CURRENT_PARSE_ENGINE_KEY];

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
});
