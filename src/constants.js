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
    key: 'default',
    value: '',
  },
  {
    key: 'grey',
    value: '#6C7A89',
  },
  {
    key: 'yellow',
    value: 'rgb(255, 212, 0)',
  },
  {
    key: 'pink',
    value: 'rgb(249, 24, 128)',
  },
  {
    key: 'purple',
    value: 'rgb(120, 86, 255)',
  },
  {
    key: 'orange',
    value: 'rgb(255, 122, 0)',
  },
  {
    key: 'green',
    value: 'rgb(0, 186, 124)',
  }
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
