/* global

MIRI_EVENTS

log
debug
SettingStorage
*/

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["log"] }] */
// eslint-disable-next-line no-unused-vars
class Miri {
  constructor(options) {
    const {
      throttleTimeout,
      onTokenReady,
    } = options;

    this.tweetPool = [];
    this.throttleTimeout = throttleTimeout || 3000;

    this.onTokenReady = onTokenReady;
    this.lastRequestTokens = new Date().getTime() - this.throttleTimeout;

    SettingStorage.on('loaded', () => this.requestTokensThrottle());
  }

  requestTokensThrottle() {
    debug('requestTokensThrottle() triggered');

    const now = new Date().getTime();
    const shouldRequest = this.tweetPool.length
      && ((now - this.lastRequestTokens) > this.throttleTimeout);

    if (!shouldRequest) {
      return;
    }

    debug('requestTokensThrottle() approved', this.tweetPool);
    this.lastRequestTokens = now;

    const tweets = this.tweetPool.map((tb) => tb.tc);
    const origTweetPool = [...this.tweetPool];
    this.tweetPool = [];

    chrome.runtime.sendMessage({
      event: MIRI_EVENTS.REQUEST_TOKEN,
      tweets,
    }, (response) => {
      debug('token responsed');
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
          debug('onTokenReady is not defined.');
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
}
