'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  fetch = require('wnp-http-test-client'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('..');

describe('worker shutdown', function() {
  this.timeout(10000);
  let shutdownWasAttempted = false;
  const server = aServer();

  server.beforeAndAfterEach();

  beforeEach(() => shutdownWasAttempted = false);

  it('should not attempt to shutdown worker process given error is applicative', () =>
    aGet('/applicative').then(res => {
      expect(res.json()).to.deep.equal({name: 'Error', message: 'applicative'});
      expect(shutdownWasAttempted).to.equal(false);
    })
  );

  it('should attempt to shutdown worker process given error is non-applicative', () =>
    aGet('/non-applicative').then(res => {
      expect(res.json()).to.deep.equal({name: 'Error', message: 'non-applicative'});
      expect(shutdownWasAttempted).to.equal(true);
    })
  );

  function aGet(path) {
    const opts = {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    };

    return fetch(server.getUrl(path), opts);
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(wixExpressErrorCapture.async);

    app.use(wixExpressErrorHandler.handler(() => shutdownWasAttempted = true));

    app.get('/applicative', () => {
      const err = new Error('applicative');
      err.applicative = true;
      throw err;
    });

    app.get('/non-applicative', () => {
      process.nextTick(() => {
        throw new Error('non-applicative');
      });
    });

    app.use(wixExpressErrorCapture.sync);

    return server;
  }
});