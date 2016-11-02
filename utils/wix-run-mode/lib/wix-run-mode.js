'use strict';
const detectDebug = require('./detect-debug');

module.exports.isDebug = () => detectDebug(process.execArgv, global.v8debug);
module.exports.isProduction = () => (process.env.NODE_ENV || '').toLowerCase() === 'production';
module.exports.isCI = () => !!(process.env.IS_BUILD_AGENT && (process.env.IS_BUILD_AGENT === 'true') || process.env.IS_BUILD_AGENT === true);
