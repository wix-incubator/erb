const testkit = require('wix-bootstrap-testkit'),
  http = require('wix-http-test-client'),
  urlParse = require('url').parse,
  expect = require('chai').expect;

describe('require login with redirect', function() {

  this.timeout(10000);                 
  const app = testkit.server('./test/app/test-app-launcher', {env: {WIX_BOOT_LOGIN_URL: 'http://localhost/signin'}}).beforeAndAfter();
  const path = '/required-login-with-redirect-resource';
  
  describe('url', () => {
    
    it('has proper redirect URL', () => {
      return http.get(app.getUrl(path), {redirect: 'manual'}).verify({status: 302, headers: location(hasUrl('http://localhost/signin'))});
    });
    
    it('has originUrl parameter encoded', () => {
      const url = app.getUrl(path);
      return http.get(url, {redirect: 'manual'}).verify({status: 302, headers: location(hasParameter('originUrl', url))});
    });

    it('has redirectTo parameter encoded', () => {
      const url = app.getUrl(path);
      return http.get(url, {redirect: 'manual'}).verify({status: 302, headers: location(hasParameter('redirectTo', url))});
    });
    
    it('retains query string in redirectTo URL', () => {
      const url = app.getUrl(`${path}?a=b&c=d`);
      return http.get(url, {redirect: 'manual'}).verify({status: 302, headers: location(hasParameter('redirectTo', url))});
    });
    
    it('has overrideLocale parameter', () => {
      return http.get(app.getUrl(path), {redirect: 'manual', headers: {'x-wix-language': 'pt'}}).verify({status: 302, headers: location(hasParameter('overrideLocale', 'pt'))});
    });
  });
  
  const location = matcher => headers => matcher(headers.get('location'));
  
  const hasUrl = expected => actual => {
    const url = urlParse(actual);
    const formatted = `${url.protocol}//${url.host}${url.pathname}`;
    expect(formatted).to.equal(expected);
  };
  
  const hasParameter = (name, value) => actual => {
    const url = urlParse(actual, true);
    expect(decodeURI(url.query[name])).to.equal(value);
  };
});
