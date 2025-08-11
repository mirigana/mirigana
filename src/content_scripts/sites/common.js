/* global
MIRI_EVENTS
HIRAGANA_SIZE_PERCENTAGE_KEY
SITE_RUBY_DISABLED_KEY

Miri
debug
now

isContainsKanji
setRubyVisibility
updateRubySizeStyle
updateNoSelectStyle
MiriUtil
initializeMiri
applyRubyForTwitter
loadSiteSettings

Readability
*/

/*
  eslint-disable
  no-underscore-dangle
*/

function extractElementsForRubying(rootElement) {
  const result = [];

  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );

  let currentNode;

  while ((currentNode = walker.nextNode())) {
    const { textContent } = currentNode;
    if (!textContent.trim()) {
      continue;
    }

    if (!isContainsKanji(textContent)) {
      continue;
    }

    const { parentElement } = currentNode;
    if (parentElement.tagName === 'RUBY') {
      continue;
    }

    if (parentElement.querySelector(':scope > ruby')) {
      // already handled with ruby, skip
      continue;
    }

    const container = currentNode;
    result.push({
      c: container,
      tc: textContent,
    });
  }

  return result;
}

/*
  try to find the readable nodes from the readabilityArticle
  readability parsed the document from a cloned document
  this function tries to get the original element from the readability parsed element
  by select the element by the same attributes

*/
function findReadableNodesInDOM(readabilityArticle) {
  const result = [];
  const pages = readabilityArticle.querySelectorAll('#readability-content > .page');
  // eslint-disable-next-line no-restricted-syntax
  for (const p of pages) {
    // eslint-disable-next-line no-restricted-syntax
    for (const c of p.children) {
      let query = '';

      // eslint-disable-next-line no-restricted-syntax
      for (const attr of c.attributes) {
        query += `[${attr.name}="${attr.value}"]`;
      }
      if (!query) {
        debug('warning: query is empty', c);
        continue;
      }

      const qResult = document.querySelectorAll(query);
      if (!qResult.length) {
        debug('error: failed to find the readable element', query);
        continue;
      }

      if (qResult.length !== 1) {
        debug('error: find multiple target elements');
        continue;
      }

      const [q] = qResult;
      extractElementsForRubying(q).forEach((r) => result.push(r));
    }
  }
  return result;
}

function applyRubyForCommonSite() {
  const commonMiri = new Miri({
    throttleTimeout: 1000,
  });

  let shouldUpdate = true;
  let lastDOMUpdateTime = now();
  setInterval(() => {
    if (!shouldUpdate) {
      return;
    }

    if (now() - lastDOMUpdateTime < 1000) {
      return;
    }

    const documentClone = document.cloneNode(true);
    const readability = new Readability(documentClone);
    readability._removeScripts(readability._doc);
    readability._prepDocument();
    const metadata = readability._getArticleMetadata({});
    readability._metadata = metadata;
    readability._articleTitle = metadata.title;
    const articleContent = readability._grabArticle();

    if (!articleContent) {
      debug('warning: failed to grab article content');
      return;
    }

    const articleBag = findReadableNodesInDOM(articleContent);
    if (!articleBag.length) {
      // fallback to ruby the whole site
      extractElementsForRubying(document.body).forEach((el) => articleBag.push(el));
    }

    commonMiri.parseArticle(articleBag);
    lastDOMUpdateTime = now();
    shouldUpdate = false;
  }, 500);

  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      const { addedNodes } = mutation;
      if (!addedNodes.length) {
        return;
      }

      shouldUpdate = true;
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function initialize() {
  if (window.__mirigana__.initialized) {
    return;
  }

  const { info } = await MiriUtil.sendMessage(MIRI_EVENTS.LOAD_EXTENSION_INFO);

  if (info.installType === 'development') {
    window.__mirigana__.isDevelopment = true;
  }

  // make the ruby unselectable,
  updateNoSelectStyle('miri-no-select', true);

  if (typeof applyRubyForTwitter === 'function') {
    initializeMiri(applyRubyForTwitter);
  } else {
    initializeMiri(applyRubyForCommonSite);
  }
}

MiriUtil.addEventListener(MIRI_EVENTS.GET_SITE_SETTINGS, (request, sender, sendResponse) => {
  const result = loadSiteSettings();
  sendResponse(result);
  return true;
});

MiriUtil.addEventListener(MIRI_EVENTS.SET_SITE_SETTINGS, (request, sender, sendResponse) => {
  const { itemKey, itemValue } = request;

  localStorage.setItem(itemKey, itemValue);

  if (HIRAGANA_SIZE_PERCENTAGE_KEY === itemKey) {
    updateRubySizeStyle('miri-ruby', itemValue);
  } else if (SITE_RUBY_DISABLED_KEY === itemKey) {
    setRubyVisibility('miri-ruby-visible', !itemValue);
    if (!window.__mirigana__.initialized) {
      initialize();
    }
  }
});

initialize();
