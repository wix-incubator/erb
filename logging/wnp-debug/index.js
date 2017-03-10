
const DebugLogger = require('./lib/wnp-debug');

module.exports = name => new DebugLogger(name);

module.exports.Logger = DebugLogger;
