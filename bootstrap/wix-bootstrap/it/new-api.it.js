'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').bootstrap(),
  WebSocket = require('ws');

describe('wix bootstrap web-sockets support', function () {
  this.timeout(60000);

  const app = testkit.embeddedApp('it/apps/web-sockets/index.js', {env: env}, testkit.checks.httpGet('/health/is_alive'));
  app.beforeAndAfter();

  it('passes over cluster config (worker process count set to 1) to wix-cluster module', () => {
    console.log(`http://localhost:${env.PORT}${env.MOUNT_POINT}`);
    return req.get(`http://localhost:${env.PORT}${env.MOUNT_POINT}`).then(res =>
      expect(res.status).to.equal(200))
  });


  it('allows client to serve web-sockets via default app', done => {
    const wsClient = new WebSocket(`ws://localhost:${env.PORT}${env.MOUNT_POINT}`, 'echo-protocol');
    wsClient.on('open', () => wsClient.send('something'));

    wsClient.on('message', data => {
      expect(data).to.equal('something');
      done();
    });
  });
});