/* eslint no-unused-vars: 0 */

// http://www.coelang.tufs.ac.jp/mt/ja/gmod/courses/c02/lesson12/step3/card/022.html
const SPECIAL_MONTH_MAP = {
  1: 'いちがつ',
  2: 'にがつ',
  3: 'さんがつ',
  4: 'しがつ',
  5: 'ごがつ',
  6: 'ろくがつ',
  7: 'しちがつ',
  8: 'はちがつ',
  9: 'くがつ',
  10: 'じゅうがつ',
  11: 'じゅういちがつ',
  12: 'じゅうにがつ',

  '１': 'いちがつ',
  '２': 'にがつ',
  '３': 'さんがつ',
  '４': 'しがつ',
  '５': 'ごがつ',
  '６': 'ろくがつ',
  '７': 'しちがつ',
  '８': 'はちがつ',
  '９': 'くがつ',
  '１０': 'じゅうがつ',
  '１１': 'じゅういちがつ',
  '１２': 'じゅうにがつ',
};

const getMonthReading = date => SPECIAL_MONTH_MAP[date];

const ruleMonth = (token) => {
  const result = [];
  for (let i = 0; i < token.length; i++) {
    const curr = token[i];

    if (i >= token.length - 1) {
      result.push(curr);
      continue;
    }
    const next = token[i + 1];

    if (curr.pos_detail_1 !== '数') {
      result.push(curr);
      continue;
    }

    if (next.surface_form !== '月') {
      result.push(curr);
      continue;
    }

    const reading = getMonthReading(curr.surface_form);
    if (!reading) {
      result.push(curr);
      continue;
    }

    const replaced = {
      word_id: null,
      word_type: 'KNOWN',
      word_position: curr.word_position,
      surface_form: `${curr.surface_form}${next.surface_form}`,
      pos: '名詞',
      pos_detail_1: '副詞可能',
      pos_detail_2: '*',
      pos_detail_3: '*',
      conjugated_type: '*',
      conjugated_form: '*',
      basic_form: null,
      reading,
      pronunciation: reading,
    };

    result.push(replaced);
    i += 1;
  }

  return result;
};
