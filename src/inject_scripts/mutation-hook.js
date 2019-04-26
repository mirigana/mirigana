(() => {
  const miri = {
    log: (...args) => {
      console.log('[MIRI]', ...args);
    },
  };

  const waitForTimeline = () => new Promise((resolve, reject) => {
    let interval = null;
    let timeout = null;

    interval = setInterval(() => {
      if (document.querySelector('[role=region]')) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 500);

    timeout = setTimeout(() => {
      clearInterval(interval);
      reject();
    }, 10000);
  });


  const registerMutationHook = () => {
    const TL_CONTAINER_SELECTOR = 'section>div>div>div.css-1dbjc4n';
    const tlContainer = document.querySelector(TL_CONTAINER_SELECTOR);

    if (!tlContainer) {
      miri.log('not found timeline container element.');
      return;
    }

    const observer = new MutationObserver((mutationsList, observer) => {
      mutationsList.forEach((mutation) => {
        const { addedNodes } = mutation;

        if (!addedNodes.length) {
          // ignore the non-add events
          return;
        }

        addedNodes.forEach((node) => {
          const tweetContainer = node.querySelector('article>div>div:nth-child(2)>div>div:nth-child(2)')

          if (!tweetContainer || tweetContainer.getAttribute('lang') !== 'ja') {
            // ignore the non-ja language
            return;
          }
          miri.log('Should update html for:', tweetContainer.innerText);
        });
      });
    });

    observer.observe(tlContainer, { childList: true });
  };

  waitForTimeline()
    .then(() => {
      miri.log('timeline loaded.');
      registerMutationHook();
    }).catch(() => {
      miri.log('timeline load tiemout.');
    });
})();
