/* eslint no-unused-vars: 0 */

const kataToHira = (str = '') => str.replace(/[\u30a1-\u30f6]/g, (match) => {
  const chr = match.charCodeAt(0) - 0x60;
  return String.fromCharCode(chr);
});

// perserve kanji only tokens
// perserve token has readinig property
// shift postion to 0 based
const rulePurify = (token) => {
  const pured = token
    .filter((t) => /[\u4E00-\u9FFF]/.test(t.surface_form))
    .filter((t) => t.reading)
    .map((t) => ({
      s: t.surface_form,
      r: kataToHira(t.reading),
      p: t.word_position - 1,
    }));
  return pured;
};
