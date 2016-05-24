'use strict';
const log = require('wnp-debug')('wnp-bootstrap-composer');

module.exports = () => {
  process.on('unhandledRejection', handler);
  return () -> Promise.resolve().then(() => process.removeListener('unhandledRejection', handler));
};

function handler(reason, p) {
  log.error(`Unhandled Rejection at: Promise ${p}, reason: ${reason}`);
}