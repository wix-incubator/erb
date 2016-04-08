'use strict';
require('debug').enable('wnp:*');

const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  outerrTestkit = require('wix-stdouterr-testkit'),
  fetch = require('node-fetch'),
  serverResponsePatch = require('wix-patch-server-response'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressErrorLogger = require('..');

describe('wix-express-error-logger', () => {
  const server = aServer().beforeAndAfterEach();
  const interceptor = outerrTestkit.interceptor().beforeAndAfterEach();

  it('should log sync errors', () =>
    fetch(server.getUrl('/sync-error')).then(res => {
      expect(res.status).to.equal(500);
      expect(interceptor.stderr).to.be.string('Error: sync-error');
    })
  );

  it('should log async errors', () =>
    fetch(server.getUrl('/async-error')).then(res => {
      expect(res.status).to.equal(500);
      expect(interceptor.stderr).to.be.string('Error: async-error');
    })
  );

  it('should log timeouts', () =>
    fetch(server.getUrl('/timeout')).then(res => {
      expect(res.status).to.equal(500);
      expect(interceptor.stderr).to.be.string('Error: request timed out after');
    })
  );

  it('should not log given request was handled properly', () =>
    fetch(server.getUrl('/ok')).then(res => {
      expect(res.status).to.equal(200);
      expect(interceptor.stderr).to.equal('');
    })
  );


  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    serverResponsePatch.patch();
    app.use(wixExpressErrorCapture.async);
    app.use(wixExpressTimeout.get(200));
    app.use(wixExpressErrorLogger);

    app.use((req, res, next) => {
      res.on('x-error', () => res.status(500).end());
      res.on('x-timeout', () => res.status(500).end());
      next();
    });

    app.get('/ok', (req, res) => res.end());
    app.get('/sync-error', () => { throw new Error('sync-error'); });
    app.get('/async-error', () => process.nextTick(() => { throw new Error('async-error') }));
    app.get('/timeout', () => {});

    app.use(wixExpressErrorCapture.sync);
    return server;
  }
});