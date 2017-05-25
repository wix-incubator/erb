const _ = require('lodash'),
  envSupport = require('env-support'),
  join = require('path').join,
  outTestkit = require('wix-stdouterr-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs'),
  fetch = require('node-fetch'),
  retry = require('retry-promise').default,
  buildUrl = require('./build-url'),
  logStartupTime = require('./log-startup-time');

class EmbeddedServer extends TestkitBase {
  constructor(appFile, options) {
    super();
    this.outErrTestkit = outTestkit.interceptor();
    this.opts = options || {};
    //TODO: validate that env is merged into global env
    this.opts.env = _.merge(process.env, envSupport.bootstrap(), options.env);
    this.appFile = appFile;
  }

  doStart() {
    return logStartupTime(Promise.resolve()
      .then(() => this._prepareLogDir())
      .then(() => this.outErrTestkit.start())
      .then(() => unRequire(this.appFile))
      .then(() => require(join(process.cwd(), this.appFile)))
      .then(() => retry({max: 20, backoff: 10}, () => fetch(this.getUrl('/health/is_alive')))));
  }

  doStop() {
    return Promise.resolve()
      .then(() => fetch(this.getManagementUrl('/stop'), {method: 'POST'}))
      .then(() => this.outErrTestkit.stop());
  }

  getUrl(path) {
    return buildUrl(this.opts.env.PORT, this.opts.env.MOUNT_POINT)(path);
  }

  getManagementUrl(path) {
    return buildUrl(this.opts.env.MANAGEMENT_PORT, this.opts.env.MOUNT_POINT)(path);
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

module.exports = EmbeddedServer;

function unRequire(requireFile) {
  const cached = require.resolve(join(process.cwd(), requireFile));
  delete require.cache[cached];
}
