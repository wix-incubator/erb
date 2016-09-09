'use strict';
const testkit = require('wix-childprocess-testkit'),
  http = require('wnp-http-test-client');
module.exports.checks = testkit.checks;
module.exports.server = (app, env, check) => new Testkit(app, env, check);

function Testkit(app, env, check) {
  const port = 3000;
  const environemnt = Object.assign({}, {PORT: port}, env);
  const server = testkit.server(`./test/apps/${app}`, {env: environemnt}, check || testkit.checks.httpGet('/'));

  this.beforeAndAfter = () => {
    server.beforeAndAfter();
    return this;
  };

  this.beforeAndAfterEach = () => {
    server.beforeAndAfterEach();
    return this;
  };

  this.getUrl = path => `http://localhost:${environemnt.PORT}${path}`;
  this.getStats = () => http.okGet(`http://localhost:3004/stats`).then(res => res.json());
  this.output = () => server.stdout().join() + server.stderr().join();
}