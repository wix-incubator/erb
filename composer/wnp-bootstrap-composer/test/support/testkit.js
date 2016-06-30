'use strict';
const testkit = require('wix-childprocess-testkit');

module.exports.app = (app, envOverride) => new Testkit(app, envOverride);

function Testkit(app, envOverride) {
  const env = Object.assign({}, {PORT: 3000, MANAGEMENT_PORT: 3004, MOUNT_POINT: '/bootstrap-app' }, envOverride || {});
  const server = testkit.server(`./test/apps/${app}`, {env}, testkit.checks.httpGet('/health/is_alive'));

  this.start = () => server.start();
  this.stop = () => server.stop();

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
  this.stdouterr = () => server.stdout().join() + server.stderr().join();
}