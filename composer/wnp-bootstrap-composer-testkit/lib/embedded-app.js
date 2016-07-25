'use strict';
const _ = require('lodash'),
  envSupport = require('env-support'),
  join = require('path').join,
  outTestkit = require('wix-stdouterr-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs');

class EmbeddedApp extends TestkitBase {
  constructor(appFn, options) {
    super();
    this.outErrTestkit = outTestkit.interceptor();
    this.opts = options || {};
    this.opts.env = _.merge({}, envSupport.bootstrap(), process.env, options.env);
    this.appFn = appFn;
    this.stopFn = () => {};
  }

  doStart() {
    this._prepareLogDir();
    return Promise.resolve()
      .then(() => this.outErrTestkit.start())
      .then(() => this.appFn(this.opts))
      .then(stop => this.stopFn = stop);
  }

  doStop() {
    return Promise.resolve()
      .then(() => this.stopFn())
      .then(() => this.outErrTestkit.stop());
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

  get stdout() {
    return this.outErrTestkit.stderr;
  }

  get stderr() {
    return this.outErrTestkit.stdout;
  }


  get output() {
    return this.outErrTestkit.output;
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

module.exports = EmbeddedApp;