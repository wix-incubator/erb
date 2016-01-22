'use strict';
const expect = require('chai').expect,
  wixRequestBuilder = require('./support/wix-request-builder'),
  env = require('./support/environment'),
  req = require('./support/req');

describe('wix patch response', function () {
  this.timeout(60000);
  env.start();

  ['', '/router'].forEach(basePath => {

    describe('patch response with x-seen-by', () => {
      let opts;
      beforeEach(() => opts = wixRequestBuilder.aWixRequest('').withPetri().withBiCookies().withSession());

      it('should return header x-seen-by', () =>
          aGet('/req-context').then(res =>
              expect(res.headers._headers['x-seen-by']).to.deep.equal(['seen-by-Villus'])
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


