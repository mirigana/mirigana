window.__mirigana__ = (window.__mirigana__ || {});
window.__mirigana__.settings = {};

const saveSetting = (settings) => {
  Object.assign(window.__mirigana__.settings, settings);
};

const getSetting = (key) => {
  return window.__mirigana__.settings[key];
};
