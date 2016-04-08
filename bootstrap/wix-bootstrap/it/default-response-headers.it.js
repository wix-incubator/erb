'use strict';
const expect = require('chai').expect,
  env = require('./support/environment'),
  req = require('./support/req');

describe('default headers', function () {
  this.timeout(60000);
  env.start();

  it('should return "no-cache" as default for caching policy', () =>
    req.get(env.appUrl('/aspects/req-context')).then(res =>
      expect(res.headers.get('cache-control')).to.equal('no-cache'))
  );

  it('should return header x-seen-by', () =>
    req.get(env.appUrl('/aspects/req-context')).then(res =>
      expect(res.headers.get('x-seen-by')).to.equal('seen-by-Villus'))
  );
});