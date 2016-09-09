'use strict';
const http = require('wnp-http-test-client'),
  testkit = require('./support/testkit'),
  assert = require('./support/asserts');

describe('wix cluster', function () {
  this.timeout(10000);

  describe('startup', () => {
    const app = testkit.server('defaults').beforeAndAfter();

    it('should start a cluster with a single worker', () => {
      return http.okGet(app.getUrl('/'))
        .then(() => assert.workerCount(app, 1));
    });
  });
});