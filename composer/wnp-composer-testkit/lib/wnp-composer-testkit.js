'use strict';
const _ = require('lodash'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support'),
  join = require('path').join,
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs');

class BootstrapApp extends TestkitBase {
  constructor(app, options) {
    super();
    this.opts = {timeout: options.timeout || 10000};
    this.opts.env = _.merge({}, envSupport.bootstrap(), process.env, options.env);
    this.embeddedApp = testkit.server(app, this.opts, testkit.checks.httpGet('/health/is_alive'));
  }

  doStart() {
    this._prepareLogDir();
    return this.embeddedApp.doStart();
  }

  doStop() {
    return this.embeddedApp.doStop();
  }

  getUrl(path) {
    const mountPoint = _.endsWith(this.opts.env.MOUNT_POINT, '/') ? this.opts.env.MOUNT_POINT : this.opts.env.MOUNT_POINT + '/';
    const completePath = join(mountPoint, path || '');
    return `http://localhost:${this.opts.env.PORT}${completePath}`;
  }

  getManagementUrl(path) {
    const mountPoint = _.endsWith(this.opts.env.MOUNT_POINT, '/') ? this.opts.env.MOUNT_POINT : this.opts.env.MOUNT_POINT + '/';
    const completePath = join(mountPoint, path || '');
    return `http://localhost:${this.opts.env.MANAGEMENT_PORT}${completePath}`;
  }

  stdout() {
    return this.embeddedApp.stdout().join();
  }

  stderr() {
    return this.embeddedApp.stderr().join();
  }

  get env() {
    return this.opts.env;
  }
  
  _prepareLogDir() {
    if (this.opts.env.APP_LOG_DIR) {
      shelljs.rm('-rf', this.opts.env.APP_LOG_DIR);
      shelljs.mkdir('-p', this.opts.env.APP_LOG_DIR);
    }
  }
  
}

//TODO: remove as it's deprecated, migrate clients away from it.
module.exports.bootstrapApp = (app, options) => new BootstrapApp(app, options || {});
module.exports.server = (app, options) => new BootstrapApp(app, options || {});