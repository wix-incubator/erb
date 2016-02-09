'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  fetch = require('node-fetch'),
  rpcTestkit = require('wix-rpc-testkit');

describe('app', function () {
  this.timeout(10000);
  anRpcServer().beforeAndAfter();
  const app = testkit.server('./index').beforeAndAfter();

  it('should return metasite details by metasiteId', () =>
    fetch(app.getUrl('/site/5ae0b98c-8c82-400c-b76c-a191b71efca5')).then(res => {
      expect(res.status).to.equal(200);
      return res.json();
    }).then(json => {
      expect(json).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(json).to.contain.deep.property('name', 'das-site');
    })
  );

  function anRpcServer() {
    const server = rpcTestkit.server({port: 3033});
    server.addHandler('ReadOnlyMetaSiteManager', (req, res) => {
      res.rpc('getMetaSite', (params, respond) => respond({ result: {id: params[0], name: 'das-site'}}));
    });

    return server;
  }
});