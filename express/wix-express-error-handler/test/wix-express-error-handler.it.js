'use strict';
const expect = require('chai').expect,
  testkit = require('wix-childprocess-testkit'),
  http = require('wnp-http-test-client'),
  retry = require('retry-promise').default;

describe('wix-express-error-handler', function () {
  this.timeout(30000);
  const app = testkit.server('./test/apps/app', {env: {PORT: 3000}}, testkit.checks.httpGet('/')).beforeAndAfterEach();

  it('should on async error return error response and emit "uncaughtException"', () =>
    aGet('/async-die', 500)
      .then(() => retry(() => expectStdout('uncaught exception was emitted')))
  );

  it('should not interfere with a request that works', () =>
    aGet('/')
      .then(res => expect(res.text()).to.equal('Hello'))
  );

  it('should, on async operation error, return HTTP 500 with body \'Internal Server Error\'', () =>
    aGet('/async-die', 500)
      .then(res => expect(res.text()).to.equal('Internal Server Error'))
  );

  it('should, on async operation error, return HTTP 500 with json error', () =>
    aJsonGet('/async-die', 500)
      .then(res => expect(res.json()).to.deep.equal({code: 1, message: 'async die', name: 'Error'}))
  );

  it('should, on sync operation error, return HTTP 500 with body \'Internal Server Error\'', () =>
    aGet('/just-die', 500)
      .then(res => expect(res.text()).to.equal('Internal Server Error'))
  );

  it('should, on timeout to write response, return HTTP 504 with body \'Gateway Timeout\'', () =>
    aGet('/just-timeout', 504).then(res => {
      expect(res.elapsedTime).to.be.within(500, 1500);
      expect(res.text()).to.equal('Gateway Timeout');
    })
  );

  it('should, on timeout to write response, return HTTP 504 with json', () =>
    aJsonGet('/just-timeout', 504).then(res => {
      expect(res.elapsedTime).to.be.within(500, 1500);
      expect(res.json()).to.deep.equal({name: 'Error', message: 'request timed out after 1000 mSec'});
    })
  );

  it('should, on timeout after writing response head, return HTTP 200 with the partial body and close response within 1 second (timeout defined in app.js)', () =>
    aGet('/write-partial-then-timeout').then(res => {
      expect(res.elapsedTime).to.be.within(500, 1500);
      expect(res.text()).to.equal('I\'m partial');
    })
  );

  it('should, on async error after writing response, return HTTP 200 with full body', () =>
    aGet('/async-response-then-die')
      .then(res => expect(res.text()).to.equal('I\'m ok'))
  );

  it('should, on sync error after writing response, return HTTP 200 with full body', () =>
    aGet('/just-response-then-die')
      .then(res => expect(res.text()).to.equal('I\'m ok'))
  );

  it('should, on async error after writing response head (not error before completing response), return HTTP 200 with the partial body', () =>
    aGet('/async-partial-write-then-die').then(res => {
      expect(res.elapsedTime).to.be.below(500);
      expect(res.text()).to.equal('I\'m partial');
    })
  );

  it('should, on sync error after writing response head (not error before completing response), return HTTP 200 with the partial body', () =>
    aGet('/just-partial-write-then-die').then(res => {
      expect(res.elapsedTime).to.be.below(500);
      expect(res.text()).to.equal('I\'m partial');
    })
  );

  function aGet(path, expectedStatus, opts) {
    const start = new Date().getTime();
    return http(`http://localhost:3000${path}`, opts || {}).then(res => {
      expect(res.status).to.equal(expectedStatus || 200);
      res.elapsedTime = new Date().getTime() - start;
      return res
    });
  }

  function expectStdout(str) {
    return Promise.resolve()
      .then(() => expect(app.stdout().join()).to.be.string(str))
  }

  function aJsonGet(path, expectedStatus) {
    return aGet(path, expectedStatus, {
      headers: {
        Accept: 'application/json'
      }
    });
  }
});