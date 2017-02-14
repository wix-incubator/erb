const _ = require('lodash'),
  envSupport = require('env-support'),
  join = require('path').join,
  outTestkit = require('wix-stdouterr-testkit'),
  TestkitBase = require('wix-testkit-base').TestkitBase,
  shelljs = require('shelljs'),
  fetch = require('node-fetch'),
  retry = require('retry-promise').default;

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
    return Promise.resolve()
      .then(() => this._prepareLogDir())
      .then(() => this.outErrTestkit.start())
      .then(() => unRequire(this.appFile))
      .then(() => require(join(process.cwd(), this.appFile)))
      .then(() => retry(() => fetch(this.getManagementUrl('/health/deployment/test'))));
  }

  doStop() {
    return Promise.resolve()
      .then(() => fetch(this.getManagementUrl('/stop'), {method: 'POST'}))
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

module.exports = EmbeddedServer;

function unRequire(requireFile) {
  const cached = require.resolve(join(process.cwd(), requireFile));
  delete require.cache[cached];
}
