/* eslint-disable no-console */
/* global

*/

// eslint-disable-next-line no-unused-vars
const log = (...args) => {
  console.log('[MIRI]', ...args);
};

// esint-disable class-methods-use-this
// eslint-disable-next-line no-unused-vars
const debug = (...args) => {
  if (window.__mirigana__.isDevelopment) {
    console.log('[MIRI][DEBUG]', ...args);
  }
};
