'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req');

describe('bypass middlewares', function () {
  this.timeout(60000);
  env.start();
  
  it('should bypass middleware for  "/static/hello"', () =>
    req.get(env.appUrl('/static/hello')).then(res => {
      expect(res.headers._headers['cache-control']).to.be.undefined;
      expect(res.text).to.equal('world');
    }));
});