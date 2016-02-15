'use strict';
const expect = require('chai').expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  env = require('./support/environment'),
  req = require('./support/req');

describe.only('wix patch response', function () {
  this.timeout(60000);
  env.start();

  ['', '/router'].forEach(basePath => {

    describe('caching policy', () => {
      let opts;
      beforeEach(() => opts = wixRequestBuilder.aWixRequest('').withPetri().withBiCookies().withSession());

      it('should return headers for caching policy', () =>
          aGet('/req-context').then(res =>
              expect(res.headers._headers['cache-control']).to.deep.equal(['no-cache'])
          )
      );

      // TODO duplicate code
      function aGet(path) {
        return req.get(env.appUrl(basePath + '/aspects' + path), opts.options()).then(res => {
          expect(res.status).to.equal(200);
          return res;
        });
      }

    });
  });
});


