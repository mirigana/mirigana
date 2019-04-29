/* eslint no-unused-vars: 0 */

const rulePurify = token => token.map(t => ({
  surface_form: t.surface_form,
  reading: t.reading,
}));
