const expect = require('chai').use(require('chai-things')).expect,
  statsd = require('wix-statsd-testkit'),
  testkit = require('wix-http-testkit'),
  expressMetering = require('..'),
  http = require('wnp-http-test-client'),
  eventually = require('wix-eventually'),
  WixMeasuredFactory = require('wix-measured'),
  WixMetering = require('wix-measured-metering'),
  WixStatsdAdapter = require('wix-measured-statsd-adapter'),
  StatsD = require('node-statsd'),
  Promise = require('bluebird'),
  {ErrorCode, wixBusinessError} = require('wix-errors');

describe('express metrics middleware', function () {

  this.timeout(10000);

  const wixMeasured = new WixMeasuredFactory('localhost', 'my-app')
    .addReporter(new WixStatsdAdapter(new StatsD({host: 'localhost'}), {interval: 10}))
    .collection('tag', 'WEB');

  const meter = new WixMetering(wixMeasured);
  const statsdServer = statsd.server().beforeAndAfter();
  const server = testkit.server().beforeAndAfter();
  const app = server.getApp();
  const {routesMetering, errorsMetering} = expressMetering(meter);

  beforeEach(() => statsdServer.clear());

  app.use(routesMetering);

  app.get('/success', (req, res) => {
    res.send('ok');
  });

  app.get('/health/is_alive', (req, res) => {
    res.send('ok');
  });

  app.get('/error', (req, res, next) => {
    next(new MyDomainError());
  });

  app.get('/http-status-error', (req, res) => {
    res.sendStatus(401).end();
  });

  app.use(errorsMetering);

  it('reports route meter and histogram on success', () => {
    return http.okGet(server.getUrl('/success'))
      .then(() => eventually(() => {
        expect(statsdServer.events('tag=WEB.resource=success.samples')).not.to.be.empty;
        expect(statsdServer.events('tag=WEB.resource=success.p50')).not.to.be.empty;
      }));
  });

  it('does not report route meter and histogram on failure', () => {
    return http.get(server.getUrl('/error'))
      .then(() => waitForMs(30))
      .then(() => {
        expect(statsdServer.events('tag=WEB.resource=error.samples')).to.be.empty;
        expect(statsdServer.events('tag=WEB.resource=error.p50')).to.be.empty;
      });
  });

  it('reports error on client and server error HTTP statuses', () => {
    return http.get(server.getUrl('/http-status-error'))
      .then(() => eventually(() => {
        expect(statsdServer.events(`tag=WEB.resource=http-status-error.error=HTTP_STATUS_401.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
      }));
  });

  it('reports error meter on failure', () => {
    return http.get(server.getUrl('/error'))
      .then(() => eventually(() => {
        expect(statsdServer.events(`tag=WEB.resource=error.error=MyDomainError.code=${ErrorCode.UNKNOWN}.samples`)).not.to.be.empty;
      }));
  });

  it('does not report metrics for health/is_alive endpoint - temporary hack', () => {
    return http.get(server.getUrl('/health/is_alive'))
      .then(() => waitForMs(30))
      .then(() => {
        expect(statsdServer.events('resource=health_is_alive')).to.be.empty;
      });
  });

  it('does not interfere unmapped request', () => {
    return http.get(server.getUrl('/unmapped'));
  });

  class MyDomainError extends wixBusinessError() {
    constructor() {
      super('woof');
    }
  }

  function waitForMs(millis) {
    return Promise.resolve('ok').delay(millis);
  }
});
