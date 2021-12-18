/* eslint no-unused-vars: 0 */

const kanaToHira = (str = '') => str.replace(/[\u30a1-\u30f6]/g, (match) => {
  const chr = match.charCodeAt(0) - 0x60;
  return String.fromCharCode(chr);
});

const rulePurify = (token) => {
  const pured = token
    .filter((t) => /[\u4E00-\u9FFF]/.test(t.surface_form))
    .filter((t) => t.reading)
    .map((t) => ({
      s: t.surface_form,
      r: kanaToHira(t.reading),
      p: t.word_position - 1,
    }));
  return pured;
};
