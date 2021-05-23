/* global
KUROMOJI_DICT_KEYS
*/

/*
eslint no-unused-vars: 0
*/

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const { byteLength: len } = bytes;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const { byteLength: len } = binaryString;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function getLocalStoragePromise(requestKeys) {
  return new Promise((resolve, reject) => {
    const args = [(result) => resolve(result)];
    if (requestKeys === undefined) {
      args.unshift(requestKeys);
    }
    chrome.storage.local.get.call(chrome.storage.local, ...args);
  });
}

function setLocalStoragePromise(key, data) {
  return new Promise((resolve, reject) => {
    const b64 = arrayBufferToBase64(data);
    chrome.storage.local.set({ [key]: b64 }, () => {
      resolve();
    });
  });
}

function downloadToArrayBuffer(url) {
  return fetch(url)
    .then((res) => res.arrayBuffer())
    .catch((e) => console.log(e));
}

function getBuiltinDictAssetsPromise() {
  return getLocalStoragePromise(KUROMOJI_DICT_KEYS)
    .then((result) => {
      const assets = [];
      KUROMOJI_DICT_KEYS.forEach((k) => {
        assets.push({
          id: k,
          data: result[k],
        });
      });
      return assets;
    });
}


/* exports
getLocalStoragePromise
setLocalStoragePromise
downloadToArrayBuffer
getBuiltinDictAssetsPromise
 */
