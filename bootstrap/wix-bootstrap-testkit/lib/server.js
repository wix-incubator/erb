const _ = require('lodash'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support'),
  join = require('path').join,
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs');

class ServerApp extends TestkitBase {
  constructor(app, options) {
    super();
    this.opts = {timeout: options.timeout || 10000 };
    if (options.cwd) {
      this.opts.cwd = options.cwd;
    }
    this.opts.env = _.merge({}, envSupport.bootstrap(), process.env, options.env);
    const check = testkit.checks.http(`http://localhost:${this.opts.env.MANAGEMENT_PORT}${this.opts.env.MOUNT_POINT}/health/deployment/test`);
    this.embeddedApp = testkit.fork(app, this.opts, check);
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

  get stdout() {
    return this.embeddedApp.stdout().join();
  }

  get stderr() {
    return this.embeddedApp.stderr().join();
  }


  get output() {
    return this.embeddedApp.output;
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

module.exports = ServerApp;
