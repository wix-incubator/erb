const expect = require('chai').expect,
  http = require('wnp-http-test-client'),
  testkit = require('./testkit');

describe('express setup', function () {
  const appFn = app => app.get('/', (req, res) => res.end())
    .get('/req/ip', (req, res) => res.json({ip: req.ip}))
    .get('/timeout/:duration', (req, res) => setTimeout(() => res.end(), req.params.duration))
    .get('/cookies', (req, res) => res.json(req.cookies));
  const {app} = testkit(appFn, {timeout: 200});
  app.beforeAndAfter();

  it('should decode cookies via cookie-parser and make them available on req.cookies', () => {
    return http.okGet(app.getUrl('/cookies'), {headers: {cookie: 'custom-cookie=123;'}})
      .then(res => expect(res.json()).to.contain.property('custom-cookie', '123'));
  });

  it('should return "no-cache" as default for caching policy', () => {
    return http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('cache-control')).to.equal('no-cache'));
  });

  it('should return header x-seen-by', () => {
    return http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('x-seen-by')).to.be.string('wnp-bootstrap-express'));
  });

  it('should not set etag header', () => {
    return http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('etag')).to.equal(null));
  });

  it('should not set x-powered-by header', () => {
    return http.okGet(app.getUrl('/'))
      .then(res => expect(res.headers.get('x-powered-by')).to.equal(null));
  });

  it('should have req.ip set from x-forwarded-for header as per secure proxy', () => {
    return http.okGet(app.getUrl('/req/ip'), {headers: {'x-forwarded-for': '192.168.12.12, 192.168.12.10'}})
      .then(res => expect(res.json()).to.have.deep.property('ip', '192.168.12.12'));
  });

  it('should respect provided timeout', () => {
    return http.get(app.getUrl('/timeout/500')).then(res =>
      expect(res.status).to.equal(504));
  });
});
