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
        return aGet('/req-context', opts).then(res =>
          expect(res.json()).to.have.deep.property('requestId', opts.headers['x-wix-request-id'])
        );
      });

      it('petri cookies', () => {
        const req = reqOptions.builder().withPetriAnonymous();
        return aGet('/petri', req.options()).then(res => {
          console.log(req.cookies._wixAB3);
          console.log(res.json());
          expect(res.json()).to.contain.property('_wixAB3', req.cookies._wixAB3);
        });
      });

      it('bi context', () => {
        const req = reqOptions.builder().withBi();
        return aGet('/bi', req.options()).then(res =>
          expect(res.json()).to.have.deep.property('clientId', req.cookies._wixCIDX))
      });

      it('decoded session', () => {
        const req = reqOptions.builder().withSession();
        return aGet('/wix-session', req.options()).then(res =>
          expect(res.json()).to.deep.equal(req.wixSession.sessionJson))
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


