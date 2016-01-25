'use strict';

module.exports.isDebug = () => {
  return process.execArgv.indexOf('--debug') > -1;
};

module.exports.isProduction = () => {
  const env = process.env.NODE_ENV || '';
  return env.toLowerCase() === 'production';
};
