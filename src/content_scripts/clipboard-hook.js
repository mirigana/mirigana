/* eslint no-unused-vars: 0 */

// get elemnt
const getElementText = (el, ruby = false) => {
  let text = '';
  el.childNodes.forEach((cn) => {
    if (cn.nodeType === 3) {
      text += cn.textContent;
      return;
    }

    const alt = cn.getAttribute('alt');
    if (alt) {
      text += alt;
      return;
    }

    if (!ruby && cn.nodeName === 'RT') {
      return;
    }

    const sub = getElementText(cn, ruby);
    if (!sub) {
      return;
    }

    if (cn.nodeName === 'RT') {
      text += `(${sub})`;
    } else {
      text += sub;
    }

    if (text && cn.nodeName === 'DIV') {
      text += `\n`;
    }

  });

  return text;
};

const prettyCopy = (e) => {
  console.log('copy!');
  const cloned = window.getSelection().getRangeAt(0).cloneContents();
  const shouldPrettify = [...cloned.children].some(c => c.nodeName === 'RUBY' || c.querySelector('ruby'));
  if (!shouldPrettify) {
    return;
  }

  const text = getElementText(cloned, true);

  e.clipboardData.setData('text/plain', text);
  e.preventDefault();
};

const registerClipboardHook = () => {
  document.addEventListener('copy', prettyCopy);
};
