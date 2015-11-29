'use strict';
const
  expect = require('chai').expect,
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  withApp = require('wix-childprocess-testkit').withApp;

chai.use(chaiAsPromised);

describe('wix-express-cluster-plugin', function() {
  this.slow(2000);
  it('should count regular working request', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000')
      .then(() => {
        return expectAsync(() => rp('http://localhost:8084/stats'), (res) => {
          let stats2 = JSON.parse(res);
          expect(stats2['requests./.counter'].count).to.be.equal(1);
          expectHistogram(stats2['requests./.duration']);
          expectHistogram(stats2['requests./.ttfb']);

          expect(stats2).to.satisfy(noErrors);
        }, 1000, 'Failed to detect a default request /stats');
      });
  }));

  it('should count another working request', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/operation')
      .then(() => {
        return expectAsync(() => rp('http://localhost:8084/stats'), (res) => {
          let stats2 = JSON.parse(res);
          expect(stats2['requests./operation.counter'].count).to.be.equal(1);
          expectHistogram(stats2['requests./operation.duration']);
          expectHistogram(stats2['requests./operation.ttfb']);

          expect(stats2).to.satisfy(noErrors);
        }, 1000, 'Failed to detect a request for operation in /stats');
      });
  }));

  it('should count a timeout request', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/timeout')
      .then(() => {
        return expectAsync(() => rp('http://localhost:8084/stats'), (res) => {
          let stats2 = JSON.parse(res);
          expect(stats2['requests./timeout.counter'].count).to.be.equal(1);
          expectHistogram(stats2['requests./timeout.duration']);
          expectHistogram(stats2['requests./timeout.ttfb']);
          expect(stats2['requests./timeout.error.TimeoutError']).to.be.equal(1);
        }, 1000, 'Failed to detect a request with a Timeout in /stats');
      });
  }));

  it('should count a failed request', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/error')
      .then(() => {
        return expectAsync(() => rp('http://localhost:8084/stats'), (res) => {
          let stats2 = JSON.parse(res);
          expect(stats2['requests./error.counter'].count).to.be.equal(1);
          expectHistogram(stats2['requests./error.duration']);
          expectHistogram(stats2['requests./error.ttfb']);
          expect(stats2['requests./error.error.Error']).to.be.equal(1);
        }, 1000, 'Failed to detect a request with an Error in /stats');
      });
  }));

  it('should count a failed request with a custom error', withApp('./test/apps/launcher', [], {workerCount: 1}, (app) => {
    return rp('http://localhost:3000/custom-error')
      .then(() => {
        return expectAsync(() => rp('http://localhost:8084/stats'), (res) => {
          let stats2 = JSON.parse(res);
          expect(stats2['requests./custom-error.counter'].count).to.be.equal(1);
          expectHistogram(stats2['requests./custom-error.duration']);
          expectHistogram(stats2['requests./custom-error.ttfb']);
          expect(stats2['requests./custom-error.error.MountainError']).to.be.equal(1);
        }, 1000, 'Failed to detect a request with MountainError in /stats');

      });
  }));

});

function expectAsync(action, assertion, timeout, message) {
  let start = hrToMillis(process.hrtime());
  let lastFaliure;

  function sample() {
    return action().then((res) => {
      var ok;
      try {
        assertion(res);
        ok = true;
      }
      catch (e) {
        lastFaliure = e;
        if (e.name === 'assertion-error') {
          ok = false;
        }
      }

      if (ok) {
        return 'ok';
      }
      else if (hrToMillis(process.hrtime()) - start < timeout) {
        return sample();
      }
      else {
        return Promise.reject(new Error(`Failed to complete assertion within ${timeout} mSec. ${message}.
Last sample error:
${lastFaliure.stack}`));
      }
    });
  }

  return sample();
}

function hrToMillis(hr) {
  return hr[0] * 1000 + hr[1] / 1000000;
}

function expectHistogram(obj) {
  expect(obj.min).to.be.a('number');
  expect(obj.max).to.be.a('number');
  expect(obj.count).to.be.a('number');
  expect(obj.median).to.be.a('number');
  expect(obj.p75).to.be.a('number');
  expect(obj.p95).to.be.a('number');
  expect(obj.p99).to.be.a('number');
  expect(obj.p999).to.be.a('number');
}

function noErrors(obj) {
  let keys = Object.keys(obj);
  keys.forEach((key) => {
    if (key.indexOf('requests./.error') > -1) {
      return false;
    }
  });
  return true;
}