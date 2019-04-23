/* global window, document */

console.error('inject-xhr.js');

const twitterModifyHook = (xhr) => {
  const { responseURL, responseText } = xhr;
  if (!responseURL.includes('https://twitter.com/i/timeline?')) {
    return;
  }

  const rawJSON = JSON.parse(responseText);
  const { inner: { items_html } } = rawJSON;

  // const html = unescape(items_html);
  const container = document.createElement('div');
  container.innerHTML = items_html;

  container.querySelectorAll('.tweet-text[lang="ja"]')
    .forEach((ele) => {
      // const rc = document.createElement('ruby');
      const rubify = [...ele.innerText].map((c) => {
        if (/[\u4E00-\u9FFF]/.test(c)) {
          return `${c}<rt>あ</rt>`;
        }
        return c;
      }).join('');

      // TODO: handle url in text
      ele.innerHTML = `<ruby>${rubify}</ruby>`;
    });

  rawJSON.inner.items_html = container.innerHTML;
  // rawJSON.inner.max_position++;
  Object.defineProperty(xhr, 'responseText', { writable: true });
  xhr.responseText = JSON.stringify(rawJSON);

  console.error('replaced.', xhr.responseText);
};

window.XMLHttpRequest = ((win, hook) => {
  const XMLHttpRequestOrig = win.XMLHttpRequest;
  return class XMLHttpRequestSpy {
    constructor() {
      const xhr = new XMLHttpRequestOrig();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          hook(xhr);
        }
      };
      return xhr;
    }
  };
})(window, twitterModifyHook);

