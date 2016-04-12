'use strict';
var rp = require('request-promise'),
  testkit = require('wix-childprocess-testkit');

describe('wix-cluster.run', function() {
  this.timeout(30000);
  testkit.server('./test/apps/defaults-run', {env: {PORT: 3000}}, testkit.checks.httpGet('/'))
    .beforeAndAfter();

  it('should run an app', () => rp('http://localhost:3000/'));

});