'use strict';
const expect = require('chai').expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  env = require('./support/environment'),
  req = require('./support/req');

describe('wix bootstrap aspects', function () {
  this.timeout(60000);
  env.start();

  ['', '/router'].forEach(basePath => {

    describe(`should provide access within request scope on ${basePath} to`, () => {
      let opts;
      beforeEach(() => opts = wixRequestBuilder.aWixRequest('').withPetri().withBiCookies().withSession());

      it('request context', () =>
        aGet('/req-context').then(res =>
          expect(res.json()).to.have.deep.property('requestId', opts.headers['X-Wix-Request-Id']))
      );

      it('petri cookies', () =>
        aGet('/petri').then(res =>
          expect(res.json()).to.have.deep.property('_wixAB3', opts.cookies._wixAB3))
      );

      it('bi context', () =>
        aGet('/bi').then(res =>
          expect(res.json()).to.have.deep.property('cidx', opts.cookies._wixCIDX))
      );

      it('decoded session', () =>
        aGet('/wix-session').then(res =>
          expect(res.json()).to.deep.equal(opts.wixSession.sessionJson))
      );

      function aGet(path) {
        return req.get(env.appUrl(basePath + '/aspects' + path), opts.options()).then(res => {
          expect(res.status).to.equal(200);
          return res;
        });
      }

    });
  });
});


