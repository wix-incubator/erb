'use strict';
const expect = require('chai').expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  env = require('./support/environment'),
  req = require('./support/req');

describe('wix bootstrap aspects', function () {
  this.timeout(60000);
  env.start();

  ['', '/router'].forEach(basePath => {

    describe('eee', () => {
      let opts;
      beforeEach(() => opts = wixRequestBuilder.aWixRequest('').withPetri().withBiCookies().withSession());

      it.skip('context', () =>
        aGet('/req-context').then(res =>
        {
          // TODO -WTF is going on?
          expect(res.headers._headers).to.have.deep.property('x-seen-by', ['seen-by-Kfir'])
        })
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


