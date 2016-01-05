'use strict';
const testkit = require('wix-bootstrap-testkit'),
  expect = require('chai').expect,
  request = require('request'),
  rpcTestkit = require('wix-rpc-testkit');

describe('app', function () {
  this.timeout(10000);

  const rpcServer = anRpcServer();
  const app = testkit.bootstrapApp('./index.js', {env: {APP_CONF_DIR: './test/configs'}});

  rpcServer.beforeAndAfter();
  app.beforeAndAfter();

  it('should return metasite details by metasiteId', done => {
    request.get(app.getUrl('/site/5ae0b98c-8c82-400c-b76c-a191b71efca5'), (err, res) => {
      expect(res.statusCode).to.equal(200);
      expect(JSON.parse(res.body)).to.contain.deep.property('id', '5ae0b98c-8c82-400c-b76c-a191b71efca5');
      expect(JSON.parse(res.body)).to.contain.deep.property('name', 'das-site');
      done();
    });
  });

  function anRpcServer() {
    const server = rpcTestkit.server({port: 3033});
    server.addHandler('ReadOnlyMetaSiteManager', (req, res) => {
      res.rpc('getMetaSite', (params, respond) => respond({ result: {id: params[0], name: 'das-site'}}));
    });

    return server;
  }
});