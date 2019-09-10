/* eslint no-unused-vars: 0 */

const PROPER_NOUNS = [
  {
    name: '令和',
    reading: 'れいわ',
  },
];

const getNounToken = (nameToken) => {
  const name = nameToken.reduce((a, b) => a + b.surface_form, '');
  const find = PROPER_NOUNS.find(pn => pn.name === name);
  if (!find) {
    return nameToken;
  }

  return [{
    word_id: null,
    word_type: 'KNOWN',
    word_position: -1,
    surface_form: find.name,
    pos: '名詞',
    pos_detail_1: '一般',
    pos_detail_2: '*',
    pos_detail_3: '*',
    conjugated_type: '*',
    conjugated_form: '*',
    basic_form: null,
    reading: find.reading,
    pronunciation: find.reading,
  }];
};

const ruleProperNoun = (token) => {
  const result = [];
  for (let i = 0; i < token.length; i++) {
    const curr = token[i];
    if (i >= token.length - 1) {
      result.push(curr);
      continue;
    }

    if (curr.pos !== '名詞') {
      result.push(curr);
      continue;
    }

    const arrName = [curr];
    let nameSize = 1;
    while (nameSize + i < token.length) {
      const next = token[nameSize + i];
      if (next.pos !== '名詞') {
        break;
      }

      if (next.pos_detail_1 === '接尾') {
        break;
      }

      arrName.push(next);
      nameSize += 1;
    }

    if (nameSize === 1) {
      result.push(curr);
      continue;
    }

    const ntoken = getNounToken(arrName);

    ntoken.forEach(nt => result.push(nt));
    i += (nameSize - 1);
  }

  return result;
};
