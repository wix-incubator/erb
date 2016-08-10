'use strict';

module.exports = (argv, v8object) => {
  const debugArgSet = argv.filter(el => el.indexOf('--debug') > -1 || el.indexOf('--debug-brk') > -1).length > 0;
  const v8ObjectSet = typeof v8object !== 'undefined' && v8object !== null;

  return debugArgSet || v8ObjectSet;
};