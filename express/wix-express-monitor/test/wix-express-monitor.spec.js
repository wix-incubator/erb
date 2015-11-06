'use strict';
const request = require('request'),
  chai = require('chai'),
  expect = chai.expect,
  wixPatchServerResponse = require('wix-patch-server-response'),
  wixExpressDomain = require('wix-express-domain'),
  wixExpressErrorCapture = require('wix-express-error-capture'),
  wixExpressTimeout = require('wix-express-timeout'),
  wixExpressMonitor = require('..'),
  httpTestkit = require('wix-http-testkit'),
  lolex = require('lolex');

chai.use(require('./matchers'));

describe('wix express monitor', () => {
  let capturedMonitoringData;
  const server = aServer();

  server.beforeAndAfter();

  beforeEach(() => capturedMonitoringData = undefined);

  it('should capture ok response', done => {
    request.get(server.getUrl('ok'), () => {
      expect(capturedMonitoringData).to.be.a.metric({
        operationName: '/ok',
        timeToFirstByteMs: 'number',
        durationMs: 'number',
        timeout: false,
        errors: []
      });
      done();
    });
  });

  it('should capture slow responses', done => {
    request.get(server.getUrl('/slow'), () => {
      expect(capturedMonitoringData).to.be.a.metric({
        operationName: '/slow',
        timeToFirstByteMs: 'number',
        durationMs: 'number',
        timeout: false,
        errors: []
      });
      done();
    });
  });

  it('should capture timed out responses', done => {
    request.get(server.getUrl('/timeout'), () => {
      expect(capturedMonitoringData).to.be.a.metric({
        operationName: '/timeout',
        timeToFirstByteMs: 'number',
        durationMs: 'number',
        timeout: true,
        errors: ['request timeout after 10 mSec']
      });
      done();
    });
  });

  it('should capture sync errors', done => {
    request.get(server.getUrl('/error-sync'), () => {
      expect(capturedMonitoringData).to.be.a.metric({
        operationName: '/error-sync',
        timeToFirstByteMs: 'number',
        durationMs: 'number',
        timeout: false,
        errors: ['Sync error']
      });
      done();
    });
  });

  it('should capture async errors', done => {
    request.get(server.getUrl('/error-async'), () => {
      expect(capturedMonitoringData).to.be.a.metric({
        operationName: '/error-async',
        timeToFirstByteMs: 'number',
        durationMs: 'number',
        timeout: false,
        errors: ['Async error']
      });
      done();
    });
  });

  it('should capture timeToFirstByteMs, durationMs in ms', done => {
    const before = new Date().getTime();
    request.get(server.getUrl('ok'), () => {
      const durationMs = new Date().getTime() - before;
      expect(capturedMonitoringData.timeToFirstByteMs).to.be.above(0).and.below(durationMs);
      expect(capturedMonitoringData.durationMs).to.be.above(0).and.to.be.below(durationMs);
      done();
    });
  });

  describe('startTime', () => {
    let clock;

    before(() => clock = lolex.install());
    after(() => clock.uninstall());

    it('should be captured', done => {
      request.get(server.getUrl('ok'), () => {
        expect(capturedMonitoringData).to.have.property('startTime', new Date().toISOString());
        done();
      });
    });
  });

  function aServer() {
    const server = httpTestkit.httpServer();
    const app = server.getApp();

    wixPatchServerResponse.patch();

    app.use(wixExpressDomain);
    app.use(wixExpressErrorCapture.async);
    app.use('/timeout', wixExpressTimeout.get(10));


    app.use(wixExpressMonitor.get(metrics =>capturedMonitoringData = metrics));

    app.get('/ok', (req, res) => res.end('hi'));

    app.get('/slow', (req, res) => {
      res.append('an header', 'a value');
      setTimeout(() => res.send('slow'), 10);
    });
    app.get('/timeout', (req, res) =>
      res.on('x-timeout', () => res.status(504).send('timeout'))
    );
    app.get('/error-sync', (req, res) => {
      res.on('x-error', () => res.status(500).send('error'));
      throw new Error('Sync error');
    });
    app.get('/error-async', (req, res) => {
      res.on('x-error', () => res.status(500).send('error'));
      process.nextTick(() => {
        throw new Error('Async error');
      });
    });

    app.use(wixExpressErrorCapture.sync);

    return server;
  }
});





