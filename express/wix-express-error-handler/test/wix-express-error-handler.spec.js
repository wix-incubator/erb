'use strict';
const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit'),
  request = require('request'),
  env = require('env-support').basic();

describe('wix-express-error-handler', function () {
  this.timeout(30000);
  const app = testkit.embeddedApp('./test/apps/app.js', {env}, testkit.checks.httpGet('/'));

  app.beforeAndAfterEach();

  it('should not interfere with a request that works', done => {
    aGet('/', (err, res, body) => {
      expect(body).to.equal('Hello');
      done();
    });
  });

  it('should, on async operation error, return HTTP 500 with body \'Internal Server Error\'', done => {
    aGet('/async-die', (err, res, body) => {
      expect(res.statusCode).to.equal(500);
      expect(body).to.equal('Internal Server Error');
      done();
    });
  });

  it('should, on sync operation error, return HTTP 500 with body \'Internal Server Error\'', done => {
    aGet('/just-die', (err, res, body) => {
      expect(res.statusCode).to.equal(500);
      expect(body).to.equal('Internal Server Error');
      done();
    });
  });

  it('should, on timeout to write response, return HTTP 504 with body \'Gateway Timeout\'', done => {
    aGet('/just-timeout', (err, res, body) => {
      expect(res.statusCode).to.equal(504);
      expect(body).to.equal('Gateway Timeout');
      expect(res.elapsedTime).to.be.within(500, 1500);
      done();
    });
  });

  it('should, on timeout after writing response head, return HTTP 200 with the partial body and close response within 1 second (timeout defined in app.js)', done => {
    aGet('/write-partial-then-timeout', (err, res, body) => {
      expect(res.elapsedTime).to.be.within(500, 1500);
      expect(res.statusCode).to.equal(200);
      expect(body).to.equal('I\'m partial');
      done();
    });
  });

  it('should, on async error after writing response, return HTTP 200 with full body', done => {
    aGet('/async-response-then-die', (err, res, body) => {
      expect(res.statusCode).to.equal(200);
      expect(body).to.equal('I\'m ok');
      done();
    });
  });

  it('should, on sync error after writing response, return HTTP 200 with full body', done => {
    return aGet('/just-response-then-die', (err, res, body) => {
      expect(res.statusCode).to.equal(200);
      expect(body).to.equal('I\'m ok');
      done();
    });
  });

  it('should, on async error after writing response head (not error before completing response), return HTTP 200 with the partial body', done => {
    aGet('/async-partial-write-then-die', (err, res, body) => {
      expect(res.elapsedTime).to.be.below(500);
      expect(res.statusCode).to.equal(200);
      expect(body).to.equal('I\'m partial');
      done();
    });
  });

  it('should, on sync error after writing response head (not error before completing response), return HTTP 200 with the partial body', done => {
    aGet('/just-partial-write-then-die', (err, res, body) => {
      expect(res.elapsedTime).to.be.below(500);
      expect(res.statusCode).to.equal(200);
      expect(body).to.equal('I\'m partial');
      done();
    });
  });

  function aGet(path, cb) {
    const req = {
      method: 'get',
      uri: `http://localhost:${app.env.PORT}${app.env.MOUNT_POINT}${path}`,
      time: true
    };

    return request(req, cb);
  }
});