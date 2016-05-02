'use strict';
const expect = require('chai').use(require('chai-as-promised')).expect,
  http = require('..'),
  testkit = require('wix-http-testkit');

describe('accept helpers', function () {
  const server = aServer().beforeAndAfter();

  it('should provide http.accept.json as a shortcut for a header(accept -> application/json)', () =>
    http(server.getUrl('/accept-json'), http.accept.json).then(res =>
      expect(res.json()).to.deep.equal({value: 'as-expected-json'}))
  );


  function aServer() {
    const server = testkit.server();
    server.getApp()
      .all('/accept-json', (req, res) => {
        if (req.get('accept') === 'application/json') {
          res.json({value: 'as-expected-json'});
        } else {
          res.send('defaults-to-text');
        }

      });

    return server;
  }
});