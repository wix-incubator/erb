const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit'),
  sinon = require('sinon');

describe('new relic', function () {
  const appFn = app => app
    .get('/newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    })
    .get('/error', () => {
      throw new Error('woops');
    });

  const {newrelic, app} = testkit(appFn);
  app.beforeAndAfterEach();

  it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () => {
    return http.get(app.getUrl('/newrelic'))
      .then(() => expect(newrelic.getBrowserTimingHeader).to.have.been.calledTwice);
  });

  it('should report request headers to newrelic agent', () => {
    return http.get(app.getUrl('/newrelic'), {headers: {'my-header': 'my-header-value'}})
      .then(() => expect(newrelic.addCustomParameters).to.have.been.calledWith(sinon.match.has('my-header')));
  });
});
