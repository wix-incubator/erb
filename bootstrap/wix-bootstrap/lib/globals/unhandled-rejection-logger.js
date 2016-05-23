'use strict';
const log = require('wnp-debug')('bootstrap'),
  util = require('util');
module.exports.setup = () => {
  process.on('unhandledRejection', (reason, p) => {
    log.error(`Error: unhandled rejection at: '${util.inspect(p)}', reason: '${reason}'`);
  });
};