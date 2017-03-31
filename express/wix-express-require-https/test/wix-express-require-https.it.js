const http = require('wnp-http-test-client'),
  expect = require('chai').use(matchers).expect,
  aspectMiddleware = require('wix-express-aspects'),
  webContextAspect = require('wix-web-context-aspect'),
  requireHttps = require('..'),
  testkit = require('wix-http-testkit');


describe('require https', () => {

  const server =  aServer().beforeAndAfterEach();

  it('should be noop if request is done through https', () =>
    get('/', {
      'x-forwarded-proto': 'https'
    }).then(res => {
      expect(res.status).to.equal(200);
    })
  );

  it('should redirect to https if request is done through http', () =>
    get('/', {
      'x-forwarded-proto': 'http',
      'x-wix-forwarded-url': 'http://example.com/foo?bar=baz'
    }).then(res => {
      expect(res.status).to.equal(301);
      expect(res.headers).to.haveHeaders({location: 'https://example.com/foo?bar=baz'});
    })
  );

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
    var headers = this._obj.raw();
    for (var h in haveHeaders) {
      new chai.Assertion(headers[h]).to.deep.equal([haveHeaders[h]]);
    }
  }
}
