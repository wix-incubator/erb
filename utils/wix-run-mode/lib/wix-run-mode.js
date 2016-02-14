'use strict';

module.exports.isDebug = () => process.execArgv.indexOf('--debug') > -1;
module.exports.isProduction = () => (process.env.NODE_ENV || '').toLowerCase() === 'production';
module.exports.isCI = () => process.env.IS_BUILD_AGENT ? true : false;
