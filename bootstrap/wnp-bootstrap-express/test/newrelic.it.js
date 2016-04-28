'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch');

describe('new relic', function () {
  this.timeout(60000);
  const env = envSupport.bootstrap();
  testkit
    .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () =>
    fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}/newrelic`)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.json();
      })
      .then(json => {
        expect(json).to.deep.equal({reqTimingHeaders: '', appTimingHeaders: ''});
      })
  );
});