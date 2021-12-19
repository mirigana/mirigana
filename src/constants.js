/* eslint no-unused-vars: 0 */

const MIRI_EVENTS = {
  TOGGLE_EXTENSION: 'TOGGLE_EXTENSION',
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  LOAD_EXTENSION_INFO: 'LOAD_EXTENSION_INFO',
  REQUEST_TOKEN: 'REQUEST_TOKEN',
  UPDATE_HIRAGANA_SIZE: 'UPDATE_HIRAGANA_SIZE',
  UPDATE_HIRAGANA_COLOR: 'UPDATE_HIRAGANA_COLOR',
  UPDATE_HIRAGANA_NO_SELECT: 'UPDATE_HIRAGANA_NO_SELECT',
};

const PARSE_ENGINES = [
  {
    key: 'LOCAL_KUROMOJI',
    i18nKey: 'ui_engine_builtin',
  },
  {
    key: 'MIRIGANA_ONLINE',
    i18nKey: 'ui_engine_online',
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

const EXTENSION_ENABLED_KEY = 'EXTENSION_ENABLED';
const EXTENSION_ENABLED_DEFAULT = true;

const HIRAGANA_SIZE_PERCENTAGE_KEY = 'HIRAGANA_SIZE_PERCENTAGE';
const HIRAGANA_SIZE_PERCENTAGE_DEFAULT = 50;

const HIRAGANA_COLOR_KEY = 'HIRAGANA_COLOR';
const HIRAGANA_COLOR_DEFAULT = HIRAGANA_COLORS[0].value;

const HIRAGANA_NO_SELECTION_KEY = 'HIRAGANA_NO_SELECTION';
const HIRAGANA_NO_SELECTION_DEFAULT = false;

const CURRENT_PARSE_ENGINE_KEY = 'CURRENT_PARSE_ENGINE';
const CURRENT_PARSE_ENGINE_DEFAULT = 'LOCAL_KUROMOJI';
