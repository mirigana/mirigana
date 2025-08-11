/* global

MIRI_EVENTS

chrome
log
debug
renderRuby
*/

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["log"] }] */
// eslint-disable-next-line no-unused-vars
class Miri {
  constructor(options = {}) {
    const {
      throttleTimeout,
    } = options;

    this.articlePool = [];
    this.throttleTimeout = throttleTimeout || 3500;
    this.throttleTimer = null;

    this.lastRequestTokens = new Date().getTime() - this.throttleTimeout;
  }

  // TODO add new feature
  // fast cache render
  // ignore the throttle time, request from the cache
  // if hit the result in the cache render the ruby
  // otherwise wait for the throttle timeout
  requestTokensThrottle() {
    // clear last scheduled throttle task
    clearTimeout(this.throttleTimer);

    const now = new Date().getTime();
    const elapsed = now - this.lastRequestTokens;
    const shouldRequest = this.articlePool.length
      && (elapsed > this.throttleTimeout);

    if (!shouldRequest) {
      // scheduled a task
      const waitUntilTime = (this.throttleTimeout - elapsed);
      this.throttleTimer = setTimeout(() => this.requestTokensThrottle(), waitUntilTime);
      return;
    }

    debug('requestTokensThrottle() approved', this.articlePool);
    this.lastRequestTokens = now;

    const tweets = this.articlePool.map((tb) => tb.tc);
    const origTweetPool = [...this.articlePool];
    this.articlePool = [];

    chrome.runtime.sendMessage({
      event: MIRI_EVENTS.REQUEST_TOKEN,
      // TODO rename varibable name to more common name
      tweets,
    }, (response) => {
      debug('token responsed');
      if (!response) {
        log('Error: tokens response is invalid.');
        return;
      }

      if (!response.length) {
        // token is empty
        return;
      }

      response.forEach((t, i) => {
        const { c } = origTweetPool[i];
        renderRuby(c, t);
      });
    });
  }

  parseArticle(articleBag) {
    if (!articleBag.length) {
      return;
    }

    articleBag.forEach((bag) => {
      this.articlePool.push(bag);
    });

    this.requestTokensThrottle();
  }
}
