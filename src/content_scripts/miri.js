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
    this.throttleTimeout = throttleTimeout || 3500;
    this.throttleTimer = null;

    this.onTokenReady = onTokenReady;
    this.lastRequestTokens = new Date().getTime() - this.throttleTimeout;

    SettingStorage.on('loaded', () => this.requestTokensThrottle());
  }

  // TODO rewrite this method with setTimeout
  // const timer = setTimeout(() => ..., this.throttleTimeout)
  // if timer exists ignore
  // if time is null schedule another setTimeout()
  //
  // TODO add new feature
  // fast cache render
  // ignore the throttle time, request from the cache
  // if hit the result in the cache render the ruby
  // otherwise wait for the throttle timeout
  requestTokensThrottle() {
    debug('requestTokensThrottle() triggered');

    // clear last scheduled throttle task
    clearTimeout(this.throttleTimer);

    const now = new Date().getTime();
    const elapsed = now - this.lastRequestTokens;
    const shouldRequest = this.tweetPool.length
      && (elapsed > this.throttleTimeout);

    console.log('now:', now, 'last:', this.lastRequestTokens, 'elapsed:', elapsed, 'shouldRequest:', shouldRequest);

    if (!shouldRequest) {
      // scheduled a task
      const waitUntilTime = (this.throttleTimeout - elapsed);
      this.throttleTimer = setTimeout(() => this.requestTokensThrottle(), waitUntilTime);
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
