/* eslint no-unused-vars: 0 */

const FAMOUS_PEOPLE = [
  {
    fname: '愛夏',
    lname: '林',
    fname_reading: 'まなつ',
    lname_reading: 'はやし',
  },
  {
    fname: '梨華子',
    lname: '大矢',
    fname_reading: 'りかこ',
    lname_reading: 'おおや',
  },
  {
    fname: '奈々聖',
    lname: '廣川',
    fname_reading: 'ななせ',
    lname_reading: 'ひろかわ',
  },
  {
    fname: '瑠香',
    lname: '三品',
    fname_reading: 'るか',
    lname_reading: 'みしな',
  },
  {
    fname: '美里',
    lname: '松田',
    fname_reading: 'みり',
    lname_reading: 'まつだ',
  },
];

const getFirstNameToken = (nameToken) => {
  const result = [];
  const fname = nameToken.reduce((a, b) => a + b.surface_form, '');
  const find = FAMOUS_PEOPLE.find(fp => fp.fname === fname);
  if (!find) {
    return nameToken;
  }

  result.push({
    word_id: null,
    word_type: 'KNOWN',
    word_position: -1,
    surface_form: find.fname,
    pos: '名詞',
    pos_detail_1: '固有名詞',
    pos_detail_2: '人名',
    pos_detail_3: '姓',
    conjugated_type: '*',
    conjugated_form: '*',
    basic_form: null,
    reading: find.fname_reading,
    pronunciation: find.fname_reading,
  });

  return result;
};

const getFullNameToken = (nameToken) => {
  const result = [];
  const [lnt, ...rest] = nameToken;
  const sameLastName = FAMOUS_PEOPLE.filter(fp => fp.lname === lnt.surface_form);
  const fname = rest.reduce((a, b) => a + b.surface_form, '');

  const find = sameLastName.find(sm => sm.fname === fname);
  if (!find) {
    return getFirstNameToken(nameToken);
  }

  result.push({
    word_id: null,
    word_type: 'KNOWN',
    word_position: -1,
    surface_form: find.lname,
    pos: '名詞',
    pos_detail_1: '固有名詞',
    pos_detail_2: '人名',
    pos_detail_3: '姓',
    conjugated_type: '*',
    conjugated_form: '*',
    basic_form: null,
    reading: find.lname_reading,
    pronunciation: find.lname_reading,
  });

  result.push({
    word_id: null,
    word_type: 'KNOWN',
    word_position: -1,
    surface_form: find.fname,
    pos: '名詞',
    pos_detail_1: '固有名詞',
    pos_detail_2: '人名',
    pos_detail_3: '姓',
    conjugated_type: '*',
    conjugated_form: '*',
    basic_form: null,
    reading: find.fname_reading,
    pronunciation: find.fname_reading,
  });

  return result;
};

const isNameNoun = (token) => {
  if (token.pos !== '名詞') {
    return false;
  }

  if (token.pos_detail_1 === '接尾') {
    return false;
  }

  if (token.pos_detail_2 !== '人名' && token.pos_detail_1 !== '一般' ) {
    return false;
  }

  return true;
};

const ruleFamousPeople = (token) => {
  const result = [];
  for (let i = 0; i < token.length; i++) {
    const curr = token[i];
    if (i >= token.length) {
      result.push(curr);
      continue;
    }

    if (!isNameNoun(curr)) {
      result.push(curr);
      continue;
    }

    const arrName = [curr];
    let nameSize = 1;
    while (nameSize + i < token.length) {
      const next = token[nameSize + i];
      if (!isNameNoun(next)) {
        break;
      }
      arrName.push(next);
      nameSize += 1;
    }

    if (nameSize === 1) {
      result.push(curr);
      continue;
    }

    const ntoken = getFullNameToken(arrName);

    ntoken.forEach(nt => result.push(nt));
    i += (nameSize - 1);
  }

  return result;
};
