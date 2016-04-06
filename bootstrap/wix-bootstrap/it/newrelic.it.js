'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req');

describe('wix bootstrap new relic', function () {
  this.timeout(60000);
  env.start();

  it('should expose new relic via app.locals.newrelic and req.app.locals.newrelic', () => {
    return req.get(env.appUrl('/newrelic')).then(res => {
      expect(res.status).to.equal(200);
      expect(res.json()).to.deep.equal({
        reqTimingHeaders: '',
        appTimingHeaders: ''
      });
    });
  });
});