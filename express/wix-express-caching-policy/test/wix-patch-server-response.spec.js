const http = require('wnp-http-test-client'),
  expect = require('chai').use(matchers).expect,
  wixPatchServerResponse = require('wix-patch-server-response'),
  cp = require('..'),
  testkit = require('wix-http-testkit');

describe('chaching policy', () => {
  const server = aServer().beforeAndAfterEach();

  it('should return no cache for default', () =>
    okGet('/default').then(res => {
      expect(res.headers).to.haveHeaders({pragma: 'no-cache', 'cache-control': 'no-cache'})
    })
  );

  it('should return specific age', () =>
    okGet('/specificAge').then(res => {
      expect(res.headers).to.haveHeaders({'cache-control': 'max-age=1000'});
      expect(res.headers).to.notHaveHeader(['pragma']);
    })
  );

  it('should return infinite', () =>
    okGet('/infinite').then(res => {
      expect(res.headers).to.haveHeaders({'cache-control': 'max-age=2419200'});
      expect(res.headers).to.notHaveHeader(['pragma']);
    })
  );

  it('should override cache control per request handler', () =>
    okGet('/inlineOverride').then(res => {
      expect(res.headers).to.haveHeaders({'cache-control': 'max-age=2419200'});
      expect(res.headers).to.notHaveHeader(['pragma']);
    })
  );
  
  it('should return no cache headers', () =>
    okGet('/noHeaders').then(res => {
      expect(res.headers).to.notHaveHeader(['pragma', 'cache-control']);
    })
  );

  it('should return noCache', () =>
    okGet('/noCache').then(res => {
      expect(res.headers).to.haveHeaders({pragma: 'no-cache', 'cache-control': 'no-cache'});
    })
  );

  it('should not override headers if "Pragma" header is already set', () =>
    okGet('/pragmaAlreadySet').then(res => {
      expect(res.headers).to.haveHeaders({'pragma': 'custom-by-handler'});
      expect(res.headers).to.notHaveHeader(['cache-control']);
    })
  );

  it('should not override headers if "Cache-contol" header is already set', () =>
    okGet('/cacheControlAlreadySet').then(res => {
      expect(res.headers).to.haveHeaders({'cache-control': 'custom-by-handler'});
      expect(res.headers).to.notHaveHeader(['pragma']);
    })
  );


  function aServer() {
    const server = testkit.server();
    const app = server.getApp();
    wixPatchServerResponse.patch();

    app.use('/', cp.defaultStrategy());
    app.use('/default', cp.defaultStrategy());
    app.use('/specificAge', cp.specificAge(1000));
    app.use('/infinite', cp.infinite());
    app.use('/noHeaders', cp.noHeaders());
    app.use('/noCache', cp.noCache());

    app.get('/default', (req, res) => res.send('ok'));
    app.get('/cacheControlAlreadySet', (req, res) => {
      res.set('Cache-Control', 'custom-by-handler');
      res.send('ok');
    });
    app.get('/pragmaAlreadySet', (req, res) => {
      res.set('Pragma', 'custom-by-handler');
      res.send('ok');
    });

    app.get('/specificAge', (req, res) => res.send('ok'));
    app.get('/infinite', (req, res) => res.send('ok'));
    app.get('/inlineOverride', cp.infinite(), (req, res) => res.send('ok'));
    app.get('/noHeaders', (req, res) => res.send('ok'));
    app.get('/noCache', (req, res) => res.send('ok'));

    return server;
  }

  function okGet(path) {
    return http.okGet(server.getUrl(path));
  }
});


function matchers(chai) {
  chai.Assertion.addMethod('haveHeaders', haveHeaders);
  chai.Assertion.addMethod('notHaveHeader', notHaveHeader);

  function haveHeaders(haveHeaders) {
    var headers = this._obj.raw();
    for (var h in haveHeaders) {
      new chai.Assertion(headers[h]).to.deep.equal([haveHeaders[h]]);
    }
  }

  function notHaveHeader(notHaveHeaders) {
    var headers = this._obj.raw();
    notHaveHeaders.forEach(h => {
      new chai.Assertion(headers[h]).to.be.undefined;
    });
  }
}
