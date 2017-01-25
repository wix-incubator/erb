const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  bootstrapExpress = require('../lib/wnp-bootstrap-express'),
  sinon = require('sinon');

describe('new relic', function () {
  this.timeout(10000);
  const newrelic = newRelicStub();
  let app;

  beforeEach(() => {
    newrelic.noticeError.reset();
    newrelic.getBrowserTimingHeader.reset();
    newrelic.addCustomParameters.reset();
    return aServer(newrelic).then(server => {
      app = server;
      return app.start();
    });
  });

  afterEach(() => app.stop());

  it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () => {
    return http.get(app.getUrl('/newrelic'))
      .then(() => expect(newrelic.getBrowserTimingHeader).to.have.been.calledTwice);
  });
  
  it('should report request headers to newrelic agent', () => {
    return http.get(app.getUrl('/newrelic'), {headers : {'my-header': 'my-header-value'}})
      .then(() => expect(newrelic.addCustomParameters).to.have.been.calledWith(sinon.match.has('my-header')));
  });

  function aServer(newrelic) {
    function app(app) {
      app.get('/newrelic', (req, res) => {
        res.json({
          reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
          appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
        });
      });
      app.get('/error', () => {
        throw new Error('woops');
      });
      return app;
    }

    const server = httpTestkit.server();

    return bootstrapExpress({seenBy: 'dev', timeout: 10000})({
      newrelic,
      session: {v1: {}, v2: {}}
    }, [express => app(express)])
      .then(composed => server.getApp().use(composed))
      .then(() => server);
  }

  function newRelicStub() {
    return {
      noticeError: sinon.spy(),
      getBrowserTimingHeader: sinon.stub(),
      addCustomParameters: sinon.spy()
    };
  }
});
