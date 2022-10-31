# mirigana
a chrome extension to insert furigana for tweets.

![](screenshot/screen2.png)

**[反馈问题](https://github.com/mirigana/mirigana/issues/new) 用中文也可以**

## Installation

Chrome Web Store

[https://chrome.google.com/webstore/detail/mirigana/hbekfodhcnfpkmoeaijgbamedofonjib](https://chrome.google.com/webstore/detail/mirigana/hbekfodhcnfpkmoeaijgbamedofonjib)


Firefox Addons

**Due to Firefox doesn't support the manifestV3, mirigana will suspend the updating for the firefox**

[https://addons.mozilla.org/en-US/firefox/addon/mirigana/](https://addons.mozilla.org/en-US/firefox/addon/mirigana/)


## Development

```
# prerequisite, for the watch and pack scripts
brew install fswatch jq
```

```
# build the background.js(service worker), both for dev and prod
./watch

# pack the extension
./pack
```


## Credits

mirigana relies on the following projects:

- **kuromoji.js** *https://github.com/takuyaa/kuromoji.js*
- **mecab-ipadic** *https://sourceforge.net/projects/mecab/*
- **mecab-ipadic-NEologd** *https://github.com/neologd/mecab-ipadic-neologd*

