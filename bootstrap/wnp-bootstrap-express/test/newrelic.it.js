'use strict';
const expect = require('chai').expect,
  testkit = require('wnp-composer-testkit'),
  http = require('wnp-http-test-client');

describe('new relic', function () {
  this.timeout(60000);
  const app = testkit.server('./test/app').beforeAndAfter();

  ['/', '/router'].forEach(path => {
    describe(`for an app, mounted on ${path}`, () => {
      it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () =>
        http.okGet(app.getUrl(path + 'newrelic'))
          .then(res => expect(res.json()).to.deep.equal({reqTimingHeaders: '', appTimingHeaders: ''}))
      );
    });
  });
});
