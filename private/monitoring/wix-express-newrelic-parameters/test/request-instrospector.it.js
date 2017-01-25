const expect = require('chai').use(require('chai-subset')).expect,
  testkit = require('wix-http-testkit'),
  http = require('wnp-http-test-client'),
  introspector = require('../lib/request-introspector');

describe('request-introspector', () => {

  const server = testkit.server().beforeAndAfter();
  const app = server.getApp();

  it('should extract all headers', () => {
    let headers;
    app.get('/', (req, res) => {
      headers = introspector(req);
      res.send();
    });

    return http.okGet(server.getUrl('/'), {headers: {'h1': 'v1', 'h2': 'v2'}}).then(() => {
      return expect(headers).to.containSubset({'h1': 'v1', 'h2': 'v2'});
    });
  });
});
