/* global
KUROMOJI_DICT_KEYS

PARSE_ENGINES
CURRENT_PARSE_ENGINE_KEY
PARSE_ENGINE_KEYS
*/

const optionsState = {
  lastEngine: PARSE_ENGINE_KEYS.MIRIGANA_ONLINE,
  currentEngine: PARSE_ENGINE_KEYS.MIRIGANA_ONLINE,
  dict: {},
  builtinReady: true,
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
    [CURRENT_PARSE_ENGINE_KEY]: optionsState.currentEngine,
  }, () => {
    chrome.runtime.reload();

    optionsState.engineKeyOrigin = optionsState.currentEngine;
    optionApplyBtn.setAttribute('disabled', 'disabled');

    // if (window.location.href.includes('?options=')) {
    //   window.location.href = window.location.href.replace('?/options=', '');
    // }

    // window.close();
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

function button(options, buttonText) {
  return createDOM('button', options, text(buttonText));
}





function renderOption(optionMetadata) {
  const activeClassName = (optionMetadata.key === optionsState.currentEngine)
    ? 'active'
    : '';

  const blockOptions = {
    className: `block ${activeClassName} ${optionMetadata.disabled}`,
    onClick(e) {
      if (e.target.classList.contains('disabled')) {
        // ignore events from disabled element
        return;
      }

      console.log('active')
      const allBlocks = document.querySelectorAll('.block');
      allBlocks.forEach((ele) => ele.classList.remove('active'));

      if (optionsState.engineKeyOrigin !== optionMetadata.key) {
        optionsState.currentEngine = optionMetadata.key;
        optionApplyBtn.removeAttribute('disabled');
      } else {
        optionApplyBtn.setAttribute('disabled', 'disabled');
      }

      this.classList.add('active');
    },
  };

  const title = chrome.i18n.getMessage(`${optionMetadata.i18nKey}_title`);
  const description = chrome.i18n.getMessage(`${optionMetadata.i18nKey}_description`);

  const optionBlock = div(blockOptions,
    div('block-selector',
      div('wrap',
        div('title',
          text(title),
          span('check-mark', text('✓'))),
        div('description',
          text(description)))));

  // optionContainer.appendChild(optionBlock);
  return optionBlock;
}





function composeEngineOptions() {
  const [
    onlineMetadata,
    builtinMetadata,
  ] = PARSE_ENGINES;

  // engine button disabled class
  builtinMetadata.disabled = optionsState.builtinReady
    ? ''
    : 'disabled';

  // render online api block
  const onlineBlock = renderOption(onlineMetadata);
  const builtinBlock = renderOption(builtinMetadata);

  optionContainer.innerHTML = '';
  optionContainer.appendChild(onlineBlock);
  optionContainer.appendChild(builtinBlock);

  if (optionsState.builtinReady) {
    return;
  }

  // render assets download button if builtin data is not ready
  builtinBlock.appendChild(div('block-overlay wrapper'));
  builtinBlock.appendChild(
    button({
      className: 'block-overlay button',
      onClick: (e) => {
        console.log('clicked')
        e.stopPropagation();

        chrome.runtime.sendMessage({
          event: MIRI_EVENTS.DOWNLOAD_ASSETS,
        }, (response) => {
          console.log('------', response)
          // TODO download file and save to local storage
          // mockup: download done
          optionsState.builtinReady = true;
          composeEngineOptions();
        });
      },
    }, 'Download Database for Using the Builtin Engine'),
  );
}



async function init() {
  console.log('options page init')
  const assets = await getBuiltinDictAssetsPromise();
  const builtinReady = assets.every((a) => a.data);

  const options = await getLocalStoragePromise([CURRENT_PARSE_ENGINE_KEY]);
  let currentEngine = options[CURRENT_PARSE_ENGINE_KEY] || optionsState.currentEngine;
  let shouldResetCurrentEngine = false;
  if (currentEngine === PARSE_ENGINE_KEYS.LOCAL_KUROMOJI
    && !builtinReady) {
    // use the default value if the builtin engine is not ready
    shouldResetCurrentEngine = true;
  }

  if (shouldResetCurrentEngine) {
    currentEngine = optionsState.currentEngine;
  }

  optionsState.currentEngine = currentEngine;
  optionsState.engineKeyOrigin = currentEngine;
  optionsState.builtinReady = builtinReady;
  composeEngineOptions();
}

init();
