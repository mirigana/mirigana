const TokenCache = new Map();

// eslint-disable-next-line no-unused-vars
function retrieveFromCache(tweets) {
  const cacheArray = [];
  const requestArray = [];

  tweets.forEach((t) => {
    const c = TokenCache.get(t);
    cacheArray.push(c);
    if (c === undefined) {
      requestArray.push(t);
    }
  });
  return {
    cacheArray,
    requestArray,
  };
}

// eslint-disable-next-line no-unused-vars
function persiseToCache(k, v) {
  TokenCache.set(k, v);
}
