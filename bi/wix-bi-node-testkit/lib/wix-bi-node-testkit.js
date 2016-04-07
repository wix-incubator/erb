'use strict';
const TestkitBase = require('wix-testkit-base').TestkitBase,
  logFileTestkit = require('wix-log-file-testkit'),
  join = require('path').join;

module.exports = logDir => new WixBiNodeTestkit(logDir);

class WixBiNodeTestkit extends TestkitBase {
  constructor(logDir) {
    super();
    const loggingDirectory = logDir || process.env.APP_LOG_DIR || './target/logs';
    this._logFileTestkit = logFileTestkit.interceptor(join(loggingDirectory, 'wix.bi*.log'));
  }

  get events() {
    return this._logFileTestkit.captured.split('\n')
      .map(JSON.parse)
      .map(evt => evt.MESSAGE);
  }

  doStart() {
    return this._logFileTestkit.start();
  }

  doStop() {
    return this._logFileTestkit.stop();
  }
}