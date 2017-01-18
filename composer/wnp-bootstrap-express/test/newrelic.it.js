const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  bootstrapExpress = require('../lib/wnp-bootstrap-express'),
  sinon = require('sinon'),
  express = require('express');

describe('new relic', function () {
  this.timeout(10000);
  const newrelic = newRelicStub();
  let app;

  beforeEach(() => {
    newrelic.noticeError.reset();
    newrelic.getBrowserTimingHeader.reset();
    return aServer(newrelic).then(server => {
      app = server;
      return app.start();
    });
  });
  
  afterEach(() => app.stop());

  ['/', '/router/'].forEach(path => {
    describe(`for an app, mounted on ${path}`, () => {
      it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () => {
        return http.get(app.getUrl(`${path}newrelic`))
          .then(() => expect(newrelic.getBrowserTimingHeader).to.have.been.calledTwice);
      });
    });
  });

  it.skip('should invoke newrelic noticeError for an express error', () => {
    return http.get(app.getUrl('/error'))
      .then(() => expect(newrelic.noticeError).to.have.been.calledOnce)
      .then(() => expect(newrelic.noticeError).to.have.been.calledWithMatch(sinon.match.instanceOf(Error)));
  });
  
  function aServer(newrelic) {
    const app = express();
    app.get('/newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    });
    app.get('/error', () => {
      throw new Error('woops');
    });
    
    const router = new express.Router();
    router.get('/router/newrelic', (req, res) => {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    });

    const server = httpTestkit.server();
    
    return bootstrapExpress({seenBy: 'dev', timeout: 10000})({newrelic, session: {v1: {}, v2: {}}}, [() => app, () => router])
      .then(composed => server.getApp().use(composed))
      .then(() => server);
  }

  function newRelicStub() {
    const relic = {
      noticeError: sinon.spy(),
      getBrowserTimingHeader: sinon.stub()
    };

    return relic;
  }
});
