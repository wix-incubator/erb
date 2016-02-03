'use strict';
const expect = require('chai').expect,
  req = require('./support/req'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').bootstrap(),
  WebSocket = require('ws');

describe('wix bootstrap with web-sockets and express servers', function () {
  this.timeout(60000);

  const app = testkit.server('it/apps/web-sockets/index.js', {env: env}, testkit.checks.httpGet('/health/is_alive'));
  app.beforeAndAfter();

  it('should server express app', () =>
    req.get(`http://localhost:${env.PORT}${env.MOUNT_POINT}/initialized`).then(res => {
      expect(res.status).to.equal(200);
      expect(res.text).to.equal('true');
    })
  );

  it('should server websockets app', done => {
    const wsClient = new WebSocket(`ws://localhost:${env.PORT}${env.MOUNT_POINT}`, 'echo-protocol');
    wsClient.on('message', data => {
      expect(data).to.equal('something');
      done();
    });
    wsClient.on('open', () => wsClient.send('something'));
  });
});