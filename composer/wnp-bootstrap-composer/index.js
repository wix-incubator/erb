const log = require('wnp-debug')('wnp-bootstrap-composer');
const newRelic = require('./lib/boot-relic');
const runMode = require('wix-run-mode');
const beforeAll = require('./lib/before-all');

module.exports.Composer = class BootstrapComposer {
  constructor(opts) {
    beforeAll(runMode, process.env, log, newRelic);
    const Composer = require('./lib/composer');
    this._composer = new Composer(opts);
  }

  config(appConfigFnFile) {
    this._composer.config(appConfigFnFile);
    return this;
  }

  use(plugin, opts) {
    this._composer.use(plugin, opts);
    return this;
  }

  express(expressFnFile) {
    this._composer.express(expressFnFile);
    return this;
  }

  management(expressFnFile) {
    this._composer.management(expressFnFile);
    return this;
  }

  http(httpFnFile) {
    this._composer.http(httpFnFile);
    return this;
  }

  start(opts) {
    return this._composer.start(opts);
  }
};
