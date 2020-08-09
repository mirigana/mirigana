/* eslint no-unused-vars: 0 */
/* global

MIRI_EVENTS

*/

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["log"] }] */
class Miri {
  constructor(options) {
    const {
      throttleTimeout,
      onTokenReady,
      onUpdateSettings,
    } = options;

    this.settingsLoaded = false;
    this.extensionInfoLoaded = false;

    this.settings = {};
    this.tweetPool = [];
    this.throttleTimeout = throttleTimeout || 3000;

    this.onTokenReady = onTokenReady;
    this.onUpdateSettings = onUpdateSettings;
    this.lastRequestTokens = new Date().getTime() - this.throttleTimeout;

    this.loadExtensionInfo();
    this.loadSettings();
  }

  requestTokensThrottle() {
    this.debug('requestTokensThrottle() triggered');

    const now = new Date().getTime();
    const shouldRequest = this.tweetPool.length
      && ((now - this.lastRequestTokens) > this.throttleTimeout);

    if (!shouldRequest) {
      return;
    }

    this.debug('requestTokensThrottle() approved', this.tweetPool);
    this.lastRequestTokens = now;

    const tweets = this.tweetPool.map((tb) => tb.tc);
    const origTweetPool = [...this.tweetPool];
    this.tweetPool = [];

    chrome.runtime.sendMessage({
      event: MIRI_EVENTS.REQUEST_TOKEN,
      tweets,
    }, (response) => {
      this.debug('token responsed');
      if (!response) {
        this.log('Error: tokens response is invalid.');
        return;
      }

      if (!response.length) {
        // token is empty
        return;
      }

      response.forEach((t, i) => {
        if (!this.onTokenReady) {
          this.debug('onTokenReady is not defined.');
          return;
        }

        const { c } = origTweetPool[i];
        this.onTokenReady(c, t);
      });
    });
  }

  addTweets(tweetBag) {
    tweetBag.map((tb) => tb.tc);

    tweetBag.forEach((tb) => {
      this.tweetPool.push(tb);
    });

    this.requestTokensThrottle();
  }

  loadExtensionInfo() {
    chrome.runtime.sendMessage(
      { event: MIRI_EVENTS.LOAD_EXTENSION_INFO },
      ({ info }) => {
        this.debug('responsed: LOAD_EXTENSION_INFO');
        // miri.setReady(info);
        this.extensionInfoLoaded = true;
        if (info.installType === 'development') {
          this.isDevelopment = true;
        }

        this.checkReady();
      },
    );
  }

  loadSettings() {
    chrome.runtime.sendMessage(
      {
        event: MIRI_EVENTS.LOAD_SETTINGS,
      },
      (response) => {
        this.debug('responsed: LOAD_SETTINGS');
        this.settingsLoaded = true;
        const { pct, kanaless, color } = response;
        this.settings = response;

        this.checkReady();
      },
    );
  }

  checkReady() {
    if (!this.extensionInfoLoaded || !this.settingsLoaded) {
      return;
    }

    this.onUpdateSettings(this.settings);
    this.requestTokensThrottle();
  }

  getSetting(key) {
    return this.settings[key];
  }

  setSetting(setting) {
    Object.assign(this.settings, setting);
  }

  log(...args) {
    console.log('[MIRI]', ...args);
  }

  // esint-disable class-methods-use-this
  debug(...args) {
    if (this.isDevelopment && false) {
      console.log('[MIRI]', ...args);
    }
  }
}
