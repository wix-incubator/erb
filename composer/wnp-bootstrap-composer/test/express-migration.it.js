const testkit = require('./support/testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch');

describe('wix bootstrap composer', function () {
  this.timeout(10000);

  describe('express 1/2-arg function support', () => {
    const app = testkit.server('express-app-composer').beforeAndAfter();

    it('should support express function with 1 arg (context)', () => {
      return aGet(app.appUrl('/composer-1-arg'))
        .then(res => {
          expect(res.res.headers.get('per-app')).to.be.null;
          expect(res.text).to.equal('ok')
        })
    });

    it('should support express function with 1 args (app, context) where app is injected by composer', () => {
      return aGet(app.appUrl('/composer-2-args'))
        .then(res => {
          expect(res.res.headers.get('per-app')).to.equal('ok');
          expect(res.text).to.equal('ok')
        })
    });
  });

  describe('management-app-composer', () => {
    const app = testkit.server('management-app-composer').beforeAndAfter();

    it('should support managemnt function with 1 arg (context)', () => {
      return aGet(app.managementAppUrl('/management-1-arg'))
        .then(res => {
          expect(res.res.headers.get('per-app')).to.be.null;
          expect(res.text).to.equal('ok')
        })
    });

    it('should support management function with 1 args (app, context) where app is injected by composer', () => {
      return aGet(app.managementAppUrl('/management-2-args'))
        .then(res => {
          expect(res.res.headers.get('per-app')).to.equal('ok');
          expect(res.text).to.equal('ok')
        })
    });
  });
  
  function aGet(url) {
    return fetch(url)
      .then(res => {
        expect(res.status).to.equal(200);
        return res.text().then(text => {
          return {res, text};
        });
      })
  }
});
