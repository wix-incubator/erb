'use strict';
const expect = require('chai').expect,
  testkit = require('wix-http-testkit'),
  fetch = require('wnp-http-test-client'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressErrorHandler = require('..'),
  wixExpressTimeout = require('wix-express-timeout');

describe('error hook', function () {
  this.timeout(10000);
  let onErrorInvokedWith;
  const server = aServer().beforeAndAfter();

  beforeEach(() => onErrorInvokedWith = null);

  it('should invoke onError hook on x-error', () => {
    return aGet('/error')
      .then(() => expect(onErrorInvokedWith.message).to.be.string('x-error'));
  });

  it('should invoke onError hook on x-timeout', () => {
    return aGet('/timeout')
      .then(() => expect(onErrorInvokedWith.message).to.be.string('timed out'));
  });

  function aGet(path) {
    const opts = {method: 'GET', headers: {Accept: 'application/json'}};
    return fetch(server.getUrl(path), opts);
  }

  function aServer() {
    const server = testkit.server();
    const app = server.getApp();

    app.use(wixExpressTimeout.get(50));
    app.use(wixExpressErrorCapture.async);
    app.use(wixExpressErrorHandler.handler(err => onErrorInvokedWith = err));

    app.get('/error', () => {
      throw new Error('x-error');
    });

    app.get('/timeout', () => {
    });

    app.use(wixExpressErrorCapture.sync);

    return server;
  }
});
