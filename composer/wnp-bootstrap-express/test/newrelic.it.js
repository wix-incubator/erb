const expect = require('chai').use(require('sinon-chai')).expect,
  http = require('wnp-http-test-client'),
  httpTestkit = require('wix-http-testkit'),
  bootstrapExpress = require('../lib/wnp-bootstrap-express'),
  sinon = require('sinon'),
  express = require('express'),
  Logger = require('wnp-debug').Logger;

describe('new relic', function () {
  this.timeout(10000);
  const {newrelic} = stubs();
  const app = aServer(newrelic).beforeAndAfter();

  beforeEach(() => {
    newrelic.getBrowserTimingHeader.reset();
    newrelic.agent.errors.addUserError.reset();
  });

  ['/', '/router/'].forEach(path => {
    describe(`for an app, mounted on ${path}`, () => {
      it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () => {
        return http.get(app.getUrl(`${path}newrelic`))
          .then(() => expect(newrelic.getBrowserTimingHeader).to.have.been.calledTwice);
      });
    });
  });

  it('should report error to newrelic for an express error', () => {
    return http.get(app.getUrl('/error'))
      .then(() => assertErrorReported(newrelic));
  });

  function aServer(newrelic) {
    const server = httpTestkit.server();
    const app = express();
    const router = new express.Router();

    function timingsHandler(req, res) {
      res.json({
        reqTimingHeaders: req.app.locals.newrelic.getBrowserTimingHeader(),
        appTimingHeaders: app.locals.newrelic.getBrowserTimingHeader()
      });
    }

    function throwErrorHandler() {
      throw new Error('woops');
    }

    app.get('/newrelic', timingsHandler);
    app.get('/error', throwErrorHandler);
    router.get('/router/newrelic', timingsHandler);

    server.getApp().use(bootstrapExpress({seenBy: 'dev', timeout: 10000})({
      newrelic,
      session: {v1: {}, v2: {}}
    }, [app, router]));

    return server;
  }

//TODO: see if this could be replaced with proper e2e
  function stubs() {
    const log = sinon.createStubInstance(Logger);
    const newrelic = {
      getBrowserTimingHeader: sinon.stub(),
      agent: {
        tracer: {
          getTransaction: () => 't1'
        },
        errors: {
          addUserError: sinon.spy()
        }
      }
    };

    return {newrelic, log};
  }

  function assertErrorReported(newrelic) {
    expect(newrelic.agent.errors.addUserError).to.have.been.calledOnce;
    expect(newrelic.agent.errors.addUserError).to.have.been.calledWithMatch(newrelic.agent.tracer.getTransaction(), sinon.match.instanceOf(Error));
  }
});
