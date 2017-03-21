const testkit = require('wix-childprocess-testkit'),
  stdoutErr = require('wix-stdouterr-testkit'),
  eventually = require('wix-eventually'),
  fetch = require('node-fetch'),
  {expect} = require('chai').use(require('chai-as-promised'));

module.exports.server = (app, envOverride) => new Server(app, envOverride);
module.exports.app = (app, opts) => new EmbeddedApp(app, opts);

function Server(app, envOverride) {
  const env = Object.assign({}, {PORT: 3000, MANAGEMENT_PORT: 3004, MOUNT_POINT: '/bootstrap-app' }, envOverride || {});
  const server = testkit.fork(`./test/apps/${app}`, {env}, testkit.checks.httpGet('/health/is_alive'));

  this.start = () => server.start();
  this.stop = () => {
    return fetch(this.managementAppUrl('/stop'), {method: 'POST'})
      .then(res => expect(res.status).to.equal(200))
      .then(() => eventually(() => expect(server.output).to.be.string('Shutdown completed cleanly')))
      .then(() => server.stop());
  };

  this.beforeAndAfter = () => {
    server.beforeAndAfter();
    return this;
  };

  this.beforeAndAfterEach = () => {
    server.beforeAndAfterEach();
    return this;
  };

  this.appUrl = path => `http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`;
  this.managementAppUrl = path => {
    const mountPoint = env.MOUNT_POINT === '/' ? '' : env.MOUNT_POINT;
    return `http://localhost:${env.MANAGEMENT_PORT}${mountPoint}${path}`;
  };
  this.env = env;
  this.stdouterr = () => server.output;
}

function EmbeddedApp(app, opts) {
  const stdTestkit = stdoutErr.interceptor();
  const options = opts || {};
  options.env = Object.assign({}, {PORT: 3000, MANAGEMENT_PORT: 3004, MOUNT_POINT: '/bootstrap-app' }, options.env);
  const env = options.env;
  this.stoppable = () => {};

  this.beforeAndAfter = () => {
    before(() => stdTestkit.start().then(() => app(options)).then(stop => this.stoppable = stop));
    after(() => stdTestkit.stop().then(() => this.stoppable()));
    return this;
  };

  this.appUrl = path => `http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`;
  this.managementAppUrl = path => `http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}${path}`;
  this.env = env;
  this.stdouterr = () => stdTestkit.output;
}
