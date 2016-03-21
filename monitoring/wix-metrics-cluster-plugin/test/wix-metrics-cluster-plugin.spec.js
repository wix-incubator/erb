'use strict';
const expect = require('chai').expect,
  chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  rp = require('request-promise'),
  testkit = require('wix-childprocess-testkit'),
  env = require('env-support').basic();

chai.use(chaiAsPromised);

const asyncTimeout = 4000;

describe('wix-express-cluster-plugin', function () {
  this.timeout(30000);
  testkit.server('./test/apps/app.js', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfterEach();

  it('should count regular working request', () => {
    return aGet('/').then(() => expectAsync(aStatsGet, res => {
      let stats2 = JSON.parse(res);
      expect(stats2['requests./.counter'].count).to.be.equal(1);
      expectHistogram(stats2['requests./.duration']);
      expectHistogram(stats2['requests./.ttfb']);

      expect(stats2).to.satisfy(noErrors);
    }, asyncTimeout, 'Failed to detect a default request /stats'));
  });

  it('should count another working request', () => {
    return aGet('/operation').then(() => expectAsync(aStatsGet, res => {
      let stats2 = JSON.parse(res);
      expect(stats2['requests./operation.counter'].count).to.be.equal(1);
      expectHistogram(stats2['requests./operation.duration']);
      expectHistogram(stats2['requests./operation.ttfb']);

      expect(stats2).to.satisfy(noErrors);
    }, asyncTimeout, 'Failed to detect a request for operation in /stats'));
  });

  it('should count a timeout request', () => {
    return aGet('/timeout').then(() => expectAsync(aStatsGet, res => {
      let stats2 = JSON.parse(res);
      expect(stats2['requests./timeout.counter'].count).to.be.equal(1);
      expectHistogram(stats2['requests./timeout.duration']);
      expectHistogram(stats2['requests./timeout.ttfb']);
      expect(stats2['requests./timeout.error.TimeoutError']).to.be.equal(1);
    }, asyncTimeout, 'Failed to detect a request with a Timeout in /stats'));
  });

  it('should count a failed request', () => {
    return aGet('/error').then(() => expectAsync(aStatsGet, (res) => {
      let stats2 = JSON.parse(res);
      expect(stats2['requests./error.counter'].count).to.be.equal(1);
      expectHistogram(stats2['requests./error.duration']);
      expectHistogram(stats2['requests./error.ttfb']);
      expect(stats2['requests./error.error.Error']).to.be.equal(1);
    }, asyncTimeout, 'Failed to detect a request with an Error in /stats'));
  });

  it('should count a failed request with a custom error', () => {
    return aGet('/custom-error').then(() => expectAsync(aStatsGet, (res) => {
      let stats2 = JSON.parse(res);
      expect(stats2['requests./custom-error.counter'].count).to.be.equal(1);
      expectHistogram(stats2['requests./custom-error.duration']);
      expectHistogram(stats2['requests./custom-error.ttfb']);
      expect(stats2['requests./custom-error.error.MountainError']).to.be.equal(1);
    }, asyncTimeout, 'Failed to detect a request with MountainError in /stats'));
  });

  function aGet(path) {
    return rp(`http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`);
  }

  function aStatsGet() {
    return rp(`http://localhost:${env.MANAGEMENT_PORT}${env.MOUNT_POINT}/stats`);
  }
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
        return Promise.reject(new Error(`Failed to complete assertion within ${timeout} mSec. ${message}.Last sample error:${lastFaliure.stack}`));
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