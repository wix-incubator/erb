const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  http = require('wnp-http-test-client'),
  sessionCryptoTestkit = require('wix-session-crypto-testkit'),
  testkit = require('./testkit');

describe('aspects', function () {
  const appFn = app => app
    .get('/aspects/web-context', (req, res) => res.json(req.aspects['web-context']))
    .get('/aspects/petri', (req, res) => res.json(req.aspects['petri'].cookies))
    .get('/aspects/bi', (req, res) => res.json(req.aspects['bi']))
    .get('/aspects/wix-session', (req, res) => res.json(req.aspects['session']))
  const {app} = testkit(appFn);
  app.beforeAndAfter();

  it('web context', () => {
    const opts = reqOptions.builder().options();
    return http.okGet(app.getUrl('/aspects/web-context'), opts)
      .then(res => expect(res.json()).to.have.deep.property('requestId', opts.headers['x-wix-request-id']));
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

  it('decoded wixSession', () => {
    const session = sessionCryptoTestkit.v2.aValidBundle();
    const req = reqOptions.builder().withSession(session);
    return http.okGet(app.getUrl('/aspects/wix-session'), req.options())
      .then(res => expect(res.json()).to.deep.equal(req.wixSession.sessionJson))
  });

});
