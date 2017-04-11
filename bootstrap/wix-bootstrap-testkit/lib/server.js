const _ = require('lodash'),
  testkit = require('wix-childprocess-testkit'),
  envSupport = require('env-support'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs'),
  buildUrl = require('./build-url');

class ServerApp extends TestkitBase {
  constructor(app, options) {
    super();
    const env = _.merge({}, envSupport.bootstrap(), process.env, options.env);
    const opts = {timeout: options.timeout || 10000, env};
    if (options.cwd) {
      opts.cwd = options.cwd;
    }

    const aliveCheckUrl = buildUrl(env.PORT, env.MOUNT_POINT)('/health/is_alive');
    const aliveCheck = testkit.checks.http(aliveCheckUrl);
    this.embeddedApp = testkit.fork(app, opts, aliveCheck);
    this.opts = opts;
  }

  doStart() {
    prepareLogDir(this.opts.env.APP_LOG_DIR);
    return this.embeddedApp.doStart();
  }

  doStop() {
    return this.embeddedApp.doStop();
  }

  getUrl(path) {
    return buildUrl(this.opts.env.PORT, this.opts.env.MOUNT_POINT)(path);
  }

  getManagementUrl(path) {
    return buildUrl(this.opts.env.MANAGEMENT_PORT, this.opts.env.MOUNT_POINT)(path);
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
}

function prepareLogDir(logDir) {
  if (logDir) {
    shelljs.rm('-rf', logDir);
    shelljs.mkdir('-p', logDir);
  }
}


module.exports = ServerApp;
