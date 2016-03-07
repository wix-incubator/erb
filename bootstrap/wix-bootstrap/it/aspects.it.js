'use strict';
const expect = require('chai').expect,
  reqOptions = require('wix-req-options'),
  env = require('./support/environment'),
  req = require('./support/req');

describe('wix bootstrap aspects', function () {
  this.timeout(60000);
  env.start();

  ['', '/router'].forEach(basePath => {

    describe(`should provide access within request scope on ${basePath} to`, () => {

      it('request context', () => {
        const opts = reqOptions.builder().options();
        aGet('/req-context', opts).then(res =>
          expect(res.json()).to.have.deep.property('requestId', opts.headers['x-wix-request-id'])
        );
      });

      it('petri cookies', () => {
        const opts = reqOptions.builder().withPetriAnonymous().options();
        aGet('/petri', opts).then(res =>
          expect(res.json()).to.have.deep.property('_wixAB3', opts.cookies._wixAB3));
      });

      it('bi context', () => {
        const opts = reqOptions.builder().withBi().options();
        aGet('/bi', opts).then(res =>
          expect(res.json()).to.have.deep.property('clientId', opts.cookies._wixCIDX))
      });

      it('decoded session', () => {
        const req = reqOptions.builder().withSession();
        aGet('/wix-session', req.options()).then(res =>
          expect(res.json()).to.deep.equal(opts.wixSession.sessionJson))
      });

      function aGet(path, opts) {
        return req.get(env.appUrl(basePath + '/aspects' + path), opts).then(res => {
          expect(res.status).to.equal(200);
          return res;
        });
      }
    });
  });
});


