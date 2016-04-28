'use strict';
const expect = require('chai').expect,
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch');

describe('default headers', function () {
  this.timeout(60000);
  const env = envSupport.bootstrap();
  testkit
    .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('should return "no-cache" as default for caching policy', () =>
    fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
      .then(res => expect(res.headers.get('cache-control')).to.equal('no-cache'))
  );

  it('should return header x-seen-by', () =>
    fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}`)
      .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-dev'))
  );
});