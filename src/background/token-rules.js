/* eslint no-unused-vars: 0 */

/* global
ruleMonth
ruleDate
ruleCounter
rulePurify
*/

const tokenRules = [
  ruleMonth,
  ruleDate,
  ruleCounter,
  rulePurify,
];

const rebulidTokens = (tokens) => tokens.map(
  (token) => tokenRules.reduce((ret, rule) => rule(ret), token),
);
