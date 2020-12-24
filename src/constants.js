/*
global
*/

/*
eslint no-unused-vars: 0
*/

const MIRI_EVENTS = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  LOAD_EXTENSION_INFO: 'LOAD_EXTENSION_INFO',
  DOWNLOAD_ASSETS: 'DOWNLOAD_ASSETS',
  REQUEST_TOKEN: 'REQUEST_TOKEN',
  UPDATE_HIRAGANA_SIZE: 'UPDATE_HIRAGANA_SIZE',
  UPDATE_HIRAGANA_COLOR: 'UPDATE_HIRAGANA_COLOR',
  UPDATE_HIRAGANA_NO_SELECT: 'UPDATE_HIRAGANA_NO_SELECT',
};

const PARSE_ENGINE_KEYS = {
  MIRIGANA_ONLINE: 'MIRIGANA_ONLINE',
  LOCAL_KUROMOJI: 'LOCAL_KUROMOJI',
};

const PARSE_ENGINES = [
  {
    key: PARSE_ENGINE_KEYS.MIRIGANA_ONLINE,
    i18nKey: 'ui_engine_online',
  },
  {
    key: PARSE_ENGINE_KEYS.LOCAL_KUROMOJI,
    i18nKey: 'ui_engine_builtin',
  },
];

const HIRAGANA_COLORS = [
  {
    key: 'black',
    value: '#000',
  },
  {
    key: 'grey',
    value: '#6C7A89',
  },
  {
    key: 'blue',
    value: '#3498DB',
  },
  {
    key: 'purple',
    value: '#9B59B6',
  },
  {
    key: 'red',
    value: '#E74C3C',
  },
  {
    key: 'white',
    value: '#FFFFFF',
  },
];

const HIRAGANA_SIZE_PERCENTAGE_KEY = 'HIRAGANA_SIZE_PERCENTAGE';
const HIRAGANA_SIZE_PERCENTAGE_DEFAULT = 50;

const HIRAGANA_COLOR_KEY = 'HIRAGANA_COLOR';
const HIRAGANA_COLOR_DEFAULT = HIRAGANA_COLORS[0].value;

const HIRAGANA_NO_SELECTION_KEY = 'HIRAGANA_NO_SELECTION';
const HIRAGANA_NO_SELECTION_DEFAULT = false;

const CURRENT_PARSE_ENGINE_KEY = 'CURRENT_PARSE_ENGINE';


const KUROMOJI_DICT_KEYS = [
  'base.dat',
  'check.dat',
  'tid.dat',
  'tid_pos.dat',
  'tid_map.dat',
  'cc.dat',
  'unk.dat',
  'unk_pos.dat',
  'unk_map.dat',
  'unk_char.dat',
  'unk_compat.dat',
  'unk_invoke.dat',
];
