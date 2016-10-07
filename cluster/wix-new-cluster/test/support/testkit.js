'use strict';
const testkit = require('wix-childprocess-testkit'),
  http = require('wnp-http-test-client');

module.exports.checks = testkit.checks;
module.exports.server = (app, env, check) => new Testkit(app, env, check);

function Testkit(app, environment, check) {
  const port = 3000;
  const env = Object.assign({}, {PORT: port}, environment);
  const server = testkit.fork(`./test/apps/${app}`, {env}, check || testkit.checks.httpGet('/'));

  this.beforeAndAfter = () => {
    server.beforeAndAfter();
    return this;
  };

  this.beforeAndAfterEach = () => {
    server.beforeAndAfterEach();
    return this;
  };

  this.getUrl = path => `http://localhost:${env.PORT}${path}`;
  this.getStats = () => http.okGet(`http://localhost:3004/stats`).then(res => res.json());
  this.output = () => server.output;
}