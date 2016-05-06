'use strict';

module.exports.isDebug = () => process.execArgv.indexOf('--debug') > -1;
module.exports.isProduction = () => (process.env.NODE_ENV || '').toLowerCase() === 'production';
module.exports.isCI = () => {
  return !!(process.env.IS_BUILD_AGENT && (process.env.IS_BUILD_AGENT === 'true') || process.env.IS_BUILD_AGENT === true);


};
