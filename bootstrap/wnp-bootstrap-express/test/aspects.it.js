'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  envSupport = require('env-support'),
  testkit = require('wix-childprocess-testkit'),
  fetch = require('node-fetch');

describe('wix bootstrap aspects', function () {
  this.timeout(60000);
  const env = envSupport.bootstrap();
  testkit
    .server('./test/app', {env}, testkit.checks.httpGet('/health/is_alive'))
    .beforeAndAfter();

  it('web context', () => {
    const opts = reqOptions.builder().options();
    return aGet('/aspects/web-context', opts).then(json =>
      expect(json).to.have.deep.property('requestId', opts.headers['x-wix-request-id'])
    );
  });

  it('petri cookies', () => {
    const req = reqOptions.builder().withPetriAnonymous();
    return aGet('/aspects/petri', req.options()).then(json => {
      expect(json).to.contain.property('_wixAB3', req.cookies._wixAB3);
    });
  });

  it('bi context', () => {
    const req = reqOptions.builder().withBi();
    return aGet('/aspects/bi', req.options()).then(json =>
      expect(json).to.have.deep.property('clientId', req.cookies._wixCIDX))
  });

  it('decoded session', () => {
    const req = reqOptions.builder().withSession();
    return aGet('/aspects/wix-session', req.options()).then(json =>
      expect(json).to.deep.equal(req.wixSession.sessionJson))
  });

  function aGet(path, opts) {
    return fetch(`http://localhost:${env.PORT}${env.MOUNT_POINT}${path}`, opts).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    });
  }
});