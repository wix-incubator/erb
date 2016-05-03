'use strict';
const rollingFile = require('rolling-file'),
  shelljs = require('shelljs'),
  debug = require('debug')('wnp:rolling-file');

module.exports = (logDir, opts) => {
  createLogDirIfNotExists(logDir);
  verifyExistsAndDir(logDir);

  const logger = rollingFile(logDir, {
    fileName: opts.prefix,
    interval: '1 day',
    delimiter: ''
  });

  const originalWrite = logger.write;
  logger.write = (data, cb) => originalWrite(data + '\n', cb);
  return logger;
};

function createLogDirIfNotExists(logDir) {
  if (!shelljs.test('-e', logDir)) {
    debug(`Log folder: '${logDir}' does not exist. Creating...`);
    shelljs.mkdir('-p', logDir);
  }
}

function verifyExistsAndDir(logDir) {
  const exists = shelljs.test('-e', logDir);
  const folder = shelljs.test('-d', logDir);

  if (exists && !folder) {
    throw new Error(`Cannot create logger: '${logDir}' is not a folder.`);
  }
}