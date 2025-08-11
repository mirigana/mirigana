/* eslint no-unused-vars: 0 */
/* global
chrome
MIRI_EVENTS
*/

const MiriUtil = {};

MiriUtil.addEventListener = (event, callback) => {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.event !== event) {
      return false;
    }
    return callback(request, sender, sendResponse);
  });
};

MiriUtil.sendMessage = async (event, messageBody) => {
  if (chrome.tabs && chrome.tabs.query) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tabs.length) {
      return null;
    }
    return chrome.tabs.sendMessage(
      tabs[0].id,
      {
        event,
        ...messageBody,
      },
    );
  }

  return chrome.runtime.sendMessage({
    event,
    ...messageBody,
  });
};

const MiriStorage = {
  site: {
    async get(itemKey) {
      const response = await MiriUtil.sendMessage(MIRI_EVENTS.GET_SITE_SETTINGS);
      if (!response) {
        return null;
      }

      if (itemKey) {
        return response[itemKey];
      }
      return response;
    },

    async set(itemKey, itemValue) {
      return MiriUtil.sendMessage(MIRI_EVENTS.SET_SITE_SETTINGS, {
        itemKey,
        itemValue,
      });
    },
  },
  local: {
    get: chrome.storage.local.get.bind(chrome.storage.local),
    set: chrome.storage.local.set.bind(chrome.storage.local),
  },
};
