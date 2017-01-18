'use strict';
const expressTimeout = require('./lib/wix-express-timeout');

module.exports = expressTimeout;
//TODO: migrate clients and remove
module.exports.get = expressTimeout;
