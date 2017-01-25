const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  testkit = require('wix-http-testkit'),
  wixNewrelicExpressMiddleware = require('../lib/wix-express-newrelic-parameters'),
  sinon = require('sinon');


describe('express app with newrelic middleware', () => {

  const server = testkit.server().beforeAndAfter();
  const app = server.getApp();
  const newrelic = newRelicStub();
  app.use(wixNewrelicExpressMiddleware(newrelic));
  app.get('/', (req, res) => res.send('ok'));

  it('should report request headers to newrelic', () => {
    return http.okGet(server.getUrl('/'), {headers: {'my-header': 'my-header-value'}})
      .then(() => expect(newrelic.addCustomParameters).to.have.been.calledWith(sinon.match.has('my-header')));
  });

  function newRelicStub() {
    return {
      addCustomParameters: sinon.spy()
    };
  }
});
