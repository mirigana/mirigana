/* eslint no-unused-vars: 0 */

/* global
ruleMonth
ruleDate
ruleCounter
ruleFamousPeople
ruleProperNoun
rulePurify
*/

const tokenRules = [
  ruleMonth,
  ruleDate,
  ruleCounter,
  ruleFamousPeople,
  ruleProperNoun,
  rulePurify,
];

const rebulidToken = (token) => {
  const result = tokenRules.reduce((ret, rule) => rule(ret), token);
  return result;
};
