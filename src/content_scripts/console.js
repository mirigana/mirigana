/* eslint  */
/* global

MIRI_EVENTS
*/

window.isDevelopment = false;

// eslint-disable-next-line no-unused-vars
const log = (...args) => {
  console.log('[MIRI]', ...args);
};

// esint-disable class-methods-use-this
// eslint-disable-next-line no-unused-vars
const debug = (...args) => {
  if (window.isDevelopment) {
    console.log('[MIRI][DEBUG]', ...args);
  }
};

chrome.runtime.sendMessage(
  { event: MIRI_EVENTS.LOAD_EXTENSION_INFO },
  ({ info }) => {
    debug('responsed: LOAD_EXTENSION_INFO');
    if (info.installType === 'development') {
      window.isDevelopment = true;
    }
  },
);
