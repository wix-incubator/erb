'use strict';
const BiLoggerClientFactory = require('./lib/bi-logger-factory'),
  BiLogger = require('./lib/bi-logger');

module.exports.BiLoggerFactory = BiLoggerClientFactory;
module.exports.BiLogger = BiLogger;

module.exports.factory = () => new BiLoggerClientFactory();
