/* eslint no-unused-vars: 0 */

/* global
ruleFix,
ruleMonth
ruleDate
ruleCounter
rulePurify
*/

const tokenRules = [
  ruleFix,
  ruleMonth,
  ruleDate,
  ruleCounter,
  rulePurify,
];

const rebulidToken = (token) =>
  tokenRules.reduce((ret, rule) => rule(ret), token);
