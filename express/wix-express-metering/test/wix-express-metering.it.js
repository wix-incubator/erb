const expect = require('chai').use(require('chai-things')).use(require('sinon-chai')).expect,
  statsd = require('wix-statsd-testkit'),
  testkit = require('wix-http-testkit'),
  expressMetering = require('..').factory,
  withMeteringTag = require('..').tagging,
  http = require('wnp-http-test-client'),
  eventually = require('wix-eventually').with({timeout: 5000}),
  WixMeasuredFactory = require('wix-measured'),
  WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  Promise = require('bluebird'),
  {ErrorCode, wixBusinessError} = require('wix-errors'),
  sinon = require('sinon'),
  Logger = require('wnp-debug').Logger,
  express = require('express');

describe('express metrics middleware', function () {
  
  describe('on sunny day', () => {

    const {server, statsdServer} = setup(withRealWixMeasuredFactory());

    it('respects custom tag configured via metricTag middleware', () => {
      return http.okGet(server.getUrl('/custom-tag'))
        .then(() => eventually(() => {
          expect(statsdServer.events('tag=INFRA.type=express.resource=get_custom-tag.samples')).not.to.be.empty;
          expect(statsdServer.events('tag=INFRA.type=express.resource=get_custom-tag.p50')).not.to.be.empty;
        }));
    });

    it('reports route meter and histogram on success', () => {
      return http.okGet(server.getUrl('/success'))
        .then(() => eventually(() => {
          expect(statsdServer.events('tag=WEB.type=express.resource=get_success.samples')).not.to.be.empty;
          expect(statsdServer.events('tag=WEB.type=express.resource=get_success.p50')).not.to.be.empty;
        }));
    });

    it('prepends http method name to resource metric key', () => {
      return http.okPost(server.getUrl('/success'))
        .then(() => eventually(() => {
          expect(statsdServer.events('tag=WEB.type=express.resource=post_success.samples')).not.to.be.empty;
          expect(statsdServer.events('tag=WEB.type=express.resource=post_success.p50')).not.to.be.empty;
        }));
    });
    
    it('reports metrics for route defined by regex', () => {
      return http.okGet(server.getUrl('/regex'))
        .then(() => eventually(() => {
          expect(statsdServer.events('tag=WEB.type=express.resource=get_regex_.samples')).not.to.be.empty;
        }));
    });

    it('aggregates route metrics between calls', () => {
      const call = () => http.okGet(server.getUrl('/success'));
      return call()
        .then(() => call())
        .then(() => eventually(() => {
          expect(valuesOf(statsdServer.events('tag=WEB.type=express.resource=get_success.samples'))).to.include.one.above(2);
        }));
    });

    it('does not report route meter and histogram on failure', () => {
      return http.get(server.getUrl('/error'))
        .then(() => waitForMs(30))
        .then(() => {
          expect(statsdServer.events('tag=WEB.type=express.resource=get_error.samples')).to.be.empty;
          expect(statsdServer.events('tag=WEB.type=express.resource=get_error.p50')).to.be.empty;
        });
    });

    it('reports error on client and server error HTTP statuses', () => {
      return http.get(server.getUrl('/http-status-error'))
        .then(() => eventually(() => {
          expect(statsdServer.events(`tag=WEB.type=express.resource=get_http-status-error.error=HTTP_STATUS_401.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
        }));
    });

    it('reports error meter on failure in route', () => {
      return http.get(server.getUrl('/error'))
        .then(() => eventually(() => {
          expect(statsdServer.events(`tag=WEB.type=express.resource=get_error.error=MyDomainError.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
        }));
    });

    it('reports error meter if route handles error, but calls next', () => {
      return http.get(server.getUrl('/handled-error'))
        .then(() => eventually(() => {
          expect(statsdServer.events(`tag=WEB.type=express.resource=get_handled-error.error=MyHandledDomainError.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
        }));
    });

    it('reports error meter on failure in middleware', () => {
      return http.get(server.getUrl('/error-in-middleware'))
        .then(() => eventually(() => {
          expect(statsdServer.events(`tag=WEB.type=express.resource=get_unresolved_route.error=MyDomainError.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
        }));
    });

    it('does not interfere unmapped request', () => {
      return http.get(server.getUrl('/unmapped'));
    });
  });
  
  describe('on rainy day', () => {

    const {server, log} = setup(withMockedWixMeasuredMetering());
    
    it('does not fail request upon express metering failure', () => {
      return http.okGet(server.getUrl('/success'))
        .then(() => eventually(() => expect(log.error).to.have.been.calledWith(sinon.match(/Response.finish.*Error/))));
    });
  });

  class MyDomainError extends wixBusinessError() {
    constructor() {
      super('woof');
    }
  }
  
  class MyHandledDomainError extends wixBusinessError() {
    constructor() {
      super('bark');
    }
  }
  
  function valuesOf(metrics) {
    return metrics.map(e => e.value);
  }
  
  function withMockedWixMeasuredMetering() {
    const wixMeasuredFactory = sinon.createStubInstance(WixMeasuredFactory);
    wixMeasuredFactory.collection.returns(wixMeasuredFactory);
    return wixMeasuredFactory;
  }
  
  function setup(wixMeasuredFactory) {
    const statsdServer = statsd.server().beforeAndAfter();
    const server = testkit.server().beforeAndAfterEach();
    const app = server.getApp();
    const log = sinon.createStubInstance(Logger);
    const {routesMetering, errorsMetering} = expressMetering(wixMeasuredFactory, log);

    app.use(routesMetering);
    
    const innerApp = express()
    innerApp.use((req, res, next) => {
      if (req.url.indexOf('/error-in-middleware') >= 0) {
        next(new MyDomainError());
      } else {
        next();
      }
    });
    
    // prevents statsd adapdter to skip sending data because it's median is 0
    // this should be placed after `routesMetering` middleware
    innerApp.use((req, res, next) => {
      setTimeout(next, 10);
    });

    innerApp.get('/success', (req, res) => {
      res.send('ok');
    });

    innerApp.post('/success', (req, res) => {
      res.send('ok');
    });
    
    innerApp.get(/regex/, (req, res) => {
      res.send('ok');
    });
    
    innerApp.get('/error', (req, res, next) => {
      next(new MyDomainError());
    });

    innerApp.get('/handled-error', (req, res, next) => {
      next(new MyHandledDomainError());
    });

    innerApp.get('/http-status-error', (req, res) => {
      res.sendStatus(401).end();
    });
    
    innerApp.get('/custom-tag', withMeteringTag('INFRA'), (req, res) => {
      res.send('ok');
    });

    innerApp.use((err, req, res, next) => {
      if (!res.headersSent && err.name === 'MyHandledDomainError') {
        res.send('There was an error, but I handled it')
      }
      next(err);
    });
    
    app.use(innerApp);
    app.use(errorsMetering);
    
    return {server, statsdServer, wixMeasuredFactory, log}
  }
  
  function withRealWixMeasuredFactory() {
    return new WixMeasuredFactory('localhost', 'my-app')
      .addReporter(new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10}));
  }

  function waitForMs(millis) {
    return Promise.resolve('ok').delay(millis);
  }
});
