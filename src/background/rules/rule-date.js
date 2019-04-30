/* eslint no-unused-vars: 0 */

// http://www.coelang.tufs.ac.jp/mt/ja/gmod/courses/c02/lesson12/step3/card/022.html
const SPECIAL_DATE_MAP = {
  1: 'ついたち',
  2: 'ふつか',
  3: 'みっか',
  4: 'よっか',
  5: 'いつか',
  6: 'むいか',
  7: 'なのか',
  8: 'ようか',
  9: 'ここのか',
  10: 'とおか',
  14: 'じゅうよっか',
  19: 'じゅうくにち',
  20: 'はつか',
  24: 'にじゅうよっか',
  29: 'にじゅうくにち',

  '１': 'ついたち',
  '２': 'ふつか',
  '３': 'みっか',
  '４': 'よっか',
  '５': 'いつか',
  '６': 'むいか',
  '７': 'なのか',
  '８': 'ようか',
  '９': 'ここのか',
  '１０': 'とおか',
  '１４': 'じゅうよっか',
  '１９': 'じゅうくにち',
  '２０': 'はつか',
  '２４': 'にじゅうよっか',
  '２９': 'にじゅうくにち',

  一: 'ついたち',
  二: 'ふつか',
  三: 'みっか',
  四: 'よっか',
  五: 'いつか',
  六: 'むいか',
  七: 'なのか',
  八: 'ようか',
  九: 'ここのか',
  十: 'とおか',
  十四: 'じゅうよっか',
  十九: 'じゅうくにち',
  二十: 'はつか',
  二十四: 'にじゅうよっか',
  二十九: 'にじゅうくにち',
};

const getDateReading = date => SPECIAL_DATE_MAP[date];

const ruleDate = (token) => {
  const result = [];
  for (let i = 0; i < token.length; i++) {
    const curr = token[i];

    if (i >= token.length) {
      result.push(curr);
      continue;
    }
    const next = token[i + 1];

    if (i === 0) {
      result.push(curr);
      continue;
    }
    const prev = token[i - 1];

    if (prev.surface_form !== '月' && prev.pos_detail_1 !== '副詞可能') {
      // not 5月 and 五月
      result.push(curr);
      continue;
    }

    if (curr.pos_detail_1 !== '数') {
      result.push(curr);
      continue;
    }

    if (next.surface_form !== '日' || next.pos_detail_2 !== '助数詞') {
      result.push(curr);
      continue;
    }

    const reading = getDateReading(curr.surface_form);
    if (!reading) {
      result.push(curr);
      continue;
    }

    const replaced = {
      word_id: null,
      word_type: 'KNOWN',
      word_position: -1,
      surface_form: `${curr.surface_form}${next.surface_form}`,
      pos: '名詞',
      pos_detail_1: '一般',
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
