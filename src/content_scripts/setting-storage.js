/* global
MIRI_EVENTS

debug
*/

// eslint-disable-next-line no-unused-vars
const SettingStorage = {
  settings: {},
  loaded: false,
  onUpdated: null,

  eventHandlers: {
    loaded: [],
    updated: [],
  },

  on(eventName, func) {
    // loaded
    // updated
    this.eventHandlers[eventName].push(func);

    if (eventName === 'loaded' && this.loaded) {
      // emit loaded event immedately if the setting already loaded
      func(this.settings);
    }
  },

  load() {
    chrome.runtime.sendMessage(
      {
        event: MIRI_EVENTS.LOAD_SETTINGS,
      },
      (response) => {
        debug('responsed: LOAD_SETTINGS');
        this.loaded = true;
        // const { pct, kanaless, color } = response;
        this.set(response);

        this.eventHandlers.loaded
          .forEach((func) => func(this.response));

        // this.checkReady();
      },
    );
  },

  get(key) {
    return this.settings[key];
  },

  set(setting) {
    Object.assign(this.settings, setting);

    this.eventHandlers.updated
      .forEach((func) => func(this.settings));

    if (this.onUpdated) {
      this.onUpdated(this.settings);
    }
  },
};

SettingStorage.load();
