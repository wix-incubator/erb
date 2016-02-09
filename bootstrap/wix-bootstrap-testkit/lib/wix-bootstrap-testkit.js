'use strict';
const _ = require('lodash'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support'),
  join = require('path').join,
  TestkitBase = require('wix-testkit-base').TestkitBase;

class BootstrapApp extends TestkitBase {
  constructor(app, options) {
    super();
    this.opts = _.merge({ timeout: 10000, env: envSupport.bootstrap() }, {env: _.clone(process.env, true)}, options || {});
    this.embeddedApp = testkit.server(app, this.opts, testkit.checks.httpGet('/health/is_alive'));
  }

  doStart() {
    return this.embeddedApp.start();
  }

  doStop() {
    return this.embeddedApp.stop();
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
    return this.embeddedApp.stdout();
  }

  stderr() {
    return this.embeddedApp.stderr();
  }

  get env() {
    return this.opts.env;
  }
}

//TODO: remove as it's deprecated, migrate clients away from it.
module.exports.bootstrapApp = (app, options) => new BootstrapApp(app, options);
module.exports.server = (app, options) => new BootstrapApp(app, options);