'use strict';
const rollingFile = require('rolling-file');

module.exports = (logDir, opts) => {
  return rollingFile(logDir, {
    fileName: opts.prefix,
    interval: '1 day'
  });
};