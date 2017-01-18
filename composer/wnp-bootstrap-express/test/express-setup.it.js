const expect = require('chai').expect,
  testkit = require('wnp-bootstrap-composer-testkit'),
  http = require('wnp-http-test-client');

describe('express setup', function () {
  this.timeout(60000);
  const app = testkit.server('./test/app').beforeAndAfter();

  it('should return "no-cache" as default for caching policy', () =>
    http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('cache-control')).to.equal('no-cache'))
  );

  it('should return header x-seen-by', () =>
    http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('x-seen-by')).to.equal('seen-by-dev'))
  );

  it('should not set etag header', () =>
    http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('etag')).to.equal(null))
  );

  it('should not set x-powered-by header', () =>
    http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('x-powered-by')).to.equal(null))
  );

  it('should have req.ip set from x-forwarded-for header as per secure proxy', () => {
    return http.okGet(app.getUrl('/req/ip'), {headers: {'x-forwarded-for': '192.168.12.12, 192.168.12.10'}})
      .then(res => expect(res.json()).to.have.deep.property('ip', '192.168.12.12')
      );
  });
});
