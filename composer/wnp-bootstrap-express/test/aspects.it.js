'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client');

describe('wix bootstrap aspects', function () {
  this.timeout(60000);
  const app = testkit.server('./test/app').beforeAndAfter();

  it('web context', () => {
    const opts = reqOptions.builder().options();
    return http.okGet(app.getUrl('/aspects/web-context'), opts)
      .then(res => expect(res.json()).to.have.deep.property('requestId', opts.headers['x-wix-request-id'])
    );
  });

  it('petri cookies', () => {
    const req = reqOptions.builder().withPetriAnonymous();
    return http.okGet(app.getUrl('/aspects/petri'), req.options())
      .then(res => expect(res.json()).to.contain.property('_wixAB3', req.cookies._wixAB3));
  });

  it('bi context', () => {
    const req = reqOptions.builder().withBi();
    return http.okGet(app.getUrl('/aspects/bi'), req.options())
      .then(res => expect(res.json()).to.have.deep.property('clientId', req.cookies._wixCIDX))
  });

  it('decoded session', () => {
    const req = reqOptions.builder().withSession();
    console.log(req);
    return http.okGet(app.getUrl('/aspects/wix-session'), req.options())
      .then(res => expect(res.json()).to.deep.equal(req.wixSession.sessionJson))
  });
});