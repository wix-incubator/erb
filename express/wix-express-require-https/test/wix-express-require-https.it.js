const http = require('wnp-http-test-client'),
  expect = require('chai').use(matchers).expect,
  aspectMiddleware = require('wix-express-aspects'),
  webContextAspect = require('wix-web-context-aspect'),
  requireHttps = require('..'),
  testkit = require('wix-http-testkit');

describe('require https', () => {

  const server = aServer().beforeAndAfterEach();

  describe('in production', () => {
    before(() => process.env['NODE_ENV'] = 'production');
    after(() => delete process.env['NODE_ENV']);

    it('should be noop if request is done through https', () => {
      return get('/', {'x-forwarded-proto': 'https'})
        .then(res => expect(res.status).to.equal(200));
    });
    
    it('should redirect to https if request is done through http', () => {
      return get('/', {
        'x-forwarded-proto': 'http',
        'x-wix-forwarded-url': 'http://example.com/foo?bar=baz'
      }).then(res => {
        expect(res.status).to.equal(301);
        expect(res.headers).to.haveHeaders({location: 'https://example.com/foo?bar=baz'});
      });
    });
  });

  describe('not in production mode', () => {
    before(() => delete process.env['NODE_ENV']);

    it('should be noop', () => {
      return get('/', {'x-forwarded-proto': 'http', 'x-wix-forwarded-url': 'http://example.com/foo?bar=baz'})
        .then(res => expect(res.status).to.equal(200));
    });
  });

  function aServer() {
    const server = testkit.server();
    const aspects = aspectMiddleware.get([webContextAspect.builder()]);
    const app = server.getApp();
    app.set('trust proxy', true);
    app.use([aspects, requireHttps]);
    app.get('/', (req, res) => res.send('ok'));

    return server;
  }

  function get(path, headers) {
    return http.get(server.getUrl(path), {
      redirect: 'manual',
      headers: headers
    });
  }
});

function matchers(chai) {
  chai.Assertion.addMethod('haveHeaders', haveHeaders);

  function haveHeaders(haveHeaders) {
    const headers = this._obj.raw();
    for (const h in haveHeaders) {
      new chai.Assertion(headers[h]).to.deep.equal([haveHeaders[h]]);
    }
  }
}
