const envSupport = require('env-support'),
  {join} = require('path'),
  outTestkit = require('wix-stdouterr-testkit'),
  {TestkitBase} = require('wix-testkit-base'),
  shelljs = require('shelljs'),
  fetch = require('node-fetch'),
  buildUrl = require('./build-url'),
  logStartupTime = require('./log-startup-time'),
  eventually = require('wix-eventually');

class EmbeddedServer extends TestkitBase {
  constructor(appFile, options) {
    super();
    this.outErrTestkit = outTestkit.interceptor();
    this.opts = options || {};
    this.environmentBefore = Object.assign({}, process.env);
    this.appEnvironment = Object.assign({}, process.env, envSupport.bootstrap(), options.env);
    this.appFile = appFile;
  }

  doStart() {
    return logStartupTime(Promise.resolve()
      .then(() => this._prepareLogDir())
      .then(() => this.outErrTestkit.start())
      .then(() => {
        unRequire(this.appFile);
        this.environmentBefore = Object.assign({}, process.env);
        Object.assign(process.env, this.appEnvironment);
        require(join(process.cwd(), this.appFile));
        return eventually(() => fetch(this.getUrl('/health/is_alive')), {timeout: 2000, interval: 100});
      }).catch(e => {
        this._restoreEnvironment();
        return Promise.reject(e);
      }));
  }

  doStop() {
    return Promise.resolve()
      .then(() => fetch(this.getManagementUrl('/stop'), {method: 'POST'}))
      .then(() => this.outErrTestkit.stop())
      .then(() => this._restoreEnvironment())
      .catch(e => {
        this._restoreEnvironment();
        return Promise.reject(e);
      });
  }

  _restoreEnvironment() {
    Object.keys(this.appEnvironment).forEach(key => delete process.env[key]);
    Object.assign(process.env, this.environmentBefore);
  }

  getUrl(path) {
    return buildUrl(this.appEnvironment.PORT, this.appEnvironment.MOUNT_POINT)(path);
  }

  getManagementUrl(path) {
    return buildUrl(this.appEnvironment.MANAGEMENT_PORT, this.appEnvironment.MOUNT_POINT)(path);
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
    return this.appEnvironment;
  }

  _prepareLogDir() {
    const logDir = this.appEnvironment.APP_LOG_DIR;
    if (logDir) {
      shelljs.rm('-rf', logDir);
      shelljs.mkdir('-p', logDir);
    }
  }
}

module.exports = EmbeddedServer;

function unRequire(requireFile) {
  const cached = require.resolve(join(process.cwd(), requireFile));
  delete require.cache[cached];
}
