'use strict';
const debug = require('debug')('wix:bootstrap'),
  util = require('util');
module.exports.setup = () => {
  process.on('unhandledRejection', (reason, p) => {
    debug(`Error: unhandled rejection at: '${util.inspect(p)}', reason: '${reason}'`);
  });
};