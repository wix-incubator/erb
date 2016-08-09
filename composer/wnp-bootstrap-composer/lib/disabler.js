'use strict';

module.exports = (env, disables) => {
  const envDisables = (env['WIX-BOOT-DISABLE-MODULES'] || '').split(',').map(el => el.trim());
  const argDisables = (disables || []);
  const joined = envDisables.concat(argDisables).filter(el => el).sort();
  return joined.reduce((prev, curr) => (prev.find(el => el === curr)) ? prev : prev.concat(curr), []);
};